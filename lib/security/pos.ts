import jwt from "jsonwebtoken";
import { AppError } from "../errors";
import { isProductionRuntime, jwtSecret, posApiKey } from "./secrets";

const TWELVE_HOURS = 12 * 60 * 60;

export function configuredOrigins() {
  return (process.env.POS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function originAllowed(origin: string) {
  if (!origin) return true;
  const allowed = configuredOrigins();
  if (!isProductionRuntime() && (allowed.includes("*") || allowed.includes(origin) || isLocalOrigin(origin))) return true;
  if (isProductionRuntime() && allowed.includes("*")) return false;
  return allowed.includes(origin);
}

function isLocalOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return (url.hostname === "localhost" || url.hostname === "127.0.0.1") && (url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return false;
  }
}

export function posCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  const headers = new Headers();
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-pos-key, If-None-Match");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Expose-Headers", "ETag");
  headers.set("Vary", "Origin");
  if (origin && originAllowed(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

export function rejectDisallowedOrigin(request: Request) {
  const origin = request.headers.get("origin") || "";
  if (origin && !originAllowed(origin)) {
    throw new AppError("FORBIDDEN", "Origin is not allowed", 403);
  }
}

export function signPosToken() {
  const exp = Math.floor(Date.now() / 1000) + TWELVE_HOURS;
  const token = jwt.sign({ sub: "pos", role: "pos" }, jwtSecret(), { expiresIn: TWELVE_HOURS });
  return { token, expiresAt: new Date(exp * 1000).toISOString() };
}

export function authenticatePos(request: Request) {
  rejectDisallowedOrigin(request);
  const header = request.headers.get("authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (bearer && verifyPosToken(bearer)) return;
  const key = request.headers.get("x-pos-key");
  const expected = posApiKey();
  if (expected && key && key === expected) return;
  throw new AppError("UNAUTHORIZED", "POS authentication required", 401);
}

export function exchangePosKey(apiKey: string) {
  const expected = posApiKey();
  if (!expected || apiKey !== expected) throw new AppError("UNAUTHORIZED", "POS authentication required", 401);
  return signPosToken();
}

function verifyPosToken(token: string) {
  try {
    const payload = jwt.verify(token, jwtSecret());
    return Boolean(payload && typeof payload === "object" && !Array.isArray(payload) && payload.role === "pos");
  } catch {
    return false;
  }
}
