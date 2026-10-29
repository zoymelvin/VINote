# VINOTE

Next.js App Router + TypeScript + Tailwind, Supabase, Dexie offline-first, PWA.

## Run

```bash
npm ci
cp .env.example .env.local
# isi .env.local
npm run dev
```

## Supabase

1. Buat proyek Supabase.
2. Jalankan `supabase/migrations/0001_init.sql` di SQL Editor.
3. Aktifkan Realtime untuk `notes`, `folders`, `tags`, `note_tags`.
4. Buat bucket `attachments` privat (sudah di migrasi).
5. Isi `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Opsional VAPID untuk Web Push.

## iPhone PWA

Buka domain di Safari -> Share -> Add to Home Screen. Aplikasi berjalan standalone dengan safe area.

## Tests

```bash
npm run test
npm run lint
npm run build
```
