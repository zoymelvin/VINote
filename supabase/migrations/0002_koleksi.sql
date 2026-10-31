-- VINOTE koleksi migration (idempoten)
-- Ganti Folder menjadi Koleksi dengan kolom baru

alter table if exists public.folders
  add column if not exists icon text,
  add column if not exists description text,
  add column if not exists cover text,
  add column if not exists smart_rule jsonb,
  add column if not exists is_pinned boolean not null default false;

create index if not exists idx_folders_user_id on public.folders(user_id);
create index if not exists idx_folders_parent_id on public.folders(parent_id);
create index if not exists idx_folders_is_pinned on public.folders(is_pinned);
