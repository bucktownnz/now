import { NextResponse } from 'next/server'

// Temporary debug route — no auth, remove after diagnosis
export async function GET() {
  const ticker = 'TSLA'
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d&includePrePost=false`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    const text = await res.text()

    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body: text.slice(0, 500) })
    }

    const data = JSON.parse(text)
    const meta = data.chart?.result?.[0]?.meta

    return NextResponse.json({
      ok: true,
      status: res.status,
      ticker,
      price: meta?.regularMarketPrice,
      currency: meta?.currency,
      prevClose: meta?.previousClose ?? meta?.chartPreviousClose,
      fiftyTwoWeekHigh: meta?.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta?.fiftyTwoWeekLow,
      marketCap: meta?.marketCap,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) })
  }
}
