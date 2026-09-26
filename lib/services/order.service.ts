import { connectMongo } from "../db/mongoose";
import { Order } from "../db/models";
import { AppError, isDuplicateKey } from "../errors";
import type { OrderRequest } from "../validation/schemas";
import { mongoGateway, type CommerceGateway, type LedgerRow, type StockSnapshot } from "./store";

export type PricedLine = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
};

export type OrderResult = {
  orderId: string;
  subtotal: number;
  currency: "EGP";
  items: PricedLine[];
  deduped: boolean;
};

function mergeQuantities(items: { sku: string; quantity: number }[]) {
  const totals = new Map<string, number>();
  for (const item of items) totals.set(item.sku, (totals.get(item.sku) ?? 0) + item.quantity);
  for (const [sku, quantity] of totals) {
    if (quantity > 20) throw new AppError("VALIDATION_ERROR", "Quantity is too large", 400, { sku });
  }
  return [...totals.entries()].map(([sku, quantity]) => ({ sku, quantity }));
}

function imageOf(product: StockSnapshot) {
  if (product.imageUrl) return product.imageUrl;
  if (product.imageKey) return `/api/images/${product.imageKey}`;
  return undefined;
}

export async function createOrder(input: OrderRequest, clientOrderId?: string, gateway: CommerceGateway = mongoGateway): Promise<OrderResult> {
  const lines = mergeQuantities(input.items);
  const customer = {
    name: input.customer.name,
    phone: input.customer.phone,
    email: input.customer.email || undefined,
    address: input.customer.address || undefined,
  };

  try {
    return await gateway.transaction(async (tx) => {
      if (clientOrderId) {
        const existing = await tx.findOrderByKey(clientOrderId);
        if (existing) {
          return { orderId: existing.id, subtotal: existing.subtotal, currency: "EGP" as const, items: [], deduped: true };
        }
      }

      const products = await tx.loadBySkus(lines.map((line) => line.sku));
      const bySku = new Map(products.map((product) => [product.sku, product]));
      const priced: PricedLine[] = [];
      const ledger: LedgerRow[] = [];

      for (const line of lines) {
        const product = bySku.get(line.sku);
        if (!product) throw new AppError("NOT_FOUND", "Unknown SKU", 404, { sku: line.sku });
        if (product.status !== "published") {
          throw new AppError("VALIDATION_ERROR", "Product is not available", 400, { sku: line.sku });
        }
        const reserved = await tx.reservePublished(line.sku, line.quantity);
        if (!reserved) throw new AppError("OUT_OF_STOCK", "Product is out of stock", 409, { sku: line.sku });
        priced.push({
          id: product.id || line.sku,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          image: imageOf(product),
          unitPrice: product.price,
          quantity: line.quantity,
        });
        ledger.push({
          sku: product.sku,
          productId: product.id,
          type: "SALE",
          quantity: -line.quantity,
          source: "website",
          previousStock: reserved.previousStock,
          newStock: reserved.newStock,
          createdBy: "website",
        });
      }

      const subtotal = priced.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
      const orderId = await tx.insertOrder({ customer, subtotal, items: priced, clientOrderId });
      await tx.insertLedger(ledger.map((row) => ({ ...row, referenceId: orderId })));
      return { orderId, subtotal, currency: "EGP" as const, items: priced, deduped: false };
    });
  } catch (error) {
    if (clientOrderId && isDuplicateKey(error)) {
      const existing = await gateway.transaction(async (tx) => tx.findOrderByKey(clientOrderId));
      if (existing) return { orderId: existing.id, subtotal: existing.subtotal, currency: "EGP", items: [], deduped: true };
      throw new AppError("DUPLICATE_ORDER", "Order already exists", 409);
    }
    throw error;
  }
}

export async function listOrders() {
  await connectMongo();
  return Order.find().sort({ createdAt: -1 }).lean();
}

export async function cancelOrder(id: string, gateway: CommerceGateway = mongoGateway) {
  return gateway.transaction(async (tx) => {
    const order = await tx.findOrder(id);
    if (!order) throw new AppError("NOT_FOUND", "Order not found", 404);
    if (order.status === "cancelled" || order.stockReleased || !order.stockApplied) {
      if (order.status !== "cancelled") await tx.setOrderStatus(id, "cancelled");
      return { id, released: false };
    }
    const ledger: LedgerRow[] = [];
    for (const item of order.items) {
      const updated = await tx.applyDelta(item.sku, item.quantity);
      if (!updated) continue;
      ledger.push({
        sku: item.sku,
        productId: updated.productId,
        type: "RETURN",
        quantity: item.quantity,
        source: "website",
        referenceId: id,
        previousStock: updated.previousStock,
        newStock: updated.newStock,
        createdBy: "admin",
      });
    }
    await tx.insertLedger(ledger);
    await tx.markReleased(id);
    return { id, released: true };
  });
}

export async function updateOrderStatus(id: string, status: "new" | "confirmed" | "in_progress" | "delivered" | "cancelled", gateway: CommerceGateway = mongoGateway) {
  if (status === "cancelled") return cancelOrder(id, gateway);
  return gateway.transaction(async (tx) => {
    const order = await tx.setOrderStatus(id, status);
    if (!order) throw new AppError("NOT_FOUND", "Order not found", 404);
    return order;
  });
}
