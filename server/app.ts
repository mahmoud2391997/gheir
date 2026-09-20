import express, { type NextFunction, type Request, type Response } from "express";
import { Readable } from "node:stream";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { connectMongo } from "./mongodb/client.js";
import { Product, Lead } from "./mongodb/models.js";
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
  const cookieSecure = (req: Request) => req.secure || process.env.NODE_ENV === "production";
  app.post("/api/admin/login", async (req, res) => { try { const { email, password } = req.body ?? {}; if (isRateLimited(req.ip)) return res.status(429).json({ error: "Too many login attempts" }); const validRequest = Boolean(email && password && email === adminEmail()); const validPassword = validRequest ? bcrypt.compareSync(password, adminPasswordHash()) : false; if (!validPassword) return res.status(401).json({ error: "Invalid credentials" }); const token = jwt.sign({ sub: email, role: "admin" }, secret(), { expiresIn: "8h" }); res.cookie(COOKIE, token, { httpOnly: true, secure: cookieSecure(req), sameSite: "strict", maxAge: 8 * 60 * 60 * 1000, path: "/" }); res.json({ authenticated: true }); } catch (error) { console.error("admin login failed", error); res.status(500).json({ error: "Unable to authenticate" }); } });
  app.post("/api/admin/logout", (req, res) => { res.clearCookie(COOKIE, { httpOnly: true, secure: cookieSecure(req), sameSite: "strict", path: "/" }); res.json({ authenticated: false }); });
  app.get("/api/admin/me", requireAdmin, (req, res) => res.json({ authenticated: true, email: req.cookies?.[COOKIE] ? adminEmail() : undefined }));
  app.use("/api/admin", (req, res, next) => req.path === "/login" ? next() : requireAdmin(req, res, next));
  app.get("/api/admin/products", async (_req, res) => { try { await connectMongo(); res.json({ products: await Product.find().sort({ createdAt: -1 }).lean() }); } catch { res.status(500).json({ error: "Unable to load products" }); } });
  app.post("/api/admin/products", async (req, res) => { try { const { name, category, price, stock = 0, status = "draft", description, imageKey } = req.body ?? {}; if (!name || !category || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ error: "name, category, and a non-negative price are required" }); await connectMongo(); const product = await Product.create({ name, slug: `${slugify(name)}-${Date.now()}`, category, price: Number(price), stock: Number(stock), status, description, imageKey }); res.status(201).json({ product }); } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" }); } });
  app.patch("/api/admin/products/:id", async (req, res) => { try { await connectMongo(); const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!product) return res.status(404).json({ error: "Product not found" }); res.json({ product }); } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" }); } });
  app.delete("/api/admin/products/:id", async (req, res) => { await connectMongo(); const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ error: "Product not found" }); res.status(204).end(); });
  app.get("/api/admin/leads", async (_req, res) => { try { await connectMongo(); res.json({ leads: await Lead.find().sort({ createdAt: -1 }).lean() }); } catch { res.status(500).json({ error: "Unable to load leads" }); } });
  app.patch("/api/admin/leads/:id", async (req, res) => { if (req.body.status && !validLeadStatuses.includes(req.body.status)) return res.status(400).json({ error: "Invalid lead status" }); await connectMongo(); const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.json({ lead }); });
  app.delete("/api/admin/leads/:id", async (req, res) => { await connectMongo(); const lead = await Lead.findByIdAndDelete(req.params.id); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.status(204).end(); });
  app.post("/api/admin/assets", upload.single("file"), async (req, res) => { if (!req.file || !hasValidImageSignature(req.file.buffer, req.file.mimetype)) return res.status(400).json({ error: "A JPG, PNG, or WebP image up to 5MB is required" }); const id = await uploadAsset(Readable.from(req.file.buffer), req.file.originalname, req.file.mimetype); res.status(201).json({ id, url: `/api/images/${id}` }); });
  app.get("/api/images/:id", async (req, res) => { try { const stream = await downloadAsset(req.params.id); stream.on("file", (file) => { res.setHeader("Content-Type", file.contentType || "application/octet-stream"); res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); }); stream.on("error", () => res.status(404).end()); stream.pipe(res); } catch { res.status(404).end(); } });
  return app;
}
export default createExpressApp();
export type App = ReturnType<typeof createExpressApp>;
