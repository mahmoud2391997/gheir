import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RevokedToken } from "../db/models";
import { connectMongo } from "../db/mongoose";
import { AppError } from "../errors";
import { adminEmail, adminPasswordHash, jwtSecret } from "./secrets";

const COOKIE = "gher_admin";
const EIGHT_HOURS = 8 * 60 * 60;

export type AdminSession = { email: string; jti: string };

type TokenDeps = {
  secret: string;
  isRevoked: (jti: string) => Promise<boolean>;
};

export function signAdminToken(email: string, secret = jwtSecret()) {
  const jti = randomUUID();
  const token = jwt.sign({ sub: email, role: "admin", jti }, secret, { expiresIn: EIGHT_HOURS });
  return { token, jti };
}

export function verifyAdminJwt(token: string, secret = jwtSecret()): AdminSession {
  try {
    const payload = jwt.verify(token, secret);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new AppError("UNAUTHORIZED", "Admin authentication required", 401);
    }
    if (payload.role !== "admin" || typeof payload.sub !== "string" || typeof payload.jti !== "string") {
      throw new AppError("UNAUTHORIZED", "Admin authentication required", 401);
    }
    return { email: payload.sub, jti: payload.jti };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("UNAUTHORIZED", "Admin authentication required", 401);
  }
}

export async function requireAdmin(request: Request, deps?: Partial<TokenDeps>): Promise<AdminSession> {
  const secret = deps?.secret ?? jwtSecret();
  const token = readCookie(request, COOKIE);
  if (!token) throw new AppError("UNAUTHORIZED", "Admin authentication required", 401);
  const session = verifyAdminJwt(token, secret);
  const revoked = deps?.isRevoked ? await deps.isRevoked(session.jti) : await tokenIsRevoked(session.jti);
  if (revoked) throw new AppError("UNAUTHORIZED", "Admin authentication required", 401);
  return session;
}

export async function revokeAdminToken(token: string) {
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (!payload || typeof payload !== "object" || Array.isArray(payload) || typeof payload.jti !== "string") return;
    const exp = typeof payload.exp === "number" ? new Date(payload.exp * 1000) : new Date(Date.now() + EIGHT_HOURS * 1000);
    await connectMongo();
    await RevokedToken.updateOne({ jti: payload.jti }, { $setOnInsert: { jti: payload.jti, exp } }, { upsert: true });
  } catch {
    /* logout still clears the cookie */
  }
}

async function tokenIsRevoked(jti: string) {
  await connectMongo();
  const found = await RevokedToken.findOne({ jti }).lean();
  return Boolean(found);
}

export function adminCookie(token: string, secure: boolean) {
  const parts = [
    `${COOKIE}=${token}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${EIGHT_HOURS}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearAdminCookie(secure: boolean) {
  const parts = [`${COOKIE}=`, "HttpOnly", "SameSite=Strict", "Path=/", "Max-Age=0"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

export function passwordsMatch(password: string, email: string) {
  if (email !== adminEmail()) return false;
  return bcrypt.compareSync(password, adminPasswordHash());
}

export function cookieSecure(request: Request) {
  return process.env.NODE_ENV === "production" || request.headers.get("x-forwarded-proto") === "https";
}

export { COOKIE };
