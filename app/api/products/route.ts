import { json, withApi } from "@/lib/api/respond";
import { AppError } from "@/lib/errors";
import { getProducts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withApi(async (request) => {
  const category = new URL(request.url).searchParams.get("category")?.trim() ?? "";
  if (category.length > 80 || category.includes("$")) throw new AppError("VALIDATION_ERROR", "Invalid category", 400);
  const products = await getProducts(category || undefined);
  const response = json({ products });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
});
