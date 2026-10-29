-- VINOTE initial schema
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  parent_id uuid references public.folders(id) on delete set null,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'text',
  title text,
  content jsonb not null default '{}'::jsonb,
  content_text text,
  color text,
  folder_id uuid references public.folders(id) on delete set null,
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  is_locked boolean not null default false,
  reminder_at timestamptz,
  sort_order int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  last_opened_at timestamptz,
  version int not null default 1
);

create table if not exists public.note_revisions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text
);

create table if not exists public.note_tags (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (note_id, tag_id)
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text,
  storage_path text not null,
  size bigint,
  mime text,
  created_at timestamptz not null default now()
);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'text',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'system',
  accent text default 'indigo',
  editor_font text default 'sans',
  editor_size int default 16,
  density text default 'comfortable',
  language text default 'id',
  app_lock boolean default false,
  privacy_mode boolean default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text,
  auth text,
  created_at timestamptz not null default now()
);

-- updated_at triggers
drop trigger if exists folders_updated_at on public.folders;
create trigger folders_updated_at before update on public.folders
  for each row execute function public.set_updated_at();

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

-- indexes
create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at desc);
create index if not exists notes_user_deleted_idx on public.notes (user_id, deleted_at);
create index if not exists notes_content_text_idx on public.notes using gin (to_tsvector('simple', coalesce(content_text,'')));
create index if not exists folders_user_updated_idx on public.folders (user_id, updated_at desc);

-- RLS
alter table public.folders enable row level security;
alter table public.notes enable row level security;
alter table public.note_revisions enable row level security;
alter table public.tags enable row level security;
alter table public.note_tags enable row level security;
alter table public.attachments enable row level security;
alter table public.shares enable row level security;
alter table public.templates enable row level security;
alter table public.settings enable row level security;
alter table public.push_subscriptions enable row level security;

