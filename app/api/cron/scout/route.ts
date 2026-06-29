import { createAdminClient } from '@/lib/supabase/admin'
import { fetchNews } from '@/lib/news'
import { fetchQuotes } from '@/lib/yahoo'
import type { QuoteMap } from '@/lib/yahoo'
import { analyzeSwingSetup } from '@/lib/agents'

// Node.js runtime — Claude API calls timeout on Edge.
export const runtime = 'nodejs'
// Allow up to 5 min — the loop runs sequentially through the watchlist.
export const maxDuration = 300

interface WatchlistRow {
  id: string
  user_id: string
  ticker: string
  name: string
  notes: string
}

/**
 * Morning scout loop — the "heartbeat" of the swing-trade loop.
 *
 * Triggered by Vercel Cron (see vercel.json). Iterates every watchlist item,
 * runs the swing-setup analyser, and upserts the result into scout_results so
 * the dashboard can render pre-computed setups with a freshness timestamp.
 *
 * Protected by CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: watchlist, error } = await supabase
    .from('watchlist')
    .select('id, user_id, ticker, name, notes')
    .order('added_at', { ascending: true })

  if (error) {
    console.error('[cron/scout] failed to load watchlist:', error)
    return Response.json({ error: 'Failed to load watchlist' }, { status: 500 })
  }

  const items = (watchlist ?? []) as WatchlistRow[]
  const results: { ticker: string; ok: boolean; error?: string }[] = []

  // Sequential — keeps us well under Claude rate limits and Yahoo throttling.
  for (const item of items) {
    try {
      const [news, quotesMap] = await Promise.all([
        fetchNews(item.ticker).catch(() => []),
        fetchQuotes([item.ticker]).catch(() => ({} as QuoteMap)),
      ])
      const currentPrice = quotesMap[item.ticker]?.nativePrice ?? null

      const analysis = await analyzeSwingSetup({
        ticker: item.ticker,
        companyName: item.name,
        news,
        watchlistNotes: item.notes ?? '',
        currentPrice,
      })

      // Read prior conviction for change detection before overwriting.
      const { data: prior } = await supabase
        .from('scout_results')
        .select('conviction')
        .eq('user_id', item.user_id)
        .eq('ticker', item.ticker)
        .maybeSingle()

      const { error: upsertError } = await supabase
        .from('scout_results')
        .upsert(
          {
            user_id: item.user_id,
            ticker: item.ticker,
            name: item.name,
            setup_quality: analysis.setup_quality,
            catalyst: analysis.catalyst,
            entry_rationale: analysis.entry_rationale,
            target_rationale: analysis.target_rationale,
            invalidation: analysis.invalidation,
            conviction: analysis.conviction,
            horizon: analysis.horizon,
            prev_conviction: prior?.conviction ?? null,
            current_price: currentPrice,
            scouted_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,ticker' }
        )

      if (upsertError) throw upsertError
      results.push({ ticker: item.ticker, ok: true })
    } catch (err) {
      console.error(`[cron/scout] failed for ${item.ticker}:`, err)
      results.push({
        ticker: item.ticker,
        ok: false,
        error: err instanceof Error ? err.message : 'unknown',
      })
    }
  }

  const succeeded = results.filter((r) => r.ok).length
  console.log(`[cron/scout] scouted ${succeeded}/${items.length} tickers`)

  return Response.json({
    scouted: succeeded,
    total: items.length,
    results,
  })
}
