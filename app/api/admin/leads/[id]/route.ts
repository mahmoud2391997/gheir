import { json, readJson, withApi } from "@/lib/api/respond";
import { deleteLead, updateLead } from "@/lib/services/lead.service";
import { requireAdmin } from "@/lib/security/admin";
import { leadPatchSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const PATCH = withApi(async (request, context: { params: Promise<{ id: string }> }) => {
  await requireAdmin(request);
  const { id } = await context.params;
  const patch = leadPatchSchema.parse(await readJson(request));
  return json({ lead: await updateLead(id, patch) });
});

export const DELETE = withApi(async (request, context: { params: Promise<{ id: string }> }) => {
  await requireAdmin(request);
  const { id } = await context.params;
  await deleteLead(id);
  return new Response(null, { status: 204 });
});
