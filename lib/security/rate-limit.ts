import { connectMongo } from "../db/mongoose";
import { RateLimit } from "../db/models";
import { AppError } from "../errors";

const WINDOW_MS = 15 * 60 * 1000;

export async function assertRateLimit(key: string, max: number, windowMs = WINDOW_MS) {
  await connectMongo();
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const existing = await RateLimit.findOne({ key });
  if (!existing || existing.resetAt <= now) {
    await RateLimit.updateOne({ key }, { $set: { count: 1, resetAt } }, { upsert: true });
    return;
  }
  const updated = await RateLimit.findOneAndUpdate({ key, resetAt: { $gt: now } }, { $inc: { count: 1 } }, { new: true });
  if (!updated || updated.count > max) {
    throw new AppError("RATE_LIMITED", "Too many requests", 429);
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
