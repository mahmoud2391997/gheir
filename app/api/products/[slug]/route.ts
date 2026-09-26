import { json, withApi } from "@/lib/api/respond";
import { getProduct } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withApi(async (_request, context: { params: Promise<{ slug: string }> }) => {
  const { slug } = await context.params;
  const { stock: _stock, ...product } = await getProduct(slug);
  const response = json({ product });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
});
