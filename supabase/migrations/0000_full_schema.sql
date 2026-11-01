-- 0000_full_schema.sql
-- VINOTE consolidated schema (idempotent)
-- Safe to run on empty or partially-migrated Supabase projects.
-- Run in Supabase SQL Editor.

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  display_name text default '',
  username text default '',
  email text default '',
  avatar_url text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "profiles_delete" on public.profiles;
create policy "profiles_select" on public.profiles for select using (user_id = auth.uid());
create policy "profiles_insert" on public.profiles for insert with check (user_id = auth.uid());
create policy "profiles_update" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles_delete" on public.profiles for delete using (user_id = auth.uid());

-- ============================================================
-- 2. FOLDERS (collections)
-- ============================================================
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null default 'Koleksi baru',
  color text default '#6366f1',
  icon text default '📁',
  description text default '',
  cover text default '',
  parent_id uuid references public.folders(id) on delete set null,
  smart_rule jsonb,
  is_pinned boolean default false,
  sort_order bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.folders enable row level security;
drop policy if exists "folders_select" on public.folders;
drop policy if exists "folders_insert" on public.folders;
drop policy if exists "folders_update" on public.folders;
drop policy if exists "folders_delete" on public.folders;
create policy "folders_select" on public.folders for select using (user_id = auth.uid());
create policy "folders_insert" on public.folders for insert with check (user_id = auth.uid());
create policy "folders_update" on public.folders for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "folders_delete" on public.folders for delete using (user_id = auth.uid());

-- ============================================================
-- 3. NOTES
-- ============================================================
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  type text not null default 'text',
  title text default '',
  content jsonb default '{"type":"doc","content":[{"type":"paragraph"}]}',
  content_text text default '',
  color text default 'polos',
  folder_id uuid references public.folders(id) on delete set null,
  is_pinned boolean default false,
  is_favorite boolean default false,
  is_archived boolean default false,
  is_locked boolean default false,
  reminder_at timestamptz,
  sort_order bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  last_opened_at timestamptz,
  history_hidden_at timestamptz,
  version integer default 1
);
alter table public.notes enable row level security;
drop policy if exists "notes_select" on public.notes;
drop policy if exists "notes_insert" on public.notes;
drop policy if exists "notes_update" on public.notes;
drop policy if exists "notes_delete" on public.notes;
create policy "notes_select" on public.notes for select using (user_id = auth.uid());
create policy "notes_insert" on public.notes for insert with check (user_id = auth.uid());
create policy "notes_update" on public.notes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes_delete" on public.notes for delete using (user_id = auth.uid());

-- ============================================================
-- 4. NOTE_REVISIONS
-- ============================================================
create table if not exists public.note_revisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  note_id uuid references public.notes(id) on delete cascade,
  title text default '',
  content jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.note_revisions enable row level security;
drop policy if exists "note_revisions_select" on public.note_revisions;
drop policy if exists "note_revisions_insert" on public.note_revisions;
drop policy if exists "note_revisions_update" on public.note_revisions;
drop policy if exists "note_revisions_delete" on public.note_revisions;
create policy "note_revisions_select" on public.note_revisions for select using (user_id = auth.uid());
create policy "note_revisions_insert" on public.note_revisions for insert with check (user_id = auth.uid());
create policy "note_revisions_update" on public.note_revisions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "note_revisions_delete" on public.note_revisions for delete using (user_id = auth.uid());

-- ============================================================
-- 5. TAGS
-- ============================================================
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null default 'tag',
  color text default '#64748b',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.tags enable row level security;
drop policy if exists "tags_select" on public.tags;
drop policy if exists "tags_insert" on public.tags;
drop policy if exists "tags_update" on public.tags;
drop policy if exists "tags_delete" on public.tags;
create policy "tags_select" on public.tags for select using (user_id = auth.uid());
create policy "tags_insert" on public.tags for insert with check (user_id = auth.uid());
create policy "tags_update" on public.tags for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tags_delete" on public.tags for delete using (user_id = auth.uid());

