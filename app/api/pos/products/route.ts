import { withPos } from "@/lib/api/pos-route";
import { json } from "@/lib/api/respond";
import { AppError } from "@/lib/errors";
import { inventoryVersion, listPosProducts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withPos(async (request) => {
  const meta = await inventoryVersion();
  const sinceRaw = new URL(request.url).searchParams.get("since")?.trim() ?? "";
  if (!sinceRaw && request.headers.get("if-none-match") === meta.etag) {
    return new Response(null, { status: 304, headers: { ETag: meta.etag } });
  }
  let since: Date | undefined;
  if (sinceRaw) {
    since = new Date(sinceRaw);
    if (Number.isNaN(since.getTime())) throw new AppError("VALIDATION_ERROR", "since must be an ISO date string", 400);
  }
  const products = await listPosProducts(since);
  const response = json({ products, inventoryVersion: meta.inventoryVersion, asOf: new Date().toISOString() });
  response.headers.set("ETag", meta.etag);
  return response;
});

export const OPTIONS = withPos(async () => new Response(null, { status: 204 }));
