-- Auto-purge trashed notes older than 30 days
-- Run this via Supabase SQL Editor or as part of a cron job

create or replace function purge_expired_trash()
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

-- Optional: schedule with pg_cron if extension is available
-- call cron.schedule('purge-expired-trash', '0 3 * * *', 'select purge_expired_trash();');
