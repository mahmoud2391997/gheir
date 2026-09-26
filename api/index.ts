/**
 * Vercel production entry. Serves the Express app from `server/app.ts`.
 * 30s is enough for an Atlas cold connect and a 5MB image upload.
 * `connectMongo` keeps the client on globalThis so warm invocations skip the handshake.
 */
import app from '../server/app.js';

export const config = {
  maxDuration: 30,
};

export default app;
