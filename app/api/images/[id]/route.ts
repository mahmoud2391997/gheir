import { Readable } from "node:stream";
import { withApi } from "@/lib/api/respond";
import { openAsset } from "@/lib/db/gridfs";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withApi(async (_request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const asset = await openAsset(id);
  return new Response(Readable.toWeb(asset.stream) as ReadableStream, {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
