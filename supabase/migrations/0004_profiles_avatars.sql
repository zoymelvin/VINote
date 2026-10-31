-- VINOTE profiles and avatars migration (idempoten)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_path text,
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_profiles_username_lower on public.profiles (lower(username));

-- RLS
alter table public.profiles enable row level security;

do $$
begin
  drop policy if exists profiles_select on public.profiles;
  drop policy if exists profiles_insert on public.profiles;
  drop policy if exists profiles_update on public.profiles;
  drop policy if exists profiles_delete on public.profiles;

  create policy profiles_select on public.profiles for select using (user_id = auth.uid());
  create policy profiles_insert on public.profiles for insert with check (user_id = auth.uid());
  create policy profiles_update on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  create policy profiles_delete on public.profiles for delete using (user_id = auth.uid());
end $$;

-- RPC for username availability
create or replace function public.is_username_available(p_username text, p_user_id uuid default null)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_username is null or length(trim(p_username)) = 0 then
    return false;
  end if;
  return not exists (
    select 1 from public.profiles p
    where lower(p.username) = lower(p_username)
      and (p_user_id is null or p.user_id <> p_user_id)
  );
end;
$$;

grant execute on function public.is_username_available(text, uuid) to anon, authenticated;

-- storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- storage policies
drop policy if exists avatars_read on storage.objects;
drop policy if exists avatars_write on storage.objects;
drop policy if exists avatars_update on storage.objects;
drop policy if exists avatars_delete on storage.objects;

create policy avatars_read on storage.objects for select
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy avatars_write on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy avatars_update on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy avatars_delete on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- realtime
do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;
