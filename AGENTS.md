<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

- Install: `npm ci`
- Dev: `npm run dev`
- Build: `npm run build` (uses webpack; required for Serwist service worker — do not drop `--webpack`)
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Test all: `npm run test`
- Single test file: `npm run test -- src/lib/db/repo.test.ts`
- Single test by name: `npm run test -- -t "creates and updates note"`
- Watch tests: `npm run test:watch`

## Architecture

- Single Next.js 16 App Router app; source under `src/`; alias `@/*` -> `src/*`.
- Route groups use `(app)` convention under `src/app/(app)` — the parenthesized segment is a layout group, not a route.
- Offline-first: Dexie DB in `src/lib/db`, repositories in `src/lib/db/repo.ts`; sync engine in `src/lib/sync/engine.ts` reconciles with Supabase.
- Supabase is optional: `src/lib/supabase/client.ts` and `server.ts` return `null` without env; middleware no-ops. App runs local-only.
- PWA via Serwist: source `src/sw.ts`, output `public/sw.js`; disabled in dev (`disable` flag in `next.config.ts`). `public/sw.js` is generated — do not edit.
- Tailwind v4 with `@tailwindcss/turbopack` loader for dev (turbopack); build uses webpack via Serwist.

## Setup

- `cp .env.example .env.local`; Supabase and VAPID optional.
- Supabase setup: run all files in `supabase/migrations/` in SQL Editor, enable Realtime on `notes`, `folders`, `tags`, `note_tags`, create private `attachments` bucket.
- `.env` vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.

## Testing

- Vitest + jsdom + fake-indexeddb; setup `src/test/setup.ts`. No external services needed.
- RLS test reads migration SQL from `supabase/migrations/`; run commands from repo root.
- Do not edit `next-env.d.ts` (generated).
