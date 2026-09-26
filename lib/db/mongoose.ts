import mongoose from "mongoose";

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalCache = globalThis as typeof globalThis & { __gheirMongoose?: MongooseCache };
const cache = globalCache.__gheirMongoose ?? { conn: null, promise: null };
globalCache.__gheirMongoose = cache;

export async function connectMongo() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new AppErrorMissingUri();
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false });
  cache.conn = await cache.promise;
  return cache.conn;
}

class AppErrorMissingUri extends Error {
  constructor() {
    super("MONGODB_URI is required");
    this.name = "MONGODB_URI";
  }
}
