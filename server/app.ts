import express, { type NextFunction, type Request, type Response } from "express";
import { Readable } from "node:stream";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { connectMongo } from "./mongodb/client.js";
import { Product, Lead, Content, Order } from "./mongodb/models.js";
import { downloadAsset, uploadAsset } from "./mongodb/gridfs.js";

dotenv.config();
const COOKIE = "gher_admin";
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) });
function hasValidImageSignature(buffer: Buffer, mimetype: string) {
  if (mimetype === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimetype === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}
function isRateLimited(ip: string) {
  const now = Date.now();
  const current = loginAttempts.get(ip);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_LOGIN_ATTEMPTS;
}
const DEFAULT_ADMIN_EMAIL = "admin@example.com";
// Development fallback only; production should always provide ADMIN_PASSWORD_HASH.
const DEFAULT_ADMIN_PASSWORD_HASH = "$2b$12$6TXWk8ODs9L09dOTbOt4BeSYxC/AVU82R/GApFjIZf24yEwkaxNGy";
const secret = () => process.env.JWT_SECRET || "development-jwt-secret-change-me";
const adminEmail = () => process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
const adminPasswordHash = () => {
  const configuredHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  return configuredHash && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(configuredHash) ? configuredHash : DEFAULT_ADMIN_PASSWORD_HASH;
};
type CookieRequest = Request & { cookies?: Record<string, string> };
function requireAdmin(req: CookieRequest, res: Response, next: NextFunction) { const token = req.cookies?.[COOKIE]; try { if (!token) throw new Error("missing"); jwt.verify(token, secret()); next(); } catch { res.status(401).json({ error: "Admin authentication required" }); } }
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const validLeadStatuses = ["new", "contacted", "qualified", "won", "lost"] as const;

dotenv.config();
export function createExpressApp() {
  const app = express();
  app.set("trust proxy", 1); app.use(express.json({ limit: "1mb" }));
  app.use((req, _res, next) => { const raw = req.headers.cookie || ""; (req as Request & { cookies: Record<string, string> }).cookies = Object.fromEntries(raw.split(";").filter(Boolean).map((part) => { const [key, ...value] = part.trim().split("="); return [key, decodeURIComponent(value.join("="))]; })); next(); });
  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "gher", timestamp: new Date().toISOString() }));
  app.get("/api/content/:key", async (req, res) => { try { await connectMongo(); const doc = await Content.findOne({ key: req.params.key }).lean(); if (!doc) return res.status(404).json({ key: req.params.key, data: null }); res.json({ key: doc.key, data: doc.data }); } catch (error) { console.error("content fetch failed", error); res.status(500).json({ error: "Unable to load content" }); } });
  app.get("/api/products", async (req, res) => { try { const category = typeof req.query.category === "string" ? req.query.category.trim() : ""; await connectMongo(); const query: any = { status: "published" }; if (category) query.category = category; const products = await Product.find(query).sort({ createdAt: -1 }).lean(); res.json({ products }); } catch (error) { console.error("products fetch failed", error); res.status(500).json({ error: "Unable to load products" }); } });
  app.get("/api/products/:slug", async (req, res) => { try { await connectMongo(); const product = await Product.findOne({ slug: req.params.slug, status: "published" }).lean(); if (!product) return res.status(404).json({ error: "Product not found" }); res.json({ product }); } catch (error) { console.error("product fetch failed", error); res.status(500).json({ error: "Unable to load product" }); } });
  app.post("/api/leads", async (req, res) => { try { const { name, email, phone, company, message, source = "website" } = req.body ?? {}; if (!name || typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "name is required" }); const safeEmail = typeof email === "string" && email.trim() ? email.trim() : undefined; const safePhone = typeof phone === "string" && phone.trim() ? phone.trim() : undefined; if (!safeEmail && !safePhone) return res.status(400).json({ error: "email or phone is required" }); await connectMongo(); const lead = await Lead.create({ name: name.trim(), email: safeEmail, phone: safePhone, company: typeof company === "string" && company.trim() ? company.trim() : undefined, source: typeof source === "string" && source.trim() ? source.trim() : "website", status: "new", message: typeof message === "string" && message.trim() ? message.trim() : undefined, notes: typeof message === "string" && message.trim() ? message.trim() : undefined }); res.status(201).json({ lead }); } catch (error) { console.error("lead create failed", error); res.status(500).json({ error: "Unable to save lead" }); } });
  app.post("/api/orders", async (req, res) => { try { const { customer, items } = req.body ?? {}; if (!customer || typeof customer !== "object") return res.status(400).json({ error: "customer is required" }); const name = typeof customer.name === "string" ? customer.name.trim() : ""; const phone = typeof customer.phone === "string" ? customer.phone.trim() : ""; const email = typeof customer.email === "string" ? customer.email.trim() : undefined; const address = typeof customer.address === "string" ? customer.address.trim() : undefined; if (!name) return res.status(400).json({ error: "customer.name is required" }); if (!phone) return res.status(400).json({ error: "customer.phone is required" }); if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items are required" }); const normalized = items.map((it: any) => ({ id: String(it.id ?? "").trim(), slug: String(it.slug ?? "").trim(), sku: String(it.sku ?? "").trim(), name: String(it.name ?? "").trim(), image: typeof it.image === "string" ? it.image : undefined, unitPrice: Number(it.unitPrice ?? 0), quantity: Math.max(1, Math.floor(Number(it.quantity ?? 1))) })).filter((it: any) => it.id && it.slug && it.sku && it.name && Number.isFinite(it.unitPrice) && it.unitPrice >= 0); if (normalized.length === 0) return res.status(400).json({ error: "no valid items" }); const subtotal = normalized.reduce((sum: number, it: any) => sum + it.unitPrice * it.quantity, 0); await connectMongo(); const order = await Order.create({ status: "new", customer: { name, phone, email, address }, currency: "EGP", subtotal, items: normalized }); res.status(201).json({ orderId: order._id.toString() }); } catch (error) { console.error("order create failed", error); res.status(500).json({ error: "Unable to place order" }); } });
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
      const { name, category, price, stock = 0, status = "draft", description, imageKey, imageUrl, currency = "EGP", slug } = req.body ?? {};
      if (!name || !category || !Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ error: "name, category, and a non-negative price are required" });
      }
      await connectMongo();

      const requestedSlug = typeof slug === "string" && slug.trim() ? slugify(slug) : "";
      if (requestedSlug) {
        const exists = await Product.findOne({ slug: requestedSlug }).lean();
        if (exists) return res.status(409).json({ error: "slug already exists" });
      }

      const finalSlug = requestedSlug || `${slugify(name)}-${Date.now()}`;
      const product = await Product.create({
        name,
        slug: finalSlug,
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
  app.patch("/api/admin/products/:id", async (req, res) => { try { await connectMongo(); const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!product) return res.status(404).json({ error: "Product not found" }); res.json({ product }); } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" }); } });
  app.delete("/api/admin/products/:id", async (req, res) => { await connectMongo(); const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ error: "Product not found" }); res.status(204).end(); });
  app.get("/api/admin/leads", async (_req, res) => { try { await connectMongo(); res.json({ leads: await Lead.find().sort({ createdAt: -1 }).lean() }); } catch { res.status(500).json({ error: "Unable to load leads" }); } });
  app.patch("/api/admin/leads/:id", async (req, res) => { if (req.body.status && !validLeadStatuses.includes(req.body.status)) return res.status(400).json({ error: "Invalid lead status" }); await connectMongo(); const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.json({ lead }); });
  app.delete("/api/admin/leads/:id", async (req, res) => { await connectMongo(); const lead = await Lead.findByIdAndDelete(req.params.id); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.status(204).end(); });
  app.get("/api/admin/orders", async (_req, res) => { try { await connectMongo(); res.json({ orders: await Order.find().sort({ createdAt: -1 }).lean() }); } catch (error) { console.error("orders list failed", error); res.status(500).json({ error: "Unable to load orders" }); } });
  app.patch("/api/admin/orders/:id", async (req, res) => { try { const status = req.body?.status; const valid = ["new", "confirmed", "in_progress", "delivered", "cancelled"]; if (status && !valid.includes(status)) return res.status(400).json({ error: "Invalid order status" }); await connectMongo(); const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean(); if (!order) return res.status(404).json({ error: "Order not found" }); res.json({ order }); } catch (error) { console.error("order update failed", error); res.status(500).json({ error: "Unable to update order" }); } });
  app.post("/api/admin/assets", upload.single("file"), async (req, res) => { if (!req.file || !hasValidImageSignature(req.file.buffer, req.file.mimetype)) return res.status(400).json({ error: "A JPG, PNG, or WebP image up to 5MB is required" }); const id = await uploadAsset(Readable.from(req.file.buffer), req.file.originalname, req.file.mimetype); res.status(201).json({ id, url: `/api/images/${id}` }); });
  app.get("/api/images/:id", async (req, res) => { try { const stream = await downloadAsset(req.params.id); stream.on("file", (file) => { res.setHeader("Content-Type", file.contentType || "application/octet-stream"); res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); }); stream.on("error", () => res.status(404).end()); stream.pipe(res); } catch { res.status(404).end(); } });
  return app;
}
export default createExpressApp();
export type App = ReturnType<typeof createExpressApp>;
