import { isDuplicateKey } from "@/lib/errors";
import type { CommerceGateway, LedgerRow, OrderTx, StockSnapshot, StoredOrder } from "@/lib/services/store";

type MemoryOrder = StoredOrder & { clientOrderId?: string };
type MemorySale = { id: string; clientSaleId: string; subtotal: number };

export type MemoryState = {
  products: StockSnapshot[];
  orders: MemoryOrder[];
  sales: MemorySale[];
  ledger: LedgerRow[];
};

function duplicate() {
  const error = new Error("duplicate key");
  return Object.assign(error, { code: 11000 });
}

function tx(state: MemoryState): OrderTx {
  let sequence = state.orders.length + state.sales.length + state.products.length + 1;
  const id = () => String(sequence++);
  return {
    async loadBySkus(skus) {
      return state.products.filter((product) => skus.includes(product.sku)).map((product) => ({ ...product }));
    },
    async reservePublished(sku, quantity) {
      const product = state.products.find((item) => item.sku === sku && item.status === "published" && item.stock >= quantity);
      if (!product) return null;
      const previousStock = product.stock;
      product.stock -= quantity;
      return { previousStock, newStock: product.stock };
    },
    async applyDelta(sku, delta) {
      const product = state.products.find((item) => item.sku === sku);
      if (!product) return null;
      const previousStock = product.stock;
      product.stock += delta;
      return { previousStock, newStock: product.stock, productId: product.id };
    },
    async setStock(sku, stock) {
      const product = state.products.find((item) => item.sku === sku);
      if (!product) return null;
      const previousStock = product.stock;
      product.stock = stock;
      return { previousStock, newStock: stock, productId: product.id };
    },
    async findOrderByKey(key) {
      const order = state.orders.find((item) => item.clientOrderId === key);
      return order ? { id: order.id, subtotal: order.subtotal } : null;
    },
    async findOrder(orderId) {
      return state.orders.find((item) => item.id === orderId) ?? null;
    },
    async insertOrder(doc) {
      if (doc.clientOrderId && state.orders.some((item) => item.clientOrderId === doc.clientOrderId)) throw duplicate();
      const order: MemoryOrder = {
        id: id(),
        subtotal: doc.subtotal,
        items: doc.items,
        stockApplied: true,
        stockReleased: false,
        status: "new",
        clientOrderId: doc.clientOrderId,
      };
      state.orders.push(order);
      return order.id;
    },
    async markReleased(orderId) {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) return;
      order.stockReleased = true;
      order.status = "cancelled";
    },
    async setOrderStatus(orderId, status) {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) return null;
      order.status = status;
      return order;
    },
    async findSale(clientSaleId) {
      const sale = state.sales.find((item) => item.clientSaleId === clientSaleId);
      return sale ? { id: sale.id } : null;
    },
    async insertSale(doc) {
      if (state.sales.some((item) => item.clientSaleId === doc.clientSaleId)) throw duplicate();
      const sale = { id: id(), clientSaleId: doc.clientSaleId, subtotal: doc.subtotal };
      state.sales.push(sale);
      return sale.id;
    },
    async insertLedger(rows) {
      state.ledger.push(...rows);
    },
    async findSku(sku) {
      return state.products.find((item) => item.sku === sku) ?? null;
    },
    async findSlug(slug) {
      return state.products.find((item) => item.slug === slug) ?? null;
    },
    async insertProduct(doc) {
      const product: StockSnapshot = {
        id: id(),
        sku: doc.sku ?? "",
        name: doc.name,
        slug: doc.slug,
        price: doc.price,
        currency: "EGP",
        stock: doc.stock,
        status: doc.status,
        imageUrl: doc.imageUrl,
        imageKey: doc.imageKey,
      };
      state.products.push(product);
      return product;
    },
  };
}

export function createMemoryGateway(products: StockSnapshot[]) {
  const state: MemoryState = { products: products.map((product) => ({ ...product })), orders: [], sales: [], ledger: [] };
  let chain = Promise.resolve();
  const gateway: CommerceGateway = {
    transaction(run) {
      const job = chain.then(async () => {
        const snapshot = structuredClone(state);
        try {
          return await run(tx(state));
        } catch (error) {
          state.products = snapshot.products;
          state.orders = snapshot.orders;
          state.sales = snapshot.sales;
          state.ledger = snapshot.ledger;
          throw error;
        }
      });
      chain = job.then(
        () => undefined,
        () => undefined,
      );
      return job;
    },
  };
  return { gateway, state, isDuplicateKey };
}
