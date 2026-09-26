import { json, withApi } from "@/lib/api/respond";
import { AppError } from "@/lib/errors";
import { uploadAsset } from "@/lib/db/gridfs";
import { requireAdmin } from "@/lib/security/admin";
import { hasValidImageSignature, MAX_IMAGE_BYTES, readImageUpload, safeImageName } from "@/lib/security/images";
import { assertRateLimit, clientIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const POST = withApi(async (request) => {
  await requireAdmin(request);
  await assertRateLimit(`upload:${clientIp(request)}`, 20);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_IMAGE_BYTES + 100_000) throw new AppError("VALIDATION_ERROR", "A JPG, PNG, or WebP image up to 5MB is required", 400);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !readImageUpload(file)) {
    throw new AppError("VALIDATION_ERROR", "A JPG, PNG, or WebP image up to 5MB is required", 400);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidImageSignature(buffer, file.type)) {
    throw new AppError("VALIDATION_ERROR", "A JPG, PNG, or WebP image up to 5MB is required", 400);
  }
  const id = await uploadAsset(buffer, safeImageName(file.name, file.type), file.type);
  return json({ id, url: `/api/images/${id}` }, 201);
});
