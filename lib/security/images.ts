const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function hasValidImageSignature(buffer: Buffer, mimetype: string) {
  if (mimetype === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimetype === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export function safeImageName(original: string, mimetype: string) {
  const ext = mimetype === "image/png" ? "png" : mimetype === "image/webp" ? "webp" : "jpg";
  const base = original.split(/[/\\]/).pop()?.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80) ?? "";
  if (!base || base === "." || base === "..") return `image.${ext}`;
  return base.includes(".") ? base : `${base}.${ext}`;
}

export function readImageUpload(file: File) {
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return null;
  return file;
}

export { MAX_IMAGE_BYTES };
