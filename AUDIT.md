# Audit — GHEIR / غير

Checked against the current tree (`package.json`, `vercel.json`, `server/app.ts`, `server/mongodb/models.ts`, `scripts/migrate-content.mjs`, `src/`). There is no Next.js app in this repo.

## 1. What production actually runs

Vercel follows `vercel.json`: framework `vite`, build `npm run build` (`tsc --noEmit && vite build`), output `dist`, and a catch-all rewrite to `index.html`. Routing in the browser is `wouter` (`src/App.tsx`). That is the live site.

`next` is not a dependency. There is no `app/` or `pages/` directory, no `next dev` / `next build` / `next start` script, and no `vite preview` script. `vite.config.ts` and `@vitejs/plugin-react` are the real frontend toolchain, not a leftover beside Next.js.

`server.ts` is the local long-running process (`npm run dev`, `npm start`). It mounts the same Express app and, in development, Vite middleware. Vercel does not execute `server.ts`. Production API entry is `api/index.ts`, which exports that Express app as one serverless function.

`postcss.config.mjs`, `@tailwindcss/postcss`, and `autoprefixer` are unused. Tailwind is applied by `@tailwindcss/vite` from `src/index.css`.

## 2. `api/` and `server.ts`

`api/index.ts` is not a Next.js route handler. It is the Vercel function that serves `server/app.ts` (Express 5). Public routes include `/api/health`, `/api/content/:key`, `/api/products`, `/api/leads`, `/api/orders`, and `/api/images/:id`. Admin routes sit under `/api/admin` behind an httpOnly JWT cookie. POS routes sit under `/api/pos` and require the `x-pos-key` header.

## 3. Product data and the POS

This repository does not import Drizzle or MySQL, and it does not call an external POS URL. The shared inventory is this app’s MongoDB `products` collection (`MONGODB_URI`).

The POS is a client of this API, not the other way around:

- `GET /api/pos/products` returns products (ETag / `since` delta) after `x-pos-key` matches `POS_API_KEY`.
- `POST /api/pos/sales` looks up each SKU in Mongo, prices the line from that document, and decrements `stock`. Unknown SKUs are rejected. Repeat `clientSaleId` values are deduped.

The website has a second, separate catalog. Home, collection, and piece pages render `src/data/catalog.ts` (static `priceFrom` values). `/products` and `/products/:slug` read Mongo. A price edited in admin or changed by a POS sale updates Mongo only. The atelier pages keep showing the TypeScript prices until someone edits `catalog.ts`.

Website `POST /api/orders` decrements Mongo stock when the SKU exists, but it stores `unitPrice` from the request body. POS sales do not trust the client price. That is the integrity gap.

Assumption: the gheir-pos repo is not in this workspace, so this audit does not claim how that app is configured beyond the contract implemented here (`x-pos-key`, `/api/pos/products`, `/api/pos/sales`). Nothing in this repo reads a POS MySQL database.

If Mongo is down, `/api/products` returns 500 JSON. `/products` shows that error. `useContent` keeps its built-in fallback, so marketing pages still render. `ProductDetail` currently treats every failed fetch as “not found”.

## 4. `migrate:content`

`scripts/migrate-content.mjs` connects with `MONGODB_URI` and creates indexes on `products` and `leads`. It does not copy catalog content. It is a manual one-off (`npm run migrate:content`). It is not part of `build` or `vercel.json`, and it should not run on every deploy. Mongoose schemas already declare the same indexes.

## 5. Dead code and gaps

No `TODO` or `FIXME` markers. The old Nexus/Next leftovers called out in the previous audit are already gone.

Still open:

- Unused PostCSS config and packages (section 1).
- Two price lists (section 3), and website orders trusting client prices for known SKUs.
- `PATCH /api/admin/products/:id` writes `req.body` through with no field whitelist.
- `/api/leads` and `/api/orders` validate types but have no rate limit. Admin login does (5 attempts / 15 minutes).
- No `sitemap.xml` or `robots.txt`. The SPA cannot statically generate per-route HTML; crawlers see `index.html`, which already has bilingual title, description, and Open Graph tags. The client updates those tags after navigation.
- Arabic layout and WebP images are already in place (`src/lib/locale.tsx`, `src/components/Photo.tsx`). Product frames use a fixed aspect ratio, so a missing width/height does not collapse the layout.
- Secrets (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `POS_API_KEY`) are read only in `server/`. The client bundle has no `import.meta.env` usage. `.env.example` still documents `POS_ALLOWED_ORIGINS="*"`, and the server allows that value.
