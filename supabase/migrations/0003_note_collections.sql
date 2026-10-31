-- VINOTE note_collections migration (idempoten)
-- Relasi banyak-ke-banyak: satu catatan bisa di banyak koleksi

create table if not exists public.note_collections (
  note_id uuid not null references public.notes(id) on delete cascade,
  collection_id uuid not null references public.folders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (note_id, collection_id)
);

-- indexes
create index if not exists idx_nc_collection_id on public.note_collections(collection_id);
create index if not exists idx_nc_user_id on public.note_collections(user_id, collection_id);

-- updated_at trigger
drop trigger if exists nc_updated_at on public.note_collections;
create trigger nc_updated_at before update on public.note_collections
  for each row execute function public.set_updated_at();

-- RLS
alter table public.note_collections enable row level security;

do $$
begin
  drop policy if exists nc_select on public.note_collections;
  drop policy if exists nc_insert on public.note_collections;
  drop policy if exists nc_update on public.note_collections;
  drop policy if exists nc_delete on public.note_collections;

  create policy nc_select on public.note_collections for select using (user_id = auth.uid());
  create policy nc_insert on public.note_collections for insert with check (
    user_id = auth.uid() and
    exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()) and
    exists (select 1 from public.folders f where f.id = collection_id and f.user_id = auth.uid())
  );
  create policy nc_update on public.note_collections for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy nc_delete on public.note_collections for delete using (user_id = auth.uid());
end $$;

-- backfill dari folder_id yang sudah terisi
insert into public.note_collections (note_id, collection_id, user_id, created_at, updated_at)
select n.id, n.folder_id, n.user_id, n.created_at, n.updated_at
from public.notes n
where n.folder_id is not null
on conflict (note_id, collection_id) do nothing;

-- realtime
do $$
begin
  alter publication supabase_realtime add table public.note_collections;
exception when duplicate_object then null;
end $$;
