import express, { type NextFunction, type Request, type Response } from "express";
import { Readable } from "node:stream";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import mongoose from "mongoose";
import { connectMongo } from "./mongodb/client.js";
import { Product, Lead, Content, Order, Sale } from "./mongodb/models.js";
import { downloadAsset, uploadAsset } from "./mongodb/gridfs.js";
import { assertProductionSecrets, DEV_ADMIN_PASSWORD_HASH, DEV_JWT_SECRET } from "./secrets.js";

dotenv.config();
const COOKIE = "gher_admin";
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const writeAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_PUBLIC_WRITES = 10;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) });
function hasValidImageSignature(buffer: Buffer, mimetype: string) {
  if (mimetype === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimetype === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}
function hitLimit(store: Map<string, { count: number; resetAt: number }>, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > max;
}
function isRateLimited(ip: string) {
  return hitLimit(loginAttempts, ip || "unknown", MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
}
function isWriteLimited(ip: string | undefined) {
  return hitLimit(writeAttempts, ip || "unknown", MAX_PUBLIC_WRITES, LOGIN_WINDOW_MS);
}
function clip(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}
const PRODUCT_PATCH_FIELDS = ["name", "slug", "sku", "category", "price", "currency", "stock", "status", "imageKey", "imageUrl", "description"] as const;
function pickProductPatch(body: unknown) {
  if (!body || typeof body !== "object") return {};
  const source = body as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  for (const field of PRODUCT_PATCH_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) update[field] = source[field];
  }
  return update;
}
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const secret = () => process.env.JWT_SECRET?.trim() || DEV_JWT_SECRET;
const adminEmail = () => process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
const adminPasswordHash = () => {
  const configuredHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  return configuredHash && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(configuredHash) ? configuredHash : DEV_ADMIN_PASSWORD_HASH;
};
type CookieRequest = Request & { cookies?: Record<string, string> };
function requireAdmin(req: CookieRequest, res: Response, next: NextFunction) { const token = req.cookies?.[COOKIE]; try { if (!token) throw new Error("missing"); jwt.verify(token, secret()); next(); } catch { res.status(401).json({ error: "Admin authentication required" }); } }
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const validLeadStatuses = ["new", "contacted", "qualified", "won", "lost"] as const;
const posKey = () => process.env.POS_API_KEY?.trim() || "";
const posAllowedOrigins = () =>
  (process.env.POS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
function applyPosCors(req: Request, res: Response) {
  const origin = String(req.headers.origin || "");
  const allowed = posAllowedOrigins();
  if (origin && (allowed.includes("*") || allowed.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  // Allow the headers used by the POS web client (ETag conditional requests trigger preflight).
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-pos-key, If-None-Match");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  // Allow the browser client to read ETag for sync decisions.
  res.setHeader("Access-Control-Expose-Headers", "ETag");
}
function requirePos(req: Request, res: Response, next: NextFunction) {
  applyPosCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  const key = req.headers["x-pos-key"];
  if (!posKey() || typeof key !== "string" || key !== posKey()) return res.status(401).json({ error: "POS authentication required" });
  next();
}

async function getPosInventoryMeta() {
  const [productsCount, latest] = await Promise.all([
    Product.countDocuments({}),
    Product.findOne({}, { updatedAt: 1 }).sort({ updatedAt: -1 }).lean(),
  ]);
  const lastUpdatedAt = (latest as any)?.updatedAt instanceof Date ? ((latest as any).updatedAt as Date) : undefined;
  const inventoryVersion = `${productsCount}:${lastUpdatedAt ? lastUpdatedAt.getTime() : 0}`;
  const etag = `W/"${inventoryVersion}"`;
  return { productsCount, lastUpdatedAt, inventoryVersion, etag };
}

dotenv.config();
export function createExpressApp() {
  assertProductionSecrets();
  const app = express();
  app.set("trust proxy", 1); app.use(express.json({ limit: "1mb" }));
  app.use((req, _res, next) => { const raw = req.headers.cookie || ""; (req as Request & { cookies: Record<string, string> }).cookies = Object.fromEntries(raw.split(";").filter(Boolean).map((part) => { const [key, ...value] = part.trim().split("="); return [key, decodeURIComponent(value.join("="))]; })); next(); });

  // Ensure browser preflights for POS endpoints receive CORS headers.
  // (Express doesn't automatically apply per-route middleware for OPTIONS when only GET/POST are defined.)
  app.options(/^\/api\/pos\/.*$/, (req, res) => {
    applyPosCors(req, res);
    return res.status(204).end();
  });

  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "gher", timestamp: new Date().toISOString() }));
  app.get("/api/content/:key", async (req, res) => { try { await connectMongo(); const doc = await Content.findOne({ key: req.params.key }).lean(); if (!doc) return res.status(404).json({ key: req.params.key, data: null }); res.json({ key: doc.key, data: doc.data }); } catch (error) { console.error("content fetch failed", error); res.status(500).json({ error: "Unable to load content" }); } });
  app.get("/api/products", async (req, res) => { try { const category = typeof req.query.category === "string" ? req.query.category.trim().slice(0, 80) : ""; await connectMongo(); const query: any = { status: "published" }; if (category) query.category = category; const products = await Product.find(query).sort({ createdAt: -1 }).select("-stock").lean(); res.json({ products }); } catch (error) { console.error("products fetch failed", error); res.status(500).json({ error: "Unable to load products" }); } });
  app.get("/api/products/:slug", async (req, res) => { try { await connectMongo(); const product = await Product.findOne({ slug: req.params.slug, status: "published" }).select("-stock").lean(); if (!product) return res.status(404).json({ error: "Product not found" }); res.json({ product }); } catch (error) { console.error("product fetch failed", error); res.status(500).json({ error: "Unable to load product" }); } });
  app.post("/api/leads", async (req, res) => {
    try {
      if (isWriteLimited(req.ip)) return res.status(429).json({ error: "Too many submissions" });
      const name = clip(req.body?.name, 120);
      if (!name) return res.status(400).json({ error: "name is required" });
      const email = clip(req.body?.email, 200);
      const phone = clip(req.body?.phone, 40);
      if (!email && !phone) return res.status(400).json({ error: "email or phone is required" });
      const message = clip(req.body?.message, 2000);
      await connectMongo();
      const lead = await Lead.create({
        name,
        email,
        phone,
        company: clip(req.body?.company, 160),
        source: clip(req.body?.source, 80) ?? "website",
        status: "new",
        message,
        notes: message,
      });
      res.status(201).json({ lead });
    } catch (error) {
      console.error("lead create failed", error);
      res.status(500).json({ error: "Unable to save lead" });
    }
  });
  app.post("/api/orders", async (req, res) => {
    try {
      if (isWriteLimited(req.ip)) return res.status(429).json({ error: "Too many submissions" });
      const { customer, items } = req.body ?? {};
      if (!customer || typeof customer !== "object") return res.status(400).json({ error: "customer is required" });
      const name = clip(customer.name, 120) ?? "";
      const phone = clip(customer.phone, 40) ?? "";
      const email = clip(customer.email, 200);
      const address = clip(customer.address, 400);
      if (!name) return res.status(400).json({ error: "customer.name is required" });
      if (!phone) return res.status(400).json({ error: "customer.phone is required" });
      if (!Array.isArray(items) || items.length === 0 || items.length > 30) return res.status(400).json({ error: "items are required" });

      const normalized = items
        .map((it: any) => ({
          id: String(it.id ?? "").trim().slice(0, 120),
          slug: String(it.slug ?? "").trim().slice(0, 120),
          sku: String(it.sku ?? "").trim().slice(0, 80),
          name: String(it.name ?? "").trim().slice(0, 200),
          image: typeof it.image === "string" ? it.image.trim().slice(0, 500) : undefined,
          unitPrice: Number(it.unitPrice ?? 0),
          quantity: Math.min(20, Math.max(1, Math.floor(Number(it.quantity ?? 1)))),
        }))
        .filter((it: any) => it.id && it.slug && it.sku && it.name && Number.isFinite(it.unitPrice) && it.unitPrice >= 0);
      if (normalized.length === 0) return res.status(400).json({ error: "no valid items" });

      await connectMongo();

      // Known SKUs are priced from Mongo, the same source the POS writes.
      // Catalog-only lines have no inventory row, so they keep the submitted price.
      const skus = normalized.map((i) => i.sku);
      const products = await Product.find({ sku: { $in: skus } }, { sku: 1, name: 1, price: 1 }).lean();
      const bySku = new Map(products.map((p: any) => [String(p.sku ?? ""), p]));
      const priced = normalized.map((it: any) => {
        const row = bySku.get(it.sku);
        if (!row || !Number.isFinite(Number(row.price))) return it;
        return { ...it, name: String(row.name ?? it.name), unitPrice: Number(row.price) };
      });
      const stockItems = priced.filter((i: any) => bySku.has(i.sku)).map((i: any) => ({ sku: i.sku, quantity: i.quantity }));

      const session = await mongoose.startSession();
      let orderId = "";
      try {
        await session.withTransaction(async () => {
          if (stockItems.length) {
            const bulk = await Product.bulkWrite(
              stockItems.map((it) => ({
                updateOne: {
                  filter: { sku: it.sku, stock: { $gte: it.quantity } },
                  update: { $inc: { stock: -it.quantity } },
                },
              })) as any,
              { ordered: true, session },
            );
            if (bulk.modifiedCount !== stockItems.length) {
              throw new Error("OUT_OF_STOCK");
            }
          }

          const subtotal = priced.reduce((sum: number, it: any) => sum + it.unitPrice * it.quantity, 0);
          const order = await Order.create(
            [
              {
                status: "new",
                customer: { name, phone, email, address },
                currency: "EGP",
                subtotal,
                items: priced,
              },
            ],
            { session },
          );
          orderId = order[0]._id.toString();
        });
      } catch (e) {
        if (e instanceof Error && e.message === "OUT_OF_STOCK") {
          return res.status(409).json({ error: "Some items are out of stock" });
        }
        throw e;
      } finally {
        await session.endSession();
      }

      res.status(201).json({ orderId, stockDecrementedSkus: stockItems.map((i) => i.sku) });
    } catch (error) {
      console.error("order create failed", error);
      res.status(500).json({ error: "Unable to place order" });
    }
  });
  const cookieSecure = (req: Request) => req.secure || process.env.NODE_ENV === "production";
  app.post("/api/admin/login", async (req, res) => { try { const { email, password } = req.body ?? {}; if (isRateLimited(req.ip)) return res.status(429).json({ error: "Too many login attempts" }); const validRequest = Boolean(email && password && email === adminEmail()); const validPassword = validRequest ? bcrypt.compareSync(password, adminPasswordHash()) : false; if (!validPassword) return res.status(401).json({ error: "Invalid credentials" }); const token = jwt.sign({ sub: email, role: "admin" }, secret(), { expiresIn: "8h" }); res.cookie(COOKIE, token, { httpOnly: true, secure: cookieSecure(req), sameSite: "strict", maxAge: 8 * 60 * 60 * 1000, path: "/" }); res.json({ authenticated: true }); } catch (error) { console.error("admin login failed", error); res.status(500).json({ error: "Unable to authenticate" }); } });
  app.post("/api/admin/logout", (req, res) => { res.clearCookie(COOKIE, { httpOnly: true, secure: cookieSecure(req), sameSite: "strict", path: "/" }); res.json({ authenticated: false }); });
  app.get("/api/admin/me", requireAdmin, (req, res) => res.json({ authenticated: true, email: req.cookies?.[COOKIE] ? adminEmail() : undefined }));
  app.use("/api/admin", (req, res, next) => req.path === "/login" ? next() : requireAdmin(req, res, next));
  app.get("/api/admin/content", async (_req, res) => { try { await connectMongo(); const keys = await Content.find({}, { key: 1 }).sort({ key: 1 }).lean(); res.json({ keys: keys.map((k) => k.key) }); } catch (error) { console.error("content list failed", error); res.status(500).json({ error: "Unable to list content" }); } });
  app.get("/api/admin/content/:key", async (req, res) => { try { await connectMongo(); const doc = await Content.findOne({ key: req.params.key }).lean(); if (!doc) return res.status(404).json({ key: req.params.key, data: null }); res.json({ key: doc.key, data: doc.data }); } catch (error) { console.error("content get failed", error); res.status(500).json({ error: "Unable to load content" }); } });
  app.put("/api/admin/content/:key", async (req, res) => { try { const data = req.body?.data ?? req.body; if (data === undefined) return res.status(400).json({ error: "content body is required" }); await connectMongo(); const doc = await Content.findOneAndUpdate({ key: req.params.key }, { $set: { key: req.params.key, data } }, { upsert: true, new: true }).lean(); res.json({ key: doc?.key ?? req.params.key, data: doc?.data ?? data }); } catch (error) { console.error("content save failed", error); res.status(500).json({ error: "Unable to save content" }); } });
  app.get("/api/admin/products", async (_req, res) => { try { await connectMongo(); res.json({ products: await Product.find().sort({ createdAt: -1 }).lean() }); } catch { res.status(500).json({ error: "Unable to load products" }); } });
  app.post("/api/admin/products", async (req, res) => {
    try {
      const { name, category, price, stock = 0, status = "draft", description, imageKey, imageUrl, currency = "EGP", slug, sku } = req.body ?? {};
      if (!name || !category || !Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ error: "name, category, and a non-negative price are required" });
      }
      await connectMongo();

      const requestedSku = typeof sku === "string" && sku.trim() ? sku.trim() : "";
      if (requestedSku) {
        const existsSku = await Product.findOne({ sku: requestedSku }).lean();
        if (existsSku) return res.status(409).json({ error: "sku already exists" });
      }

      const requestedSlug = typeof slug === "string" && slug.trim() ? slugify(slug) : "";
      if (requestedSlug) {
        const exists = await Product.findOne({ slug: requestedSlug }).lean();
        if (exists) return res.status(409).json({ error: "slug already exists" });
      }

      const finalSlug = requestedSlug || `${slugify(name)}-${Date.now()}`;
      const product = await Product.create({
        name,
        slug: finalSlug,
        sku: requestedSku || undefined,
        category,
        price: Number(price),
        currency: String(currency || "EGP"),
        stock: Number(stock),
        status,
        description,
        imageKey,
        imageUrl,
      });
      res.status(201).json({ product });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" });
    }
  });
  app.patch("/api/admin/products/:id", async (req, res) => { try { const update = pickProductPatch(req.body); if (!Object.keys(update).length) return res.status(400).json({ error: "No product fields to update" }); await connectMongo(); const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }); if (!product) return res.status(404).json({ error: "Product not found" }); res.json({ product }); } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" }); } });
  app.delete("/api/admin/products/:id", async (req, res) => { await connectMongo(); const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ error: "Product not found" }); res.status(204).end(); });
  app.get("/api/admin/leads", async (_req, res) => { try { await connectMongo(); res.json({ leads: await Lead.find().sort({ createdAt: -1 }).lean() }); } catch { res.status(500).json({ error: "Unable to load leads" }); } });
  app.patch("/api/admin/leads/:id", async (req, res) => { const update: Record<string, unknown> = {}; if (req.body?.status !== undefined) { if (!validLeadStatuses.includes(req.body.status)) return res.status(400).json({ error: "Invalid lead status" }); update.status = req.body.status; } if (typeof req.body?.notes === "string") update.notes = req.body.notes.trim().slice(0, 2000); if (req.body?.score !== undefined) update.score = Number(req.body.score); if (!Object.keys(update).length) return res.status(400).json({ error: "No lead fields to update" }); await connectMongo(); const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.json({ lead }); });
  app.delete("/api/admin/leads/:id", async (req, res) => { await connectMongo(); const lead = await Lead.findByIdAndDelete(req.params.id); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.status(204).end(); });
  app.get("/api/admin/orders", async (_req, res) => { try { await connectMongo(); res.json({ orders: await Order.find().sort({ createdAt: -1 }).lean() }); } catch (error) { console.error("orders list failed", error); res.status(500).json({ error: "Unable to load orders" }); } });
  app.patch("/api/admin/orders/:id", async (req, res) => { try { const status = req.body?.status; const valid = ["new", "confirmed", "in_progress", "delivered", "cancelled"]; if (!valid.includes(status)) return res.status(400).json({ error: "Invalid order status" }); await connectMongo(); const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).lean(); if (!order) return res.status(404).json({ error: "Order not found" }); res.json({ order }); } catch (error) { console.error("order update failed", error); res.status(500).json({ error: "Unable to update order" }); } });
  app.post("/api/admin/assets", upload.single("file"), async (req, res) => { if (!req.file || !hasValidImageSignature(req.file.buffer, req.file.mimetype)) return res.status(400).json({ error: "A JPG, PNG, or WebP image up to 5MB is required" }); const id = await uploadAsset(Readable.from(req.file.buffer), req.file.originalname, req.file.mimetype); res.status(201).json({ id, url: `/api/images/${id}` }); });
  app.get("/api/images/:id", async (req, res) => { try { const stream = await downloadAsset(req.params.id); stream.on("file", (file) => { res.setHeader("Content-Type", file.contentType || "application/octet-stream"); res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); }); stream.on("error", () => res.status(404).end()); stream.pipe(res); } catch { res.status(404).end(); } });

  // POS inventory endpoints (shared stock source of truth)
  app.get("/api/pos/status", requirePos, async (_req, res) => {
    try {
      await connectMongo();
      const meta = await getPosInventoryMeta();
      res.setHeader("Cache-Control", "private, no-cache");
      res.setHeader("ETag", meta.etag);
      res.json({
        ok: true,
        configured: Boolean(posKey()),
        serverTime: new Date().toISOString(),
        productsCount: meta.productsCount,
        lastUpdatedAt: meta.lastUpdatedAt ? meta.lastUpdatedAt.toISOString() : null,
        inventoryVersion: meta.inventoryVersion,
      });
    } catch (error) {
      console.error("pos status failed", error);
      res.status(500).json({ ok: false, error: "Unable to load status" });
    }
  });

  app.get("/api/pos/products", requirePos, async (req, res) => {
    try {
      await connectMongo();
      const meta = await getPosInventoryMeta();

      res.setHeader("Cache-Control", "private, no-cache");
      res.setHeader("ETag", meta.etag);

      const sinceRaw = typeof req.query.since === "string" ? req.query.since.trim() : "";
      if (!sinceRaw) {
        const ifNoneMatch = String(req.headers["if-none-match"] || "");
        if (ifNoneMatch && ifNoneMatch === meta.etag) return res.status(304).end();
      }

      const since = sinceRaw ? new Date(sinceRaw) : null;
      if (sinceRaw && (!since || Number.isNaN(since.getTime()))) {
        return res.status(400).json({ error: "since must be an ISO date string" });
      }

      const query: any = since ? { updatedAt: { $gt: since } } : {};
      const products = await Product.find(
        query,
        { name: 1, sku: 1, slug: 1, category: 1, price: 1, currency: 1, stock: 1, status: 1, imageUrl: 1, imageKey: 1, createdAt: 1, updatedAt: 1 },
      )
        .sort({ updatedAt: -1 })
        .lean();

      res.json({
        products,
        inventoryVersion: meta.inventoryVersion,
        asOf: new Date().toISOString(),
      });
    } catch (error) {
      console.error("pos products failed", error);
      res.status(500).json({ error: "Unable to load products" });
    }
  });

  app.post("/api/pos/sales", requirePos, async (req, res) => {
    try {
      const { clientSaleId, deviceId, items, paymentMethod, notes } = req.body ?? {};
      if (!clientSaleId || typeof clientSaleId !== "string" || !clientSaleId.trim()) return res.status(400).json({ error: "clientSaleId is required" });
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items are required" });
      const normalized = items
        .map((it: any) => ({ sku: String(it.sku ?? "").trim(), quantity: Math.max(1, Math.floor(Number(it.quantity ?? 1))) }))
        .filter((it: any) => it.sku && Number.isFinite(it.quantity) && it.quantity >= 1);
      if (!normalized.length) return res.status(400).json({ error: "no valid items" });

      await connectMongo();

      const existing = await Sale.findOne({ source: "pos", clientSaleId: clientSaleId.trim() }).lean();
      if (existing) return res.json({ saleId: (existing as any)._id?.toString?.() ?? undefined, deduped: true });

      const skus = normalized.map((i) => i.sku);
      const products = await Product.find({ sku: { $in: skus } }, { sku: 1, name: 1, price: 1, currency: 1 }).lean();
      const bySku = new Map(products.map((p: any) => [String(p.sku ?? ""), p]));
      const missing = normalized.filter((i) => !bySku.has(i.sku)).map((i) => i.sku);
      if (missing.length) return res.status(400).json({ error: "Unknown SKU(s)", skus: missing });
      const lineItems = normalized.map((i) => {
        const p = bySku.get(i.sku);
        return { sku: i.sku, name: String(p?.name ?? i.sku), unitPrice: Number(p?.price ?? 0), quantity: i.quantity };
      });
      const subtotal = lineItems.reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);

      const session = await mongoose.startSession();
      let saleId = "";
      let warnings: Array<{ sku: string; stockAfter: number }> = [];
      try {
        await session.withTransaction(async () => {
          // POS sales may occur offline; when syncing back we allow stock to go negative to reflect reality.
          await Product.bulkWrite(
            normalized.map((it) => ({
              updateOne: { filter: { sku: it.sku }, update: { $inc: { stock: -it.quantity } } },
            })) as any,
            { ordered: true, session },
          );
          const updated = await Product.find({ sku: { $in: skus } }, { sku: 1, stock: 1 }).session(session).lean();
          warnings = updated
            .filter((p: any) => typeof p.stock === "number" && p.stock < 0)
            .map((p: any) => ({ sku: String(p.sku ?? ""), stockAfter: Number(p.stock) }));
          const sale = await Sale.create(
            [{ source: "pos", clientSaleId: clientSaleId.trim(), deviceId: typeof deviceId === "string" ? deviceId.trim() : undefined, currency: "EGP", subtotal, items: lineItems, paymentMethod, notes }],
            { session },
          );
          saleId = sale[0]._id.toString();
        });
      } catch (e) {
        if (e instanceof Error && /duplicate key/i.test(e.message)) {
          const ex = await Sale.findOne({ source: "pos", clientSaleId: clientSaleId.trim() }).lean();
          return res.json({ saleId: (ex as any)?._id?.toString?.(), deduped: true });
        }
        throw e;
      } finally {
        await session.endSession();
      }

      res.status(201).json({ saleId, warnings });
    } catch (error) {
      console.error("pos sale failed", error);
      res.status(500).json({ error: "Unable to create sale" });
    }
  });
  return app;
}
export default createExpressApp();
export type App = ReturnType<typeof createExpressApp>;
