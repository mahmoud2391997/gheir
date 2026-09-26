/** Vercel production entry. Serves the Express app from `server/app.ts`. */
import app from '../server/app.js';

export const config = {
  maxDuration: 30,
};

export default app;
