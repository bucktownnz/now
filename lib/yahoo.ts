export interface QuoteData {
  ticker: string
  regularMarketPrice: number | null
  regularMarketChange: number | null
  regularMarketChangePercent: number | null   // decimal: 0.0123 = 1.23%
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  trailingPE: number | null
  marketCap: number | null
  currency: string | null
  // Native price: GBp converted to GBP (÷100), USD/others used directly
  nativePrice: number | null
}

export type QuoteMap = Record<string, QuoteData>

interface CacheEntry {
  data: QuoteMap
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

function cacheKey(tickers: string[]): string {
  return [...tickers].sort().join(',')
}

function toNativePrice(price: number | null | undefined, currency: string | null | undefined): number | null {
  if (price == null) return null
  if (currency === 'GBp') return price / 100
  return price
}

// Browser-like headers so Yahoo Finance doesn't block the request
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
}

// Yahoo Finance v8 chart API — does not require a crumb token
async function fetchSingleQuote(ticker: string): Promise<QuoteData> {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d&includePrePost=false`
  const res = await fetch(url, { headers: FETCH_HEADERS })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const meta = data.chart?.result?.[0]?.meta

  if (!meta) {
    throw new Error('No chart data in response')
  }

  const currency = meta.currency ?? null
  const rawPrice = meta.regularMarketPrice ?? null
  const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? null
  const change = rawPrice != null && prevClose != null ? rawPrice - prevClose : null
  // Express as decimal (0.0123) to match formatPercentRaw expectations
  const changePercent =
    change != null && prevClose != null && prevClose !== 0 ? change / prevClose : null

  return {
    ticker,
    regularMarketPrice: rawPrice,
    regularMarketChange: change,
    regularMarketChangePercent: changePercent,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    trailingPE: null,  // not available from chart v8 API
    marketCap: meta.marketCap ?? null,
    currency,
    nativePrice: toNativePrice(rawPrice, currency),
  }
}

export async function fetchQuotes(tickers: string[]): Promise<QuoteMap> {
  if (tickers.length === 0) return {}

  const key = cacheKey(tickers)
  const cached = cache.get(key)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data
  }

  const result: QuoteMap = {}

  await Promise.allSettled(
    tickers.map(async (ticker) => {
      try {
        result[ticker] = await fetchSingleQuote(ticker)
      } catch (err) {
        console.error(`[yahoo] failed to fetch ${ticker}:`, err)
        result[ticker] = {
          ticker,
          regularMarketPrice: null,
          regularMarketChange: null,
          regularMarketChangePercent: null,
          fiftyTwoWeekHigh: null,
          fiftyTwoWeekLow: null,
          trailingPE: null,
          marketCap: null,
          currency: null,
          nativePrice: null,
        }
      }
    })
  )

  cache.set(key, { data: result, expiresAt: Date.now() + TTL_MS })
  return result
}

/** Fetch a live FX rate, e.g. 'GBPUSD=X' → 1.28. Returns null on failure. */
export async function fetchFxRate(pair: string): Promise<number | null> {
  try {
    const q = await fetchSingleQuote(pair)
    return q.regularMarketPrice
  } catch {
    return null
  }
}
