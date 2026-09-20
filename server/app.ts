import express, { type NextFunction, type Request, type Response } from "express";
import { Readable } from "node:stream";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { connectMongo } from "./mongodb/client.js";
import { Product, Lead } from "./mongodb/models.js";
import { downloadAsset, uploadAsset } from "./mongodb/gridfs.js";

dotenv.config();
const COOKIE = "gher_admin";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) });
const secret = () => process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not configured"); })();
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
  app.post("/api/admin/login", async (req, res) => { const { email, password } = req.body ?? {}; if (!email || !password || email !== process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) return res.status(401).json({ error: "Invalid credentials" }); if (!(await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH))) return res.status(401).json({ error: "Invalid credentials" }); const token = jwt.sign({ sub: email, role: "admin" }, secret(), { expiresIn: "8h" }); res.cookie(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 8 * 60 * 60 * 1000, path: "/" }); res.json({ authenticated: true }); });
  app.post("/api/admin/logout", (_req, res) => { res.clearCookie(COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/" }); res.json({ authenticated: false }); });
  app.get("/api/admin/me", requireAdmin, (req, res) => res.json({ authenticated: true, email: req.cookies?.[COOKIE] ? process.env.ADMIN_EMAIL : undefined }));
  app.use("/api/admin", (req, res, next) => req.path === "/login" ? next() : requireAdmin(req, res, next));
  app.get("/api/admin/products", async (_req, res) => { try { await connectMongo(); res.json({ products: await Product.find().sort({ createdAt: -1 }).lean() }); } catch { res.status(500).json({ error: "Unable to load products" }); } });
  app.post("/api/admin/products", async (req, res) => { try { const { name, category, price, stock = 0, status = "draft", description, imageKey } = req.body ?? {}; if (!name || !category || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ error: "name, category, and a non-negative price are required" }); await connectMongo(); const product = await Product.create({ name, slug: `${slugify(name)}-${Date.now()}`, category, price: Number(price), stock: Number(stock), status, description, imageKey }); res.status(201).json({ product }); } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" }); } });
  app.patch("/api/admin/products/:id", async (req, res) => { try { await connectMongo(); const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!product) return res.status(404).json({ error: "Product not found" }); res.json({ product }); } catch (error) { res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" }); } });
  app.delete("/api/admin/products/:id", async (req, res) => { await connectMongo(); const product = await Product.findByIdAndDelete(req.params.id); if (!product) return res.status(404).json({ error: "Product not found" }); res.status(204).end(); });
  app.get("/api/admin/leads", async (_req, res) => { try { await connectMongo(); res.json({ leads: await Lead.find().sort({ createdAt: -1 }).lean() }); } catch { res.status(500).json({ error: "Unable to load leads" }); } });
  app.patch("/api/admin/leads/:id", async (req, res) => { if (req.body.status && !validLeadStatuses.includes(req.body.status)) return res.status(400).json({ error: "Invalid lead status" }); await connectMongo(); const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.json({ lead }); });
  app.delete("/api/admin/leads/:id", async (req, res) => { await connectMongo(); const lead = await Lead.findByIdAndDelete(req.params.id); if (!lead) return res.status(404).json({ error: "Lead not found" }); res.status(204).end(); });
  app.post("/api/admin/assets", upload.single("file"), async (req, res) => { if (!req.file) return res.status(400).json({ error: "A JPG, PNG, or WebP image up to 5MB is required" }); const id = await uploadAsset(Readable.from(req.file.buffer), req.file.originalname, req.file.mimetype); res.status(201).json({ id, url: `/api/images/${id}` }); });
  app.get("/api/images/:id", async (req, res) => { try { const stream = await downloadAsset(req.params.id); stream.on("file", (file) => { res.setHeader("Content-Type", file.contentType || "application/octet-stream"); res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); }); stream.on("error", () => res.status(404).end()); stream.pipe(res); } catch { res.status(404).end(); } });
  return app;
}
export default createExpressApp();
export type App = ReturnType<typeof createExpressApp>;
