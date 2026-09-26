import { json, readJson, withApi } from "@/lib/api/respond";
import { createProduct, listAdminProducts } from "@/lib/services/product.service";
import { requireAdmin } from "@/lib/security/admin";
import { productWriteSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withApi(async (request) => {
  await requireAdmin(request);
  return json({ products: await listAdminProducts() });
});

export const POST = withApi(async (request) => {
  const session = await requireAdmin(request);
  const input = productWriteSchema.parse(await readJson(request));
  const product = await createProduct(input, session.email);
  return json({ product }, 201);
});
