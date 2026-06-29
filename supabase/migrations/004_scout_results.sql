-- Scout Results — Loop Engineering "state file"
-- The morning scout loop (Vercel cron → /api/cron/scout) writes one row per
-- user+ticker here. The dashboard reads it so swing setups are pre-computed,
-- not analysed on-demand. prev_conviction lets the UI flag changes since the
-- last run ("conviction upgraded fair → good").

create table if not exists scout_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  name text not null,
  -- SwingAnalysis payload (mirrors lib/agents.ts SwingAnalysis)
  setup_quality text not null check (setup_quality in ('good', 'fair', 'poor')),
  catalyst text not null default '',
  entry_rationale text not null default '',
  target_rationale text not null default '',
  invalidation text not null default '',
  conviction text not null check (conviction in ('high', 'medium', 'low')),
  horizon text not null default '',
  -- Change detection: what the conviction was on the previous scout run
  prev_conviction text check (prev_conviction in ('high', 'medium', 'low')),
  current_price numeric,
  -- Metadata
  scouted_at timestamptz not null default now(),
  -- One result per user+ticker, upserted each run
  unique (user_id, ticker)
);

alter table scout_results enable row level security;

create policy "scout_results_owner" on scout_results
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists scout_results_user_scouted_idx
  on scout_results (user_id, scouted_at desc);
