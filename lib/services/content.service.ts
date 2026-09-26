import { connectMongo } from "../db/mongoose";
import { Content } from "../db/models";
import { AppError } from "../errors";

const KEY = /^[a-z0-9._-]{1,80}$/i;

export function assertContentKey(key: string) {
  if (!KEY.test(key)) throw new AppError("VALIDATION_ERROR", "Invalid content key", 400);
}

export async function getContent(key: string) {
  assertContentKey(key);
  await connectMongo();
  const doc = await Content.findOne({ key }).lean();
  if (!doc) return { key, data: null, missing: true as const };
  return { key: doc.key, data: doc.data, missing: false as const };
}

export async function listContentKeys() {
  await connectMongo();
  const keys = await Content.find({}, { key: 1 }).sort({ key: 1 }).lean();
  return keys.map((item) => item.key);
}

export async function saveContent(key: string, data: unknown) {
  assertContentKey(key);
  if (data === undefined) throw new AppError("VALIDATION_ERROR", "content body is required", 400);
  await connectMongo();
  const doc = await Content.findOneAndUpdate({ key }, { $set: { key, data } }, { upsert: true, new: true }).lean();
  return { key: doc?.key ?? key, data: doc?.data ?? data };
}
