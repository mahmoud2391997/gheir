import { json } from "@/lib/api/respond";

export const dynamic = "force-dynamic";

export function GET() {
  return json({ status: "ok", service: "gher", timestamp: new Date().toISOString() });
}
