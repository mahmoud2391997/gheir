import mongoose, { Schema, type Model } from "mongoose";

const { model, models } = mongoose;

export type ProductStatus = "published" | "draft";
export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
export type OrderStatus = "new" | "confirmed" | "in_progress" | "delivered" | "cancelled";
export type InventoryType = "SALE" | "POS_SALE" | "RESTOCK" | "RETURN" | "ADJUSTMENT";

export type ProductDocument = {
  name: string;
  slug: string;
  sku?: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  status: ProductStatus;
  imageKey?: string;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
};

export type OrderDocument = {
  status: OrderStatus;
  customer: { name: string; phone: string; email?: string; address?: string };
  currency: "EGP";
  subtotal: number;
  items: OrderItem[];
  notes?: string;
  clientOrderId?: string;
  stockApplied: boolean;
  stockReleased: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SaleDocument = {
  source: "pos";
  clientSaleId: string;
  deviceId?: string;
  items: { sku: string; name: string; unitPrice: number; quantity: number }[];
  currency: "EGP";
  subtotal: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InventoryDocument = {
  sku: string;
  productId?: string;
  type: InventoryType;
  quantity: number;
  source: "website" | "pos" | "admin";
  referenceId?: string;
  previousStock: number;
  newStock: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadDocument = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  status: LeadStatus;
  score?: number;
  notes?: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentDocument = { key: string; data: unknown; createdAt: Date; updatedAt: Date };
export type RateLimitDocument = { key: string; count: number; resetAt: Date };
export type RevokedTokenDocument = { jti: string; exp: Date };

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true, maxlength: 120 },
    sku: { type: String, trim: true, index: true, maxlength: 80 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "EGP", uppercase: true, maxlength: 8 },
    stock: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "draft", index: true },
    imageKey: { type: String, maxlength: 80 },
    imageUrl: { type: String, maxlength: 500 },
    description: { type: String, maxlength: 4000 },
  },
  { timestamps: true },
);
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ status: 1, category: 1 });

const leadSchema = new Schema<LeadDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, lowercase: true, trim: true, index: true, maxlength: 200 },
    phone: { type: String, trim: true, index: true, maxlength: 40 },
    company: { type: String, maxlength: 160 },
    source: { type: String, default: "website", maxlength: 80 },
    status: { type: String, enum: ["new", "contacted", "qualified", "won", "lost"], default: "new", index: true },
    score: { type: Number, min: 0, max: 100 },
    notes: { type: String, maxlength: 2000 },
    message: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);
leadSchema.index({ status: 1, createdAt: -1 });

const contentSchema = new Schema<ContentDocument>(
  { key: { type: String, required: true, trim: true, unique: true, index: true }, data: { type: Schema.Types.Mixed, required: true } },
  { timestamps: true, minimize: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    status: { type: String, enum: ["new", "confirmed", "in_progress", "delivered", "cancelled"], default: "new", index: true },
    customer: {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 40 },
      email: { type: String, trim: true, maxlength: 200 },
      address: { type: String, trim: true, maxlength: 400 },
    },
    currency: { type: String, enum: ["EGP"], default: "EGP" },
    subtotal: { type: Number, required: true, min: 0 },
    items: [
      {
        id: { type: String, required: true, trim: true, maxlength: 120 },
        slug: { type: String, required: true, trim: true, maxlength: 120 },
        sku: { type: String, required: true, trim: true, maxlength: 80 },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        image: { type: String, trim: true, maxlength: 500 },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, max: 20 },
      },
    ],
    notes: { type: String, trim: true, maxlength: 500 },
    clientOrderId: { type: String, trim: true, maxlength: 80 },
    stockApplied: { type: Boolean, default: false },
    stockReleased: { type: Boolean, default: false },
  },
  { timestamps: true },
);
orderSchema.index({ clientOrderId: 1 }, { unique: true, sparse: true });
orderSchema.index({ createdAt: -1 });

const saleSchema = new Schema<SaleDocument>(
  {
    source: { type: String, enum: ["pos"], default: "pos", index: true },
    clientSaleId: { type: String, required: true, trim: true, maxlength: 80 },
    deviceId: { type: String, trim: true, maxlength: 80 },
    currency: { type: String, enum: ["EGP"], default: "EGP" },
    subtotal: { type: Number, required: true, min: 0 },
    items: [
      {
        sku: { type: String, required: true, trim: true, maxlength: 80 },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        unitPrice: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, max: 500 },
      },
    ],
    paymentMethod: { type: String, trim: true, maxlength: 40 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);
saleSchema.index({ source: 1, clientSaleId: 1 }, { unique: true });
saleSchema.index({ createdAt: -1 });

const inventorySchema = new Schema<InventoryDocument>(
  {
    sku: { type: String, required: true, trim: true, maxlength: 80, index: true },
    productId: { type: String, maxlength: 40 },
    type: { type: String, required: true, enum: ["SALE", "POS_SALE", "RESTOCK", "RETURN", "ADJUSTMENT"], index: true },
    quantity: { type: Number, required: true },
    source: { type: String, required: true, enum: ["website", "pos", "admin"] },
    referenceId: { type: String, maxlength: 80, index: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    createdBy: { type: String, maxlength: 200 },
  },
  { timestamps: true },
);
inventorySchema.index({ sku: 1, createdAt: -1 });

const rateLimitSchema = new Schema<RateLimitDocument>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  resetAt: { type: Date, required: true },
});

const revokedSchema = new Schema<RevokedTokenDocument>({
  jti: { type: String, required: true, unique: true },
  exp: { type: Date, required: true },
});
revokedSchema.index({ exp: 1 }, { expireAfterSeconds: 0 });

export const Product = (models.Product as Model<ProductDocument>) || model<ProductDocument>("Product", productSchema);
export const Lead = (models.Lead as Model<LeadDocument>) || model<LeadDocument>("Lead", leadSchema);
export const Content = (models.Content as Model<ContentDocument>) || model<ContentDocument>("Content", contentSchema);
export const Order = (models.Order as Model<OrderDocument>) || model<OrderDocument>("Order", orderSchema);
export const Sale = (models.Sale as Model<SaleDocument>) || model<SaleDocument>("Sale", saleSchema);
export const InventoryTransaction =
  (models.InventoryTransaction as Model<InventoryDocument>) || model<InventoryDocument>("InventoryTransaction", inventorySchema);
export const RateLimit = (models.RateLimit as Model<RateLimitDocument>) || model<RateLimitDocument>("RateLimit", rateLimitSchema);
export const RevokedToken =
  (models.RevokedToken as Model<RevokedTokenDocument>) || model<RevokedTokenDocument>("RevokedToken", revokedSchema);
