import { withPos } from "@/lib/api/pos-route";
import { json, readJson } from "@/lib/api/respond";
import { processPosSale } from "@/lib/services/pos.service";
import { assertRateLimit, clientIp } from "@/lib/security/rate-limit";
import { posSaleSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = withPos(async (request) => {
  await assertRateLimit(`pos-sale:${clientIp(request)}`, 60);
  const input = posSaleSchema.parse(await readJson(request));
  const sale = await processPosSale(input);
  return json({ saleId: sale.saleId, deduped: sale.deduped, warnings: sale.warnings }, sale.deduped ? 200 : 201);
});

export const OPTIONS = withPos(async () => new Response(null, { status: 204 }));
