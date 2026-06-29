-- Shared Move Checklist — Schema
-- Run this in the Supabase SQL editor (or via migration tooling)
--
-- NOTE: Unlike the portfolio tables (holdings, watchlist, etc.) which use
-- owner-isolation RLS (user_id = auth.uid()), the move checklist is SHARED.
-- Both household members read/write the SAME rows. A "household member" is any
-- authenticated user that has a row in `profiles`. That table doubles as the
-- shared-access allowlist.

-- ── Profiles: household members + display names (also the access allowlist) ──
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- ── Move tasks: shared across all household members ──
create table if not exists move_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text not null default '',
  category text not null default 'misc'
    check (category in (
      'property_legal','packing_moving','utilities','address_changes',
      'schools_childcare','pets_deliveries','new_home','misc'
    )),
  assigned_to uuid references profiles(user_id) on delete set null,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by uuid references profiles(user_id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(user_id) on delete set null
);

create index if not exists move_tasks_category_idx on move_tasks (category, sort_order);

-- ── Row Level Security ──
alter table profiles enable row level security;
alter table move_tasks enable row level security;

-- Helper: is the current user a household member? (SECURITY DEFINER avoids
-- the recursive RLS evaluation you'd hit referencing `profiles` from its own policy.)
create or replace function is_household_member()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from profiles where user_id = auth.uid());
$$;

-- Profiles: any household member can read every member (for the assignee dropdown).
drop policy if exists "profiles_household_read" on profiles;
create policy "profiles_household_read" on profiles
  for select
  using (is_household_member());

-- Move tasks: any household member can do everything to every task (shared state).
drop policy if exists "move_tasks_household_all" on move_tasks;
create policy "move_tasks_household_all" on move_tasks
  for all
  using (is_household_member())
  with check (is_household_member());
