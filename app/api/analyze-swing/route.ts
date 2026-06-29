import { createClient } from '@/lib/supabase/server'
import { fetchNews } from '@/lib/news'
import { fetchQuotes } from '@/lib/yahoo'
import { analyzeSwingSetup } from '@/lib/agents'

// Node.js runtime — Claude API calls timeout on Edge
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let ticker: string
  let name: string
  let watchlistNotes: string

  try {
    const body = await request.json()
    ticker = String(body.ticker ?? '').toUpperCase().trim()
    name = String(body.name ?? '').trim()
    watchlistNotes = String(body.notes ?? '').trim()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!ticker || !name) {
    return Response.json({ error: 'ticker and name are required' }, { status: 400 })
  }

  try {
    const [news, quotesMap] = await Promise.all([
      fetchNews(ticker),
      fetchQuotes([ticker]),
    ])

    const currentPrice = quotesMap[ticker]?.nativePrice ?? null

    const analysis = await analyzeSwingSetup({
      ticker,
      companyName: name,
      news,
      watchlistNotes,
      currentPrice,
    })

    return Response.json({ analysis })
  } catch (err) {
    console.error(`[analyze-swing] failed for ${ticker}:`, err)
    return Response.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
