import { json, readJson, withApi } from "@/lib/api/respond";
import { deleteProduct, updateProduct } from "@/lib/services/product.service";
import { requireAdmin } from "@/lib/security/admin";
import { productPatchSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const PATCH = withApi(async (request, context: { params: Promise<{ id: string }> }) => {
  await requireAdmin(request);
  const { id } = await context.params;
  const patch = productPatchSchema.parse(await readJson(request));
  return json({ product: await updateProduct(id, patch) });
});

export const DELETE = withApi(async (request, context: { params: Promise<{ id: string }> }) => {
  await requireAdmin(request);
  const { id } = await context.params;
  await deleteProduct(id);
  return new Response(null, { status: 204 });
});
