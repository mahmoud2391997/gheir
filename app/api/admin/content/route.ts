import { json, withApi } from "@/lib/api/respond";
import { listContentKeys } from "@/lib/services/content.service";
import { requireAdmin } from "@/lib/security/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withApi(async (request) => {
  await requireAdmin(request);
  return json({ keys: await listContentKeys() });
});
