/** Development-only admin JWT. Production must set JWT_SECRET. */
export const DEV_JWT_SECRET = "development-jwt-secret-change-me";

/**
 * bcrypt hash of the local development admin password.
 * Production must set ADMIN_PASSWORD_HASH and must not reuse this value.
 */
export const DEV_ADMIN_PASSWORD_HASH =
  "$2b$12$6TXWk8ODs9L09dOTbOt4BeSYxC/AVU82R/GApFjIZf24yEwkaxNGy";

const PLACEHOLDER_SECRETS = new Set([
  DEV_JWT_SECRET,
  "nexus_dev_secret_key_change_in_production",
  "nexus_session_super_secret_jwt_key_2026",
  "replace-with-a-long-random-secret",
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "nexus_vault_master_key_default_32bytes_sec!",
]);

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isProductionRuntime() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

/**
 * Throws when this process is production and admin credentials are missing
 * or still one of the known placeholders. Local `npm run dev` is unchanged.
 */
export function assertProductionSecrets() {
  if (!isProductionRuntime()) return;

  const jwt = process.env.JWT_SECRET?.trim() ?? "";
  if (jwt.length < 32 || PLACEHOLDER_SECRETS.has(jwt)) {
    throw new Error(
      "Refusing to start: JWT_SECRET is missing or still a placeholder. Set a random secret of at least 32 characters in the Vercel project environment.",
    );
  }

  const hash = process.env.ADMIN_PASSWORD_HASH?.trim() ?? "";
  if (!BCRYPT_HASH.test(hash) || hash === DEV_ADMIN_PASSWORD_HASH || PLACEHOLDER_SECRETS.has(hash)) {
    throw new Error(
      "Refusing to start: ADMIN_PASSWORD_HASH is missing, invalid, or still the development default. Set a bcrypt hash in the Vercel project environment.",
    );
  }

  const pos = process.env.POS_API_KEY?.trim() ?? "";
  if (pos && (PLACEHOLDER_SECRETS.has(pos) || pos.length < 16)) {
    throw new Error(
      "Refusing to start: POS_API_KEY is set to a placeholder. Replace it with a random value, or unset it.",
    );
  }
}
