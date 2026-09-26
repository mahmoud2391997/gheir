import mongoose, { type ClientSession } from "mongoose";
import { connectMongo } from "../db/mongoose";
import { InventoryTransaction, Order, Product, Sale, type InventoryType, type OrderStatus } from "../db/models";
import { isDuplicateKey } from "../errors";

export type StockSnapshot = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  currency: "EGP";
  stock: number;
  status: "published" | "draft";
  imageUrl?: string;
  imageKey?: string;
};

export type LedgerRow = {
  sku: string;
  productId?: string;
  type: InventoryType;
  quantity: number;
  source: "website" | "pos" | "admin";
  referenceId?: string;
  previousStock: number;
  newStock: number;
  createdBy?: string;
};

export type StoredOrder = {
  id: string;
  subtotal: number;
  items: { id: string; slug: string; sku: string; name: string; image?: string; unitPrice: number; quantity: number }[];
  stockApplied: boolean;
  stockReleased: boolean;
  status: OrderStatus;
};

export type OrderTx = {
  loadBySkus(skus: string[]): Promise<StockSnapshot[]>;
  reservePublished(sku: string, quantity: number): Promise<{ previousStock: number; newStock: number } | null>;
  applyDelta(sku: string, delta: number): Promise<{ previousStock: number; newStock: number; productId: string } | null>;
  setStock(sku: string, stock: number): Promise<{ previousStock: number; newStock: number; productId: string } | null>;
  findOrderByKey(key: string): Promise<{ id: string; subtotal: number } | null>;
  findOrder(id: string): Promise<StoredOrder | null>;
  insertOrder(doc: {
    customer: { name: string; phone: string; email?: string; address?: string };
    subtotal: number;
    items: StoredOrder["items"];
    clientOrderId?: string;
  }): Promise<string>;
  markReleased(id: string): Promise<void>;
  setOrderStatus(id: string, status: OrderStatus): Promise<StoredOrder | null>;
  findSale(clientSaleId: string): Promise<{ id: string } | null>;
  insertSale(doc: {
    clientSaleId: string;
    deviceId?: string;
    subtotal: number;
    items: { sku: string; name: string; unitPrice: number; quantity: number }[];
    paymentMethod?: string;
    notes?: string;
  }): Promise<string>;
  insertLedger(rows: LedgerRow[]): Promise<void>;
  findSku(sku: string): Promise<StockSnapshot | null>;
  findSlug(slug: string): Promise<StockSnapshot | null>;
  insertProduct(doc: {
    name: string;
    slug: string;
    sku?: string;
    category: string;
    price: number;
    stock: number;
    status: "published" | "draft";
    description?: string;
    imageKey?: string;
    imageUrl?: string;
  }): Promise<StockSnapshot>;
};

export type CommerceGateway = {
  transaction<T>(run: (tx: OrderTx) => Promise<T>): Promise<T>;
};

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value && typeof (value as { toString: unknown }).toString === "function") {
    const rendered = (value as { toString: () => string }).toString();
    return rendered === "[object Object]" ? "" : rendered;
  }
  return "";
}

export function toSnapshot(value: unknown): StockSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const doc = value as Record<string, unknown>;
  const status = doc.status === "published" || doc.status === "draft" ? doc.status : null;
  const sku = text(doc.sku).trim();
  if (!status || !sku || !text(doc.name) || !text(doc.slug)) return null;
  return {
    id: idOf(doc._id),
    sku,
    name: text(doc.name),
    slug: text(doc.slug),
    price: num(doc.price),
    currency: "EGP",
    stock: num(doc.stock),
    status,
    imageUrl: text(doc.imageUrl) || undefined,
    imageKey: text(doc.imageKey) || undefined,
  };
}

