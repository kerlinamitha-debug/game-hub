-- Game Hub catalog table and access rules
-- Before running: replace owner@example.com below with your own admin email.
-- Run this whole script in Supabase Dashboard > SQL Editor.

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text not null check (platform in ('pc', 'android')),
  genre text not null default 'Umum',
  description text not null default '',
  symbol text not null default 'GH',
  download_url text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

drop policy if exists "Public can read published games" on public.games;
create policy "Public can read published games"
on public.games for select
to anon, authenticated
using (is_published = true or lower(coalesce(auth.jwt() ->> 'email', '')) = lower('owner@example.com'));

drop policy if exists "Owner can insert games" on public.games;
create policy "Owner can insert games"
on public.games for insert
to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('owner@example.com'));

drop policy if exists "Owner can update games" on public.games;
create policy "Owner can update games"
on public.games for update
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('owner@example.com'))
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('owner@example.com'));

drop policy if exists "Owner can delete games" on public.games;
create policy "Owner can delete games"
on public.games for delete
to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('owner@example.com'));

-- Replace every occurrence of owner@example.com with the exact admin email.
-- Use only the Supabase anon/publishable key in frontend code. Never expose service_role keys.