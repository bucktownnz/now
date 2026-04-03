/**
 * One-time seed script for watchlist dashboard.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   SEED_USER_ID=<your-auth-user-id> \
 *   npx ts-node --esm scripts/seed.ts
 *
 * Get your user ID from Supabase dashboard → Authentication → Users.
 * Use the service role key (not the anon key) — found in Project Settings → API.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SEED_USER_ID = process.env.SEED_USER_ID

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SEED_USER_ID) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_USER_ID')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const holdings = [
  {
    ticker: 'BAES.L',
    name: 'BAE Systems',
    shares: 100,
    avg_cost_pence: 1100,
    sector: 'Aerospace & Defence',
    thesis: 'UK defence spending tailwind. NATO 2% GDP commitment drives structural demand. Strong order book with visibility. Dividend grower.',
  },
  {
    ticker: 'DARK.L',
    name: 'Darktrace',
    shares: 200,
    avg_cost_pence: 450,
    sector: 'Technology',
    thesis: 'AI-native cybersecurity. Self-learning engine differentiates from rules-based competitors. Growing enterprise ARR.',
  },
  {
    ticker: 'LLOY.L',
    name: 'Lloyds Banking Group',
    shares: 1000,
    avg_cost_pence: 48,
    sector: 'Financials',
    thesis: 'UK domestic bank. Cheap on P/E and P/B. Beneficiary of rate normalisation. Capital return story via buybacks and dividends.',
  },
]

const watchlistItems = [
  {
    ticker: 'GSK.L',
    name: 'GSK',
    notes: 'Post-Haleon spin-off recovery. Pipeline optionality. Watching for RSV vaccine revenues.',
  },
  {
    ticker: 'EXPN.L',
    name: 'Experian',
    notes: 'High quality compounder. Data network effects. Expensive but worth monitoring for a better entry.',
  },
]

async function main() {
  // Check if already seeded
  const { data: existing } = await supabase
    .from('holdings')
    .select('id')
    .eq('user_id', SEED_USER_ID)
    .limit(1)

  if (existing && existing.length > 0) {
    console.log('Already seeded — skipping. Delete existing rows first to re-seed.')
    process.exit(0)
  }

  console.log('Seeding holdings…')
  const { error: holdingsError } = await supabase.from('holdings').insert(
    holdings.map((h) => ({ ...h, user_id: SEED_USER_ID }))
  )
  if (holdingsError) {
    console.error('Holdings insert error:', holdingsError.message)
    process.exit(1)
  }
  console.log(`  ✓ Inserted ${holdings.length} holdings`)

  console.log('Seeding watchlist…')
  const { error: watchlistError } = await supabase.from('watchlist').insert(
    watchlistItems.map((w) => ({ ...w, user_id: SEED_USER_ID }))
  )
  if (watchlistError) {
    console.error('Watchlist insert error:', watchlistError.message)
    process.exit(1)
  }
  console.log(`  ✓ Inserted ${watchlistItems.length} watchlist items`)

  console.log('Done. Visit your dashboard to see the seeded data.')
}

main()
