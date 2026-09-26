import { connectMongo } from "../db/mongoose";
import { Product } from "../db/models";
import { AppError, isDuplicateKey } from "../errors";
import type { ProductWrite } from "../validation/schemas";
import { mongoGateway, toSnapshot, type CommerceGateway, type StockSnapshot } from "./store";

const publicFields = { name: 1, slug: 1, sku: 1, category: 1, price: 1, currency: 1, status: 1, imageUrl: 1, imageKey: 1, description: 1, createdAt: 1, updatedAt: 1 } as const;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function getProducts(category?: string) {
  await connectMongo();
  const query: { status: "published"; category?: string } = { status: "published" };
  if (category) query.category = category;
  return Product.find(query).sort({ createdAt: -1 }).select(publicFields).lean();
}

export async function getPublishedBySku(sku: string) {
  await connectMongo();
  return Product.findOne({ sku, status: "published" }).lean();
}

export async function getProduct(slug: string) {
  await connectMongo();
  const product = await Product.findOne({ slug, status: "published" }).select({ ...publicFields, stock: 1 }).lean();
  if (!product) throw new AppError("NOT_FOUND", "Product not found", 404);
  return product;
}

export async function listAdminProducts() {
  await connectMongo();
  return Product.find().sort({ createdAt: -1 }).lean();
}

export async function inventorySnapshot() {
  await connectMongo();
  const products = await Product.find({}, { sku: 1, name: 1, stock: 1, price: 1, currency: 1, status: 1, updatedAt: 1 }).sort({ updatedAt: -1 }).lean();
  return products.map(toSnapshot).filter((item): item is StockSnapshot => Boolean(item));
}

export async function inventoryVersion() {
  await connectMongo();
  const [productsCount, latest] = await Promise.all([
    Product.countDocuments({}),
    Product.findOne({}, { updatedAt: 1 }).sort({ updatedAt: -1 }).lean(),
  ]);
  const updatedAt = latest && "updatedAt" in latest && latest.updatedAt instanceof Date ? latest.updatedAt : undefined;
  const version = `${productsCount}:${updatedAt ? updatedAt.getTime() : 0}`;
  return { productsCount, lastUpdatedAt: updatedAt ? updatedAt.toISOString() : null, inventoryVersion: version, etag: `W/"${version}"` };
}

export async function listPosProducts(since?: Date) {
  await connectMongo();
  const query = since ? { updatedAt: { $gt: since } } : {};
  return Product.find(query, {
    name: 1,
    sku: 1,
    slug: 1,
    category: 1,
    price: 1,
    currency: 1,
    stock: 1,
    status: 1,
    imageUrl: 1,
    imageKey: 1,
    createdAt: 1,
    updatedAt: 1,
  })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function createProduct(input: ProductWrite, createdBy: string, gateway: CommerceGateway = mongoGateway) {
  const sku = input.sku?.trim() || undefined;
  const slug = input.slug?.trim() ? slugify(input.slug) : `${slugify(input.name)}-${Date.now()}`;
  try {
    return await gateway.transaction(async (tx) => {
      if (sku && (await tx.findSku(sku))) throw new AppError("VALIDATION_ERROR", "sku already exists", 409);
      if (await tx.findSlug(slug)) throw new AppError("VALIDATION_ERROR", "slug already exists", 409);
      const product = await tx.insertProduct({
        name: input.name,
        slug,
        sku,
        category: input.category,
        price: input.price,
        stock: input.stock ?? 0,
        status: input.status ?? "draft",
        description: input.description,
        imageKey: input.imageKey,
        imageUrl: input.imageUrl,
      });
      if ((input.stock ?? 0) > 0 && sku) {
        await tx.insertLedger([
          {
            sku,
            productId: product.id,
            type: "RESTOCK",
            quantity: input.stock ?? 0,
            source: "admin",
            referenceId: product.id,
            previousStock: 0,
            newStock: input.stock ?? 0,
            createdBy,
          },
        ]);
      }
      return product;
    });
  } catch (error) {
    if (isDuplicateKey(error)) throw new AppError("VALIDATION_ERROR", "sku or slug already exists", 409);
    throw error;
  }
}

export async function updateProduct(id: string, patch: Partial<ProductWrite>) {
  await connectMongo();
  const product = await Product.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).lean();
  if (!product) throw new AppError("NOT_FOUND", "Product not found", 404);
  return product;
}

export async function adjustInventory(sku: string, stock: number, createdBy: string, gateway: CommerceGateway = mongoGateway) {
  return gateway.transaction(async (tx) => {
    const updated = await tx.setStock(sku, stock);
    if (!updated) throw new AppError("NOT_FOUND", "Unknown SKU", 404, { sku });
    if (updated.previousStock !== updated.newStock) {
      const increased = updated.newStock > updated.previousStock;
      await tx.insertLedger([
        {
          sku,
          productId: updated.productId,
          type: increased ? "RESTOCK" : "ADJUSTMENT",
          quantity: updated.newStock - updated.previousStock,
          source: "admin",
          previousStock: updated.previousStock,
          newStock: updated.newStock,
          createdBy,
        },
      ]);
    }
    return updated;
  });
}

export async function deleteProduct(id: string) {
  await connectMongo();
  const product = await Product.findByIdAndDelete(id).lean();
  if (!product) throw new AppError("NOT_FOUND", "Product not found", 404);
}
