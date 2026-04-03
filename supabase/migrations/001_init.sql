-- Watchlist Dashboard — Initial Schema
-- Run this in the Supabase SQL editor

create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker text not null,
  name text not null,
  shares numeric not null,
  avg_cost_pence numeric not null,
  thesis text not null default '',
  sector text not null default '',
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker text not null,
  name text not null,
  notes text not null default '',
  added_at timestamptz not null default now()
);

-- Row Level Security
alter table holdings enable row level security;
alter table watchlist enable row level security;

-- Policies: owner can do everything
create policy "holdings_owner" on holdings
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "watchlist_owner" on watchlist
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Auto-update updated_at on holdings
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger holdings_updated_at
  before update on holdings
  for each row
  execute procedure update_updated_at();
