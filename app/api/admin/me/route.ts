import { json, withApi } from "@/lib/api/respond";
import { requireAdmin } from "@/lib/security/admin";

export const dynamic = "force-dynamic";

export const GET = withApi(async (request) => {
  const session = await requireAdmin(request);
  return json({ authenticated: true, email: session.email });
});
