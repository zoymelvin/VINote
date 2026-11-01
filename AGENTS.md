<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know
Breaking changes — APIs, conventions, and file structure may differ from training data. Read `node_modules/next/dist/docs/` before writing code. This block is re-added by `next dev`; do not remove it from diffs.
<!-- END:nextjs-agent-rules -->

## Commands
- Install: `npm ci`
- Dev: `npm run dev` (Turbopack; Serwist disabled)
- Build: `npm run build` (webpack required for Serwist service worker; keep `--webpack`)
- Start: `npm run start`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Test all: `npm run test`
- Test watch: `npm run test:watch`
- Single test file: `npm run test -- src/lib/db/repo.test.ts`
- Single test name: `npm run test -- -t "creates and updates note"`
- UI check: `node scripts/ui-check.mjs` (requires dev server)
- Search check: `node scripts/search-check.mjs`

## Architecture
- Next.js 16 App Router; app under `src/`; alias `@/*` → `src/*`.
- Route group: `src/app/(app)/`.
- Offline-first: Dexie (`src/lib/db/db.ts`), repos (`src/lib/db/repo.ts`), sync (`src/lib/sync/engine.ts`) reconciles with Supabase.
- Supabase optional: client/server return `null` without env; app runs local-only.
- PWA/Serwist: source `src/sw.ts`, generated `public/sw.js` (do not edit).
- Tailwind v4 with `@tailwindcss/turbopack` in dev.

## Design System (Midnight Ink)
- OKLCH tokens in `src/app/globals.css`; radius `16px` / `12px`.
- Inter via `next/font/google`; `--font-sans`.
- No warm tints (hue 20–95) in dark mode surfaces.
- Note card colors: `polos/mawar/pink/violet/indigo/langit/teal/zamrud/lime`; legacy values map via `normalizeCardColor()`.

## Icons
- ESLint blocks direct `lucide-react`; use Phosphor (`@phosphor-icons/react`).
- Accessible wrapper: `@/components/icons` (`Icon`, `IconTile`).

## Data Model Quirks
- Dexie schema v4 in `db.ts`; upgrades run automatically.
- `folderId` retained for rollback; multi-collection relation is `noteCollections`.
- Empty notes: `/catatan/baru` generates UUID and redirects without DB write; editor lazy-saves via `createNote({ id })`.
- `/catatan/[id]` supports `isNew` draft mode when note absent.
- Generated files: `next-env.d.ts`, `public/sw.js` (do not edit).

## Testing
- Vitest + jsdom + fake-indexeddb; setup `src/test/setup.ts`; no external services.
- Run from repo root.

## Setup
- `cp .env.example .env.local`; Supabase and VAPID optional.
- Supabase: run `supabase/migrations/0000_full_schema.sql` (idempotent) in SQL Editor; enables Realtime on `notes`, `folders`, `tags`, `note_tags`, `note_collections`; creates private `attachments` and `avatars` buckets.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.
- Security: use anon key only; never put a service role key in this app.
