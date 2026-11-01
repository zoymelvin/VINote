# VINOTE

Next.js App Router + TypeScript + Tailwind, Supabase, Dexie offline-first, PWA.

## Run

```bash
npm ci
cp .env.example .env.local
# isi .env.local
npm run dev
```

## Supabase Setup (Panduan untuk Pemula)

### 1. Buat Proyek Supabase
1. Buka https://supabase.com dan buat akun (gratis).
2. Klik "New Project", isi nama, password database, dan region (pilih yang terdekat).
3. Tunggu proyek selesai dibuat (~2 menit).

### 2. Jalankan SQL Migrasi
1. Di dashboard Supabase, buka **SQL Editor** (menu kiri).
2. Klik "New Query".
3. Salin isi file `supabase/migrations/0000_full_schema.sql` dan tempel ke editor.
4. Klik "Run" (atau Ctrl+Enter).
5. Pastikan tidak ada error. Jika ada error, jalankan ulang (SQL bersifat idempoten).
6. (Opsional) Jalankan `supabase/verify_schema.sql` untuk memeriksa skema.

### 3. Aktifkan Realtime
1. Di dashboard, buka **Database > Replication**.
2. Pastikan tabel `notes`, `folders`, `tags`, `note_tags`, `note_collections` ada di publication `supabase_realtime`.
3. (Sudah diatur otomatis oleh migrasi SQL.)

### 4. Isi .env.local
```bash
cp .env.example .env.local
```
Isi nilai berikut (dari Supabase Dashboard > Settings > API):
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL (https://xxxxx.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key

**Peringatan:** Jangan pernah memakai secret/service_role key di aplikasi ini. Aplikasi hanya memakai URL dan publishable (anon) key. Service role key memberikan akses penuh ke database dan tidak boleh ada di sisi klien.

### 5. Atur Auth
1. Buka **Authentication > URL Configuration**.
2. Tambahkan Site URL: `http://localhost:3000` (dev) dan domain Vercel Anda (production).
3. Tambahkan Redirect URLs: `http://localhost:3000/**` dan `https://your-domain.vercel.app/**`.

### 6. Template Email OTP
1. Buka **Authentication > Email Templates**.
2. Pilih template "Magic Link" (atau "Confirm signup").
3. Pastikan template memuat `{{ .Token }}` agar kode 6 digit tampil di email.
4. Contoh template:
```
Kode verifikasi Anda: {{ .Token }}
Kode ini berlaku selama 1 jam.
```

### 7. Batas Email Bawaan
- Supabase free tier membatasi pengiriman email (~3/jam). Untuk production, gunakan SMTP kustom (Settings > Auth > SMTP).

## Deploy ke Vercel

1. Push kode ke GitHub (jangan push .env.local).
2. Import proyek di Vercel.
3. Set environment variables di Vercel Dashboard > Settings > Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Login di Laptop lalu iPhone

1. Buka aplikasi di laptop, masuk dengan email.
2. Masukkan kode 6 digit yang dikirim ke email.
3. Buka aplikasi di iPhone (Safari), masuk dengan email yang sama.
4. Masukkan kode 6 digit.
5. Catatan dari laptop akan muncul di iPhone setelah sinkronisasi.

## Memakai Halaman Diagnostik

1. Buka Pengaturan > Sinkronisasi > "Periksa koneksi server".
2. Klik "Periksa koneksi server".
3. Hasil menunjukkan status setiap langkah (env, sesi, tabel, uji tulis, storage).
4. Jika ada yang gagal, salin hasilnya dan bagikan ke pengembang.

## Memulihkan Data

1. **Cadangan lokal:** Pengaturan > Data > "Pulihkan dari cadangan lokal".
2. **Catatan belum tersinkron:** Pengaturan > Data > "Periksa catatan yang belum tersinkron".
3. **Ekspor JSON:** Pengaturan > Data > "Ekspor data" untuk menyimpan cadangan manual.

## iPhone PWA

Buka domain di Safari -> Share -> Add to Home Screen. Aplikasi berjalan standalone dengan safe area.

## Tests

```bash
npm run test
npm run lint
npm run build
```
