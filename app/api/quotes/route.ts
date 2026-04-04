import { NextRequest, NextResponse } from 'next/server'
import { fetchQuotes, fetchFxRate } from '@/lib/yahoo'

export const runtime = 'edge'

// Auth is enforced by proxy.ts middleware for /api/quotes
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const tickersParam = url.searchParams.get('t') ?? ''
  const tickers = tickersParam.split(',').filter(Boolean)

  const [quotes, gbpusdRate] = await Promise.all([
    tickers.length > 0 ? fetchQuotes(tickers) : Promise.resolve({}),
    fetchFxRate('GBPUSD=X'),
  ])

  return NextResponse.json({ quotes, gbpusdRate }, {
    headers: { 'Cache-Control': 'private, max-age=300' },
  })
}
