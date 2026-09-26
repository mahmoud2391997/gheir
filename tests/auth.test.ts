import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { POST as createAdminProduct } from "@/app/api/admin/products/route";
import { requireAdmin, verifyAdminJwt } from "@/lib/security/admin";
import { exchangePosKey } from "@/lib/security/pos";
import { DEV_JWT_SECRET } from "@/lib/security/secrets";

describe("admin authentication", () => {
  it("accepts a valid admin token", async () => {
    const token = jwt.sign({ sub: "admin@example.com", role: "admin", jti: "jti-1" }, DEV_JWT_SECRET, { expiresIn: "1h" });
    const request = new Request("http://localhost/api/admin/me", { headers: { cookie: `gher_admin=${token}` } });
    await expect(requireAdmin(request, { secret: DEV_JWT_SECRET, isRevoked: async () => false })).resolves.toMatchObject({ email: "admin@example.com" });
  });

  it("rejects a missing session", async () => {
    await expect(requireAdmin(new Request("http://localhost/api/admin/me"), { isRevoked: async () => false })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects an invalid token", () => {
    expect(() => verifyAdminJwt("not-a-token", DEV_JWT_SECRET)).toThrowError(expect.objectContaining({ code: "UNAUTHORIZED" }));
  });

  it("rejects an expired token", () => {
    const token = jwt.sign({ sub: "admin@example.com", role: "admin", jti: "jti-2", exp: Math.floor(Date.now() / 1000) - 10 }, DEV_JWT_SECRET);
    expect(() => verifyAdminJwt(token, DEV_JWT_SECRET)).toThrowError(expect.objectContaining({ code: "UNAUTHORIZED" }));
  });

  it("does not create a product without authentication", async () => {
    const response = await createAdminProduct(new Request("http://localhost/api/admin/products", { method: "POST", body: JSON.stringify({ name: "Chair", category: "saha", price: 10 }) }));
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("POS authentication", () => {
  it("rejects a bad API key", () => {
    process.env.POS_API_KEY = "server-side-pos-key";
    expect(() => exchangePosKey("wrong-key")).toThrowError(expect.objectContaining({ code: "UNAUTHORIZED" }));
  });

  it("exchanges a valid server-side key for a short-lived token", () => {
    process.env.POS_API_KEY = "server-side-pos-key";
    const session = exchangePosKey("server-side-pos-key");
    expect(session.token.split(".").length).toBe(3);
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});
