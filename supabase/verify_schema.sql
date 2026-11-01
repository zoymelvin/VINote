-- verify_schema.sql
-- Read-only schema verification script for Supabase SQL Editor.
-- Paste results into the diagnostic page or share with developer.

-- 1. Tables
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;

-- 2. Columns per table
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 3. RLS status
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 4. Policies
select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 5. Storage buckets
select id, name, public from storage.buckets;

-- 6. Realtime publication
select schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';

-- 7. Functions
select routine_name from information_schema.routines
where routine_schema = 'public' and routine_type = 'FUNCTION'
order by routine_name;