function mongoTx(session: ClientSession): OrderTx {
  return {
    async loadBySkus(skus) {
      const docs = await Product.find({ sku: { $in: skus } }).session(session).lean();
      return docs.map(toSnapshot).filter((item): item is StockSnapshot => Boolean(item));
    },
    async reservePublished(sku, quantity) {
      const before = await Product.findOneAndUpdate(
        { sku, status: "published", stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: false, session },
      ).lean();
      const snapshot = toSnapshot(before);
      if (!snapshot) return null;
      return { previousStock: snapshot.stock, newStock: snapshot.stock - quantity };
    },
    async applyDelta(sku, delta) {
      const before = await Product.findOneAndUpdate({ sku }, { $inc: { stock: delta } }, { new: false, session }).lean();
      const snapshot = toSnapshot(before);
      if (!snapshot) return null;
      return { previousStock: snapshot.stock, newStock: snapshot.stock + delta, productId: snapshot.id };
    },
    async setStock(sku, stock) {
      const before = await Product.findOneAndUpdate({ sku }, { $set: { stock } }, { new: false, session }).lean();
      const snapshot = toSnapshot(before);
      if (!snapshot) return null;
      return { previousStock: snapshot.stock, newStock: stock, productId: snapshot.id };
    },
    async findOrderByKey(key) {
      const doc = await Order.findOne({ clientOrderId: key }).session(session).lean();
      if (!doc) return null;
      return { id: idOf(doc._id), subtotal: num(doc.subtotal) };
    },
    async findOrder(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      const doc = await Order.findById(id).session(session).lean();
      if (!doc) return null;
      return {
        id: idOf(doc._id),
        subtotal: num(doc.subtotal),
        items: (doc.items ?? []).map((item) => ({
          id: item.id,
          slug: item.slug,
          sku: item.sku,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
        stockApplied: Boolean(doc.stockApplied),
        stockReleased: Boolean(doc.stockReleased),
        status: doc.status,
      };
    },
    async insertOrder(doc) {
      const created = await Order.create(
        [
          {
            status: "new",
            customer: doc.customer,
            currency: "EGP",
            subtotal: doc.subtotal,
            items: doc.items,
            clientOrderId: doc.clientOrderId,
            stockApplied: true,
            stockReleased: false,
          },
        ],
        { session },
      );
      return created[0]._id.toString();
    },
    async markReleased(id) {
      await Order.updateOne({ _id: id }, { $set: { stockReleased: true, status: "cancelled" } }, { session });
    },
    async setOrderStatus(id, status) {
      const doc = await Order.findByIdAndUpdate(id, { status }, { new: true, session, runValidators: true }).lean();
      if (!doc) return null;
      return {
        id: idOf(doc._id),
        subtotal: num(doc.subtotal),
        items: doc.items ?? [],
        stockApplied: Boolean(doc.stockApplied),
        stockReleased: Boolean(doc.stockReleased),
        status: doc.status,
      };
    },
    findSale: async (clientSaleId) => {
      const doc = await Sale.findOne({ source: "pos", clientSaleId }).session(session).lean();
      return doc ? { id: idOf(doc._id) } : null;
    },
    async insertSale(doc) {
      const created = await Sale.create(
        [
          {
            source: "pos",
            clientSaleId: doc.clientSaleId,
            deviceId: doc.deviceId,
            currency: "EGP",
            subtotal: doc.subtotal,
            items: doc.items,
            paymentMethod: doc.paymentMethod,
            notes: doc.notes,
          },
        ],
        { session },
      );
      return created[0]._id.toString();
    },
    async insertLedger(rows) {
      if (!rows.length) return;
      await InventoryTransaction.create(rows, { session });
    },
    async findSku(sku) {
      const doc = await Product.findOne({ sku }).session(session).lean();
      return toSnapshot(doc);
    },
    async findSlug(slug) {
      const doc = await Product.findOne({ slug }).session(session).lean();
      return toSnapshot(doc);
    },
    async insertProduct(doc) {
      const created = await Product.create(
        [
          {
            name: doc.name,
            slug: doc.slug,
            sku: doc.sku,
            category: doc.category,
            price: doc.price,
            currency: "EGP",
            stock: doc.stock,
            status: doc.status,
            description: doc.description,
            imageKey: doc.imageKey,
            imageUrl: doc.imageUrl,
          },
        ],
        { session },
      );
      return {
        id: created[0]._id.toString(),
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
    },
  };
}

export const mongoGateway: CommerceGateway = {
  async transaction<T>(run: (tx: OrderTx) => Promise<T>): Promise<T> {
    await connectMongo();
    const session = await mongoose.startSession();
    try {
      const holder: { value?: T } = {};
      await session.withTransaction(async () => {
        holder.value = await run(mongoTx(session));
      });
      return holder.value as T;
    } finally {
      await session.endSession();
    }
  },
};

export { isDuplicateKey };
