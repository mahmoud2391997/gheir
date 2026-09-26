import { json, readJson, withApi } from "@/lib/api/respond";
import { AppError } from "@/lib/errors";
import { createOrder } from "@/lib/services/order.service";
import { assertRateLimit, clientIp } from "@/lib/security/rate-limit";
import { orderRequestSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = withApi(async (request) => {
  await assertRateLimit(`order:${clientIp(request)}`, 10);
  const key = request.headers.get("idempotency-key")?.trim();
  if (key && !/^[A-Za-z0-9_-]{8,80}$/.test(key)) throw new AppError("VALIDATION_ERROR", "Invalid idempotency key", 400);
  const input = orderRequestSchema.parse(await readJson(request));
  const order = await createOrder(input, key || undefined);
  return json(order, order.deduped ? 200 : 201);
});
