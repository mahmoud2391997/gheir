import mongoose, { Schema, type Model } from "mongoose";

const { model, models } = mongoose;

export type ProductDocument = { name: string; slug: string; category: string; price: number; currency: string; stock: number; status: "published" | "draft"; imageKey?: string; description?: string; createdAt: Date; updatedAt: Date };
export type LeadDocument = { name: string; email?: string; phone?: string; company?: string; source: string; status: "new" | "contacted" | "qualified" | "won" | "lost"; score?: number; notes?: string; message?: string; createdAt: Date; updatedAt: Date };
export type ContentDocument = { key: string; data: unknown; createdAt: Date; updatedAt: Date };

const productSchema = new Schema<ProductDocument>({ name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true, index: true }, category: { type: String, required: true, trim: true }, price: { type: Number, required: true, min: 0 }, currency: { type: String, default: "USD", uppercase: true }, stock: { type: Number, default: 0, min: 0 }, status: { type: String, enum: ["published", "draft"], default: "draft", index: true }, imageKey: String, description: String }, { timestamps: true });
const leadSchema = new Schema<LeadDocument>({ name: { type: String, required: true, trim: true }, email: { type: String, lowercase: true, trim: true, index: true }, phone: { type: String, trim: true, index: true }, company: String, source: { type: String, default: "website" }, status: { type: String, enum: ["new", "contacted", "qualified", "won", "lost"], default: "new", index: true }, score: { type: Number, min: 0, max: 100 }, notes: String, message: String }, { timestamps: true });
const contentSchema = new Schema<ContentDocument>({ key: { type: String, required: true, trim: true, unique: true, index: true }, data: { type: Schema.Types.Mixed, required: true } }, { timestamps: true, minimize: false });

export const Product = (models.Product as Model<ProductDocument>) || model<ProductDocument>("Product", productSchema);
export const Lead = (models.Lead as Model<LeadDocument>) || model<LeadDocument>("Lead", leadSchema);
export const Content = (models.Content as Model<ContentDocument>) || model<ContentDocument>("Content", contentSchema);
