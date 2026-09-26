export function readError(json: unknown, fallback: string) {
  if (!json || typeof json !== "object") return fallback;
  const error = (json as { error?: unknown }).error;
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return fallback;
}
