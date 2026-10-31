<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know
Breaking changes — APIs, conventions, and file structure may differ from training data. Read `node_modules/next/dist/docs/` before writing code. This block is re-added by `next dev`; do not remove it from diffs.
<!-- END:nextjs-agent-rules -->

## Commands
- Install: `npm ci`
- Dev: `npm run dev` (turbopack; Serwist PWA disabled in dev)
- Build: `npm run build` — **must use webpack** for Serwist service worker; do not drop `--webpack`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Test all: `npm run test`
- Single test file: `npm run test -- src/lib/db/repo.test.ts`
- Single test by name: `npm run test -- -t "creates and updates note"`
- UI check: `node scripts/ui-check.mjs`
- Search check: `node scripts/search-check.mjs`

## Architecture
- Next.js 16 App Router, single app under `src/`; alias `@/*` → `src/*`.
- Route groups: `src/app/(app)/` — parenthesized segments are layout groups, not routes.
- Offline-first: Dexie DB (`src/lib/db/db.ts`), repos (`src/lib/db/repo.ts`), sync engine (`src/lib/sync/engine.ts`) reconciles with Supabase.
- Supabase optional: `src/lib/supabase/client.ts` and `server.ts` return `null` without env; app runs local-only.
- PWA via Serwist: source `src/sw.ts`, output `public/sw.js` (generated — do not edit). Disabled in dev via `next.config.ts`.
- Tailwind v4: `@tailwindcss/turbopack` for dev, webpack for build.

## Design System (Midnight Ink)
- OKLCH CSS tokens in `src/app/globals.css` (`--background`, `--surface`, `--accent`, `--radius: 16px`, `--radius-sm: 12px`).
- Font: Inter via `next/font/google`; `--font-sans` variable.
- No warm tints (hue 20–95) in dark mode surfaces.
- Note card colors: `polos/mawar/pink/violet/indigo/langit/teal/zamrud/lime` (not legacy `neutral/stone/orange/yellow/green/blue/purple/lavender`). Use `normalizeCardColor()` when reading old data.

## Icon Convention
- **All icons MUST use the wrapper at `@/components/icons/index.tsx`** (`Icon` and `IconTile` components).
- ESLint blocks direct `lucide-react` imports (`no-restricted-imports`). Use Phosphor icons instead.
- `@phosphor-icons/react` is the icon library; direct imports are allowed but prefer the wrapper.

## Data Model Quirks
- `folderId` on `notes` is deprecated but kept for rollback; multi-collection uses `noteCollections` table (many-to-many).
- Dexie v3 schema in `db.ts`; upgrades run automatically on version bump.
- Empty notes: `/catatan/baru` generates UUID and redirects without DB write; editor lazy-saves on first content via `createNote({ id: noteId, ... })`.
- `/catatan/[id]` supports `isNew` draft mode when note does not yet exist in DB.

## Testing
- Vitest + jsdom + fake-indexeddb; setup `src/test/setup.ts`. No external services needed.
- Run from repo root so relative paths in tests resolve.
- `next-env.d.ts` and `public/sw.js` are generated — do not edit.

## Setup
- `cp .env.example .env.local`; Supabase and VAPID optional.
- Supabase: run `supabase/migrations/*.sql` in SQL Editor, enable Realtime on `notes`, `folders`, `tags`, `note_tags`, create private `attachments` bucket.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`.
