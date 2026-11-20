-- UI Room: メールを使わない名前＋パスワード認証
create table if not exists public.ui_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,
  password_hash text not null,
  color text not null default '#8d7cff',
  created_at timestamptz not null default now()
);
create table if not exists public.ui_sessions (
  token_hash text primary key,
  user_id uuid not null references public.ui_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
-- Edge Functionのみがservice_roleでアクセスするため、ブラウザ権限は付与しません。
revoke all on public.ui_users from anon, authenticated;
revoke all on public.ui_sessions from anon, authenticated;
