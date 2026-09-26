import { withPos } from "@/lib/api/pos-route";
import { json } from "@/lib/api/respond";
import { inventorySnapshot, inventoryVersion } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withPos(async () => {
  const [meta, products] = await Promise.all([inventoryVersion(), inventorySnapshot()]);
  const response = json({ products, inventoryVersion: meta.inventoryVersion, asOf: new Date().toISOString() });
  response.headers.set("ETag", meta.etag);
  return response;
});

export const OPTIONS = withPos(async () => new Response(null, { status: 204 }));
