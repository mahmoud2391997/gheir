import { json, withApi } from "@/lib/api/respond";
import { listLeads } from "@/lib/services/lead.service";
import { requireAdmin } from "@/lib/security/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withApi(async (request) => {
  await requireAdmin(request);
  return json({ leads: await listLeads() });
});