-- ============================================================
-- 6. NOTE_TAGS
-- ============================================================
create table if not exists public.note_tags (
  note_id uuid references public.notes(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  primary key (note_id, tag_id)
);
alter table public.note_tags enable row level security;
drop policy if exists "note_tags_select" on public.note_tags;
drop policy if exists "note_tags_insert" on public.note_tags;
drop policy if exists "note_tags_update" on public.note_tags;
drop policy if exists "note_tags_delete" on public.note_tags;
create policy "note_tags_select" on public.note_tags for select using (user_id = auth.uid());
create policy "note_tags_insert" on public.note_tags for insert with check (user_id = auth.uid());
create policy "note_tags_update" on public.note_tags for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "note_tags_delete" on public.note_tags for delete using (user_id = auth.uid());

-- ============================================================
-- 7. NOTE_COLLECTIONS
-- ============================================================
create table if not exists public.note_collections (
  note_id uuid references public.notes(id) on delete cascade,
  collection_id uuid references public.folders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  primary key (note_id, collection_id)
);
alter table public.note_collections enable row level security;
drop policy if exists "note_collections_select" on public.note_collections;
drop policy if exists "note_collections_insert" on public.note_collections;
drop policy if exists "note_collections_update" on public.note_collections;
drop policy if exists "note_collections_delete" on public.note_collections;
create policy "note_collections_select" on public.note_collections for select using (user_id = auth.uid());
create policy "note_collections_insert" on public.note_collections for insert with check (user_id = auth.uid());
create policy "note_collections_update" on public.note_collections for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "note_collections_delete" on public.note_collections for delete using (user_id = auth.uid());

-- ============================================================
-- 8. ATTACHMENTS
-- ============================================================
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  note_id uuid references public.notes(id) on delete cascade,
  kind text default 'image',
  storage_path text default '',
  size bigint default 0,
  mime text default '',
  width integer,
  height integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.attachments enable row level security;
drop policy if exists "attachments_select" on public.attachments;
drop policy if exists "attachments_insert" on public.attachments;
drop policy if exists "attachments_update" on public.attachments;
drop policy if exists "attachments_delete" on public.attachments;
create policy "attachments_select" on public.attachments for select using (user_id = auth.uid());
create policy "attachments_insert" on public.attachments for insert with check (user_id = auth.uid());
create policy "attachments_update" on public.attachments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "attachments_delete" on public.attachments for delete using (user_id = auth.uid());

-- ============================================================
-- 9. SHARES
-- ============================================================
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  note_id uuid references public.notes(id) on delete cascade,
  token text default '',
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.shares enable row level security;
drop policy if exists "shares_select" on public.shares;
drop policy if exists "shares_insert" on public.shares;
drop policy if exists "shares_update" on public.shares;
drop policy if exists "shares_delete" on public.shares;
create policy "shares_select" on public.shares for select using (user_id = auth.uid());
create policy "shares_insert" on public.shares for insert with check (user_id = auth.uid());
create policy "shares_update" on public.shares for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "shares_delete" on public.shares for delete using (user_id = auth.uid());

-- ============================================================
-- 10. TEMPLATES
-- ============================================================
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text default 'Template',
  type text default 'text',
  content jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.templates enable row level security;
drop policy if exists "templates_select" on public.templates;
drop policy if exists "templates_insert" on public.templates;
drop policy if exists "templates_update" on public.templates;
drop policy if exists "templates_delete" on public.templates;
create policy "templates_select" on public.templates for select using (user_id = auth.uid());
create policy "templates_insert" on public.templates for insert with check (user_id = auth.uid());
create policy "templates_update" on public.templates for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "templates_delete" on public.templates for delete using (user_id = auth.uid());

-- ============================================================
-- 11. SETTINGS
-- ============================================================
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  theme text default 'system',
  accent text default 'indigo',
  editor_font text default 'sans',
  editor_size integer default 16,
  density text default 'comfortable',
  language text default 'id',
  app_lock boolean default false,
  privacy_mode boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.settings enable row level security;
drop policy if exists "settings_select" on public.settings;
drop policy if exists "settings_insert" on public.settings;
drop policy if exists "settings_update" on public.settings;
drop policy if exists "settings_delete" on public.settings;
create policy "settings_select" on public.settings for select using (user_id = auth.uid());
create policy "settings_insert" on public.settings for insert with check (user_id = auth.uid());
create policy "settings_update" on public.settings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "settings_delete" on public.settings for delete using (user_id = auth.uid());

-- ============================================================
-- 12. PUSH_SUBSCRIPTIONS
-- ============================================================
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  endpoint text default '',
  p256dh text default '',
  auth_key text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subscriptions_select" on public.push_subscriptions;
drop policy if exists "push_subscriptions_insert" on public.push_subscriptions;
drop policy if exists "push_subscriptions_update" on public.push_subscriptions;
drop policy if exists "push_subscriptions_delete" on public.push_subscriptions;
create policy "push_subscriptions_select" on public.push_subscriptions for select using (user_id = auth.uid());
create policy "push_subscriptions_insert" on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy "push_subscriptions_update" on public.push_subscriptions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "push_subscriptions_delete" on public.push_subscriptions for delete using (user_id = auth.uid());

-- ============================================================
-- 13. INDEXES
-- ============================================================
create index if not exists idx_notes_user_updated on public.notes(user_id, updated_at);
create index if not exists idx_notes_user_deleted on public.notes(user_id, deleted_at);
create index if not exists idx_folders_user_updated on public.folders(user_id, updated_at);
create index if not exists idx_note_collections_user on public.note_collections(user_id);
create index if not exists idx_attachments_user on public.attachments(user_id);
create index if not exists idx_revisions_note on public.note_revisions(note_id);

-- ============================================================
-- 14. UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in select unnest(array['profiles','folders','notes','note_revisions','tags','note_tags','note_collections','attachments','shares','templates','settings','push_subscriptions'])
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ============================================================
-- 15. IS_USERNAME_AVAILABLE RPC
-- ============================================================
create or replace function public.is_username_available(u text)
returns boolean
language sql
security definer
as $$
  select not exists (select 1 from public.profiles where username = u and user_id <> auth.uid());
$$;

-- ============================================================
-- 16. PURGE_TRASHED_NOTES
-- ============================================================
create or replace function public.purge_trashed_notes()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.notes
  where deleted_at is not null
    and deleted_at < (now() - interval '30 days');
end;
$$;

-- ============================================================
-- 17. REALTIME
-- ============================================================
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.folders;
alter publication supabase_realtime add table public.tags;
alter publication supabase_realtime add table public.note_tags;
alter publication supabase_realtime add table public.note_collections;

-- ============================================================
-- 18. STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Storage policies for avatars
drop policy if exists "avatars_select" on storage.objects;
drop policy if exists "avatars_insert" on storage.objects;
drop policy if exists "avatars_update" on storage.objects;
drop policy if exists "avatars_delete" on storage.objects;
create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_insert" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update" on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete" on storage.objects for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for attachments
drop policy if exists "attachments_select" on storage.objects;
drop policy if exists "attachments_insert" on storage.objects;
drop policy if exists "attachments_update" on storage.objects;
drop policy if exists "attachments_delete" on storage.objects;
create policy "attachments_select" on storage.objects for select using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attachments_insert" on storage.objects for insert with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attachments_update" on storage.objects for update using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "attachments_delete" on storage.objects for delete using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
