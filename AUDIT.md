# Runtime audit

Checked against `origin/main` (`0b81286`) and the live health response at `https://gheir.vercel.app/api/health`, which returns `{ "service": "gher" }`.

## What actually runs in production

Vercel uses `vercel.json`: `vite build` writes the SPA to `dist`, and `api/index.ts` is the serverless function. That function imports `server/app.ts` (Express). Public routes cover catalog content, products, leads, and orders. Admin and POS routes live on the same app. Data is MongoDB via Mongoose (`MONGODB_URI`), including GridFS image uploads.

`server.ts` is not a second product. `npm run dev` and `npm start` boot that file so the same Express app can run on a long-lived Node process with Vite middleware locally. Vercel does not execute it. It stays as the local entry and is marked as such in the file header.

There is no Next.js app. `package.json` does not depend on `next` and there is no `app/` or `pages/` router. `tsconfig.json` still listed a `next` TypeScript plugin; that plugin is removed in this cleanup.

## Database

Mongoose models in `server/mongodb/` are the live store: products, leads, CMS content, orders, POS sales, and uploaded images.

`server/db/schema.sql` is an unused Postgres schema for a multi-tenant “Nexus” workspace (users, CRM, audit logs). Nothing imports it. `vercel.json` only bundled it with `includeFiles`. The SQL file and that include are removed. There is no second ORM left in the dependency tree.

## Leftover AI-ops scaffolding

Gemini, Google OAuth, the token vault, and the Nexus UI (`AITerminal`, CRM, ERP, policy engine) are already gone from this revision. Two unused modules were still on disk and excluded from `tsc`: `src/components/Navigation.tsx` and `src/types.ts` (workspace tiers, audit ledger, agent messages). They are not imported by the furniture app and are removed.

`cookie-parser` was listed in `package.json` and never imported; the app reads the `Cookie` header itself. The dependency is removed.

`vite.config.ts` still ignored a `.tmp-nexus-identity` path and mentioned an AI Studio HMR switch. Those comments and the ignore are removed. Vite’s own dev server is not the app entry; `server.ts` owns dev.

## Secrets (handled in the following change, not here)

Admin auth is real and used. `JWT_SECRET` and `ADMIN_PASSWORD_HASH` still fall back to development defaults inside `server/app.ts` when unset. This cleanup does not change that behavior. The next change makes production refuse those placeholders.

This environment cannot read the Vercel project’s environment variable values, so this audit does not claim what is currently set in the Vercel dashboard.
