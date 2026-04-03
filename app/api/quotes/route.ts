import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchQuotes } from '@/lib/yahoo'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let tickers: string[]

  try {
    const body = await request.json()
    tickers = body.tickers
    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ error: 'tickers must be a non-empty array' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const quotes = await fetchQuotes(tickers)

  return NextResponse.json(quotes, {
    headers: {
      'Cache-Control': 'private, max-age=300',
    },
  })
}
