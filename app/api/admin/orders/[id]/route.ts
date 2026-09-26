import { json, readJson, withApi } from "@/lib/api/respond";
import { updateOrderStatus } from "@/lib/services/order.service";
import { requireAdmin } from "@/lib/security/admin";
import { orderStatusSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const PATCH = withApi(async (request, context: { params: Promise<{ id: string }> }) => {
  await requireAdmin(request);
  const { id } = await context.params;
  const input = orderStatusSchema.parse(await readJson(request));
  return json({ order: await updateOrderStatus(id, input.status) });
});
