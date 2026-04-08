-- AI Stock Announcement Analysis — Schema
-- Run this in the Supabase SQL editor after 001_init.sql

-- ─── Portfolio-level thesis / settings ───────────────────────────────────────

create table if not exists portfolio_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  portfolio_thesis text not null default '',
  updated_at timestamptz not null default now()
);

alter table portfolio_settings enable row level security;

create policy "portfolio_settings_owner" on portfolio_settings
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─── Per-announcement thesis impact analysis ──────────────────────────────────

create table if not exists thesis_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id uuid references holdings(id) on delete cascade,
  ticker text not null,
  -- Announcement data
  announcement_title text not null,
  announcement_publisher text,
  announcement_url text,
  announcement_date timestamptz,
  -- Agent 1 output: thesis impact
  thesis_impact text not null check (thesis_impact in ('strengthens', 'weakens', 'neutral')),
  impact_explanation text not null,
  impact_confidence text check (impact_confidence in ('high', 'medium', 'low')),
  -- Metadata
  analyzed_at timestamptz not null default now()
);

alter table thesis_analyses enable row level security;

create policy "thesis_analyses_owner" on thesis_analyses
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index thesis_analyses_user_ticker_date
  on thesis_analyses (user_id, ticker, analyzed_at desc);

-- ─── Per-holding position recommendation ─────────────────────────────────────

create table if not exists position_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id uuid references holdings(id) on delete cascade,
  ticker text not null,
  -- Agent 2 output: position recommendation
  recommendation text not null check (recommendation in ('accumulate', 'hold', 'reduce', 'exit')),
  rationale text not null,
  urgency text check (urgency in ('immediate', 'consider', 'monitor')),
  portfolio_alignment text,
  -- Metadata
  recommended_at timestamptz not null default now(),
  -- One recommendation per user+ticker, upserted on each analysis run
  unique (user_id, ticker)
);

alter table position_recommendations enable row level security;

create policy "position_recommendations_owner" on position_recommendations
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
