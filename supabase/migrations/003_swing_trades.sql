-- Swing Trades — Schema
-- Separate from long-term holdings: tracks short-to-medium term positions
-- with entry price, target, stop loss, catalyst thesis, and closed P&L.

create table if not exists swing_trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker text not null,
  name text not null,
  shares numeric not null,
  entry_price_pence numeric not null,   -- stored as £/$ per share (same convention as holdings.avg_cost_pence)
  target_price_pence numeric,           -- exit target (£/$ per share)
  stop_loss_pence numeric,              -- invalidation level (£/$ per share)
  catalyst text not null default '',    -- short-horizon trade thesis / trigger
  horizon text not null default '',     -- expected hold duration e.g. "1–2 weeks"
  status text not null default 'open',  -- 'open' | 'closed' | 'cancelled'
  exit_price_pence numeric,             -- filled when status = 'closed'
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text not null default ''
);

-- Row Level Security
alter table swing_trades enable row level security;

create policy "swing_trades_owner" on swing_trades
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index for dashboard query (open trades, newest first)
create index if not exists swing_trades_user_status_idx
  on swing_trades (user_id, status, opened_at desc);
