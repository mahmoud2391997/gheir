import { json, readJson, withApi } from "@/lib/api/respond";
import { AppError } from "@/lib/errors";
import { adminCookie, cookieSecure, passwordsMatch, signAdminToken } from "@/lib/security/admin";
import { assertRateLimit, clientIp } from "@/lib/security/rate-limit";
import { loginSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export const POST = withApi(async (request) => {
  await assertRateLimit(`login:${clientIp(request)}`, 5);
  const input = loginSchema.parse(await readJson(request));
  if (!passwordsMatch(input.password, input.email)) throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);
  const { token } = signAdminToken(input.email);
  const response = json({ authenticated: true });
  response.headers.set("Set-Cookie", adminCookie(token, cookieSecure(request)));
  return response;
});
