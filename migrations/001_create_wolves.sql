-- Run this in your Supabase SQL Editor (Dashboard → SQL)

create table if not exists public.wolves (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  archetype_name text not null,
  personality   text not null,
  origin_story  text not null,
  motto         text not null,
  quiz_answers  jsonb not null,
  seed          text not null,
  rarity        text not null check (rarity in ('common', 'rare', 'legendary')),
  openai_response jsonb,
  openai_usage  jsonb,
  created_at    timestamptz default now()
);

create index if not exists idx_wolves_user_id on public.wolves(user_id);
create index if not exists idx_wolves_created_at on public.wolves(created_at);
create index if not exists idx_wolves_seed on public.wolves(seed);

-- Enable Row-Level Security
alter table public.wolves enable row level security;

-- Anyone can view wolves by id (needed for share pages)
create policy "Anyone can view wolves"
  on public.wolves for select using (true);

-- Service role key (used by API routes) bypasses RLS by default.
