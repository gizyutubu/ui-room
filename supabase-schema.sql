-- UI Room / Supabase setup
-- Supabase Dashboard > SQL Editorで、このファイルを何度実行しても安全です。
create table if not exists public.room_store (
  room_id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.user_store (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.room_store enable row level security;
alter table public.user_store enable row level security;
grant select, insert, update, delete on public.room_store to authenticated;
grant select, insert, update, delete on public.user_store to authenticated;

drop policy if exists "authenticated users can use room store" on public.room_store;
create policy "authenticated users can use room store" on public.room_store
  for all to authenticated using (true) with check (true);
drop policy if exists "users can use their own store" on public.user_store;
create policy "users can use their own store" on public.user_store
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Realtimeでroom_storeの変更を配信。既に追加済みでもエラーになりません。
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'room_store'
  ) then
    alter publication supabase_realtime add table public.room_store;
  end if;
end
$$;
