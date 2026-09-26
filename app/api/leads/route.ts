import { json, readJson, withApi } from "@/lib/api/respond";
import { createLead } from "@/lib/services/lead.service";
import { assertRateLimit, clientIp } from "@/lib/security/rate-limit";
import { leadSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = withApi(async (request) => {
  await assertRateLimit(`lead:${clientIp(request)}`, 10);
  const input = leadSchema.parse(await readJson(request));
  const lead = await createLead(input);
  return json({ lead }, 201);
});