-- policies (drop + create for idempotency)
do $$ begin
  -- folders
  drop policy if exists folders_select on public.folders;
  drop policy if exists folders_insert on public.folders;
  drop policy if exists folders_update on public.folders;
  drop policy if exists folders_delete on public.folders;
  create policy folders_select on public.folders for select using (user_id = auth.uid());
  create policy folders_insert on public.folders for insert with check (user_id = auth.uid());
  create policy folders_update on public.folders for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy folders_delete on public.folders for delete using (user_id = auth.uid());

  -- notes
  drop policy if exists notes_select on public.notes;
  drop policy if exists notes_insert on public.notes;
  drop policy if exists notes_update on public.notes;
  drop policy if exists notes_delete on public.notes;
  create policy notes_select on public.notes for select using (user_id = auth.uid());
  create policy notes_insert on public.notes for insert with check (user_id = auth.uid());
  create policy notes_update on public.notes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy notes_delete on public.notes for delete using (user_id = auth.uid());

  -- note_revisions
  drop policy if exists nr_select on public.note_revisions;
  drop policy if exists nr_insert on public.note_revisions;
  drop policy if exists nr_update on public.note_revisions;
  drop policy if exists nr_delete on public.note_revisions;
  create policy nr_select on public.note_revisions for select using (user_id = auth.uid());
  create policy nr_insert on public.note_revisions for insert with check (user_id = auth.uid());
  create policy nr_update on public.note_revisions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy nr_delete on public.note_revisions for delete using (user_id = auth.uid());

  -- tags
  drop policy if exists tags_select on public.tags;
  drop policy if exists tags_insert on public.tags;
  drop policy if exists tags_update on public.tags;
  drop policy if exists tags_delete on public.tags;
  create policy tags_select on public.tags for select using (user_id = auth.uid());
  create policy tags_insert on public.tags for insert with check (user_id = auth.uid());
  create policy tags_update on public.tags for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy tags_delete on public.tags for delete using (user_id = auth.uid());

  -- note_tags
  drop policy if exists nt_select on public.note_tags;
  drop policy if exists nt_insert on public.note_tags;
  drop policy if exists nt_update on public.note_tags;
  drop policy if exists nt_delete on public.note_tags;
  create policy nt_select on public.note_tags for select using (user_id = auth.uid());
  create policy nt_insert on public.note_tags for insert with check (user_id = auth.uid());
  create policy nt_update on public.note_tags for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy nt_delete on public.note_tags for delete using (user_id = auth.uid());

  -- attachments
  drop policy if exists att_select on public.attachments;
  drop policy if exists att_insert on public.attachments;
  drop policy if exists att_update on public.attachments;
  drop policy if exists att_delete on public.attachments;
  create policy att_select on public.attachments for select using (user_id = auth.uid());
  create policy att_insert on public.attachments for insert with check (user_id = auth.uid());
  create policy att_update on public.attachments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy att_delete on public.attachments for delete using (user_id = auth.uid());

  -- shares
  drop policy if exists sh_select on public.shares;
  drop policy if exists sh_insert on public.shares;
  drop policy if exists sh_update on public.shares;
  drop policy if exists sh_delete on public.shares;
  create policy sh_select on public.shares for select using (user_id = auth.uid());
  create policy sh_insert on public.shares for insert with check (user_id = auth.uid());
  create policy sh_update on public.shares for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy sh_delete on public.shares for delete using (user_id = auth.uid());

  -- templates
  drop policy if exists tpl_select on public.templates;
  drop policy if exists tpl_insert on public.templates;
  drop policy if exists tpl_update on public.templates;
  drop policy if exists tpl_delete on public.templates;
  create policy tpl_select on public.templates for select using (user_id = auth.uid());
  create policy tpl_insert on public.templates for insert with check (user_id = auth.uid());
  create policy tpl_update on public.templates for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy tpl_delete on public.templates for delete using (user_id = auth.uid());

  -- settings
  drop policy if exists set_select on public.settings;
  drop policy if exists set_insert on public.settings;
  drop policy if exists set_update on public.settings;
  drop policy if exists set_delete on public.settings;
  create policy set_select on public.settings for select using (user_id = auth.uid());
  create policy set_insert on public.settings for insert with check (user_id = auth.uid());
  create policy set_update on public.settings for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy set_delete on public.settings for delete using (user_id = auth.uid());

  -- push_subscriptions
  drop policy if exists ps_select on public.push_subscriptions;
  drop policy if exists ps_insert on public.push_subscriptions;
  drop policy if exists ps_update on public.push_subscriptions;
  drop policy if exists ps_delete on public.push_subscriptions;
  create policy ps_select on public.push_subscriptions for select using (user_id = auth.uid());
  create policy ps_insert on public.push_subscriptions for insert with check (user_id = auth.uid());
  create policy ps_update on public.push_subscriptions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy ps_delete on public.push_subscriptions for delete using (user_id = auth.uid());
end $$;

-- storage bucket (private)
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- storage policies
drop policy if exists attachments_read on storage.objects;
drop policy if exists attachments_write on storage.objects;
drop policy if exists attachments_update on storage.objects;
drop policy if exists attachments_delete on storage.objects;
create policy attachments_read on storage.objects for select
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);
create policy attachments_write on storage.objects for insert
  with check (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);
create policy attachments_update on storage.objects for update
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);
create policy attachments_delete on storage.objects for delete
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);

-- safe read via share token
create or replace function public.get_shared_note(share_token text)
returns table (id uuid, title text, content jsonb, content_text text)
language plpgsql security definer set search_path = public as $$
declare
  n_id uuid;
begin
  select s.note_id into n_id
  from public.shares s
  where s.token = share_token
    and s.revoked_at is null
    and (s.expires_at is null or s.expires_at > now());
  if n_id is null then
    return;
  end if;
  return query select notes.id, notes.title, notes.content, notes.content_text
  from public.notes notes where notes.id = n_id;
end;
$$;

grant execute on function public.get_shared_note(text) to anon, authenticated;

-- realtime
do $$
begin
  alter publication supabase_realtime add table public.notes;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.folders;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.tags;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.note_tags;
exception when duplicate_object then null;
end $$;
