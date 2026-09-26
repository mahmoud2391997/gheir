import { json, withApi } from "@/lib/api/respond";
import { getContent } from "@/lib/services/content.service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const GET = withApi(async (_request, context: { params: Promise<{ key: string }> }) => {
  const { key } = await context.params;
  const content = await getContent(decodeURIComponent(key));
  if (content.missing) return json({ key: content.key, data: null }, 404);
  return json({ key: content.key, data: content.data });
});
