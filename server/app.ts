import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "./mongodb/client.js";
import { Product, Lead } from "./mongodb/models.js";

dotenv.config();

export function createExpressApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "gher", timestamp: new Date().toISOString() });
  });

  app.get("/api/admin/products", async (_req, res) => {
    try {
      await connectMongo();
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      res.json({ products });
    } catch (error) {
      console.error("[gher] Failed to load products", error);
      res.status(500).json({ error: "Unable to load products" });
    }
  });

  app.get("/api/admin/leads", async (_req, res) => {
    try {
      await connectMongo();
      const leads = await Lead.find().sort({ createdAt: -1 }).lean();
      res.json({ leads });
    } catch (error) {
      console.error("[gher] Failed to load leads", error);
      res.status(500).json({ error: "Unable to load leads" });
    }
  });

  return app;
}

export default createExpressApp();


export type App = ReturnType<typeof createExpressApp>;
