import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

await mongoose.connect(uri);
const db = mongoose.connection.db;
await db.collection("products").createIndex({ slug: 1 }, { unique: true });
await db.collection("products").createIndex({ status: 1, category: 1 });
await db.collection("leads").createIndex({ status: 1, createdAt: -1 });
await db.collection("leads").createIndex({ email: 1 });
console.log("[v0] MongoDB content migration prepared: products, leads, and indexes are ready.");
await mongoose.disconnect();
