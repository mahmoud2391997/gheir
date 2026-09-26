import { withPos } from "@/lib/api/pos-route";
import { json, readJson } from "@/lib/api/respond";
import { syncPosSales } from "@/lib/services/pos.service";
import { assertRateLimit, clientIp } from "@/lib/security/rate-limit";
import { posSyncSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = withPos(async (request) => {
  await assertRateLimit(`pos-sync:${clientIp(request)}`, 30);
  const input = posSyncSchema.parse(await readJson(request));
  return json(await syncPosSales(input.sales));
});

export const OPTIONS = withPos(async () => new Response(null, { status: 204 }));
