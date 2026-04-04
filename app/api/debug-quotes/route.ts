import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Temporary debug route — no auth, remove after diagnosis
export async function GET() {
  const ticker = 'TSLA'
  try {
    const yf = new YahooFinance()
    const result = await yf.quote(ticker)
    return NextResponse.json({
      ok: true,
      ticker,
      price: result.regularMarketPrice,
      currency: result.currency,
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      ticker,
      error: String(err),
      stack: err instanceof Error ? err.stack : undefined,
    })
  }
}
