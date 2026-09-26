import { withPosCors } from "@/lib/api/pos-route";
import { json, readJson } from "@/lib/api/respond";
import { exchangePosKey } from "@/lib/security/pos";
import { assertRateLimit, clientIp } from "@/lib/security/rate-limit";
import { posAuthSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function post(request: Request) {
  await assertRateLimit(`pos-auth:${clientIp(request)}`, 10);
  const input = posAuthSchema.parse(await readJson(request));
  return json(exchangePosKey(input.apiKey));
}

export const POST = withPosCors(post);
export const OPTIONS = withPosCors(async () => new Response(null, { status: 204 }));
