import { withPos } from "@/lib/api/pos-route";
import { json } from "@/lib/api/respond";
import { inventoryVersion } from "@/lib/services/product.service";
import { posApiKey } from "@/lib/security/secrets";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withPos(async () => {
  const meta = await inventoryVersion();
  const response = json({
    ok: true,
    configured: Boolean(posApiKey()),
    serverTime: new Date().toISOString(),
    productsCount: meta.productsCount,
    lastUpdatedAt: meta.lastUpdatedAt,
    inventoryVersion: meta.inventoryVersion,
  });
  response.headers.set("ETag", meta.etag);
  return response;
});

export const OPTIONS = withPos(async () => new Response(null, { status: 204 }));
