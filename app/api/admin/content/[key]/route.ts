import { json, readJson, withApi } from "@/lib/api/respond";
import { getContent, saveContent } from "@/lib/services/content.service";
import { requireAdmin } from "@/lib/security/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

async function keyFrom(context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  return decodeURIComponent(key);
}

export const GET = withApi(async (request, context: { params: Promise<{ key: string }> }) => {
  await requireAdmin(request);
  const content = await getContent(await keyFrom(context));
  if (content.missing) return json({ key: content.key, data: null }, 404);
  return json({ key: content.key, data: content.data });
});

export const PUT = withApi(async (request, context: { params: Promise<{ key: string }> }) => {
  await requireAdmin(request);
  const body = await readJson(request);
  const data = body && typeof body === "object" && "data" in body ? (body as { data: unknown }).data : body;
  return json(await saveContent(await keyFrom(context), data));
});
