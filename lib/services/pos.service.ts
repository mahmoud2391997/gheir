import { AppError, isDuplicateKey } from "../errors";
import type { PosSaleInput } from "../validation/schemas";
import { mongoGateway, type CommerceGateway, type LedgerRow } from "./store";

export type PosSaleResult = {
  saleId?: string;
  deduped: boolean;
  warnings: { sku: string; stockAfter: number }[];
  subtotal: number;
};

function merge(items: { sku: string; quantity: number }[]) {
  const totals = new Map<string, number>();
  for (const item of items) totals.set(item.sku, (totals.get(item.sku) ?? 0) + item.quantity);
  return [...totals.entries()].map(([sku, quantity]) => ({ sku, quantity }));
}

export async function processPosSale(input: PosSaleInput, gateway: CommerceGateway = mongoGateway): Promise<PosSaleResult> {
  const lines = merge(input.items);
  try {
    return await gateway.transaction(async (tx) => {
      const existing = await tx.findSale(input.clientSaleId);
      if (existing) return { saleId: existing.id, deduped: true, warnings: [], subtotal: 0 };

      const products = await tx.loadBySkus(lines.map((line) => line.sku));
      const bySku = new Map(products.map((product) => [product.sku, product]));
      const missing = lines.filter((line) => !bySku.has(line.sku)).map((line) => line.sku);
      if (missing.length) throw new AppError("NOT_FOUND", "Unknown SKU", 404, { skus: missing });

      const sold: { sku: string; name: string; unitPrice: number; quantity: number }[] = [];
      const warnings: { sku: string; stockAfter: number }[] = [];
      const ledger: LedgerRow[] = [];

      for (const line of lines) {
        const product = bySku.get(line.sku);
        if (!product) throw new AppError("NOT_FOUND", "Unknown SKU", 404, { sku: line.sku });
        const updated = await tx.applyDelta(line.sku, -line.quantity);
        if (!updated) throw new AppError("NOT_FOUND", "Unknown SKU", 404, { sku: line.sku });
        if (updated.newStock < 0) warnings.push({ sku: line.sku, stockAfter: updated.newStock });
        sold.push({ sku: product.sku, name: product.name, unitPrice: product.price, quantity: line.quantity });
        ledger.push({
          sku: product.sku,
          productId: updated.productId,
          type: "POS_SALE",
          quantity: -line.quantity,
          source: "pos",
          previousStock: updated.previousStock,
          newStock: updated.newStock,
          createdBy: input.deviceId || "pos",
        });
      }

      const subtotal = sold.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
      const saleId = await tx.insertSale({
        clientSaleId: input.clientSaleId,
        deviceId: input.deviceId,
        subtotal,
        items: sold,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
      });
      await tx.insertLedger(ledger.map((row) => ({ ...row, referenceId: saleId })));
      return { saleId, deduped: false, warnings, subtotal };
    });
  } catch (error) {
    if (isDuplicateKey(error)) {
      const existing = await gateway.transaction(async (tx) => tx.findSale(input.clientSaleId));
      if (existing) return { saleId: existing.id, deduped: true, warnings: [], subtotal: 0 };
      throw new AppError("DUPLICATE_SALE", "Sale already exists", 409);
    }
    throw error;
  }
}

export async function syncPosSales(sales: PosSaleInput[], gateway: CommerceGateway = mongoGateway) {
  const results: Array<PosSaleResult & { clientSaleId: string; error?: { code: string; message: string } }> = [];
  for (const sale of sales) {
    try {
      const result = await processPosSale(sale, gateway);
      results.push({ clientSaleId: sale.clientSaleId, ...result });
    } catch (error) {
      const message = error instanceof AppError ? error.message : "Unable to sync sale";
      const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
      results.push({ clientSaleId: sale.clientSaleId, deduped: false, warnings: [], subtotal: 0, error: { code, message } });
    }
  }
  return { results };
}
