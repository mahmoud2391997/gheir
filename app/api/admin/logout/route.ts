import { json, withApi } from "@/lib/api/respond";
import { clearAdminCookie, cookieSecure, readCookie, revokeAdminToken, COOKIE } from "@/lib/security/admin";

export const dynamic = "force-dynamic";

export const POST = withApi(async (request) => {
  const token = readCookie(request, COOKIE);
  if (token) await revokeAdminToken(token);
  const response = json({ authenticated: false });
  response.headers.set("Set-Cookie", clearAdminCookie(cookieSecure(request)));
  return response;
});
