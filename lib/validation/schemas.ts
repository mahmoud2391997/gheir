import { z } from "zod";

const sku = z.string().trim().min(1).max(80);
const quantity = z.number().int().positive().max(20);

export const orderRequestSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(1).max(40),
    email: z.union([z.string().trim().email().max(200), z.literal("")]).optional(),
    address: z.string().trim().max(400).optional(),
  }),
  items: z.array(z.object({ sku, quantity })).min(1).max(30),
});

export const posSaleSchema = z.object({
  clientSaleId: z.string().trim().min(1).max(80),
  deviceId: z.string().trim().max(80).optional(),
  paymentMethod: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        sku,
        quantity: z.number().int().positive().max(500),
      }),
    )
    .min(1)
    .max(100),
});

export const posSyncSchema = z.object({
  sales: z.array(posSaleSchema).min(1).max(50),
});

export const posAuthSchema = z.object({
  apiKey: z.string().min(1).max(200),
});

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.union([z.string().trim().email().max(200), z.literal("")]).optional(),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(80).optional(),
});

export const productWriteSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(80),
  price: z.number().min(0),
  stock: z.number().int().min(0).max(1_000_000).optional(),
  status: z.enum(["published", "draft"]).optional(),
  description: z.string().trim().max(4000).optional(),
  imageKey: z.string().trim().max(80).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  currency: z.literal("EGP").optional(),
  slug: z.string().trim().max(120).optional(),
  sku: z.string().trim().max(80).optional(),
});

export const productPatchSchema = productWriteSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "No product fields to update",
});

export const inventoryAdjustSchema = z.object({
  sku,
  stock: z.number().int().min(0).max(1_000_000),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const leadPatchSchema = z
  .object({
    status: z.enum(["new", "contacted", "qualified", "won", "lost"]).optional(),
    notes: z.string().trim().max(2000).optional(),
    score: z.number().min(0).max(100).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No lead fields to update" });

export const orderStatusSchema = z.object({
  status: z.enum(["new", "confirmed", "in_progress", "delivered", "cancelled"]),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
export type PosSaleInput = z.infer<typeof posSaleSchema>;
export type ProductWrite = z.infer<typeof productWriteSchema>;
