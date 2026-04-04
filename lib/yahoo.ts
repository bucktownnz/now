import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export interface QuoteData {
  ticker: string
  regularMarketPrice: number | null
  regularMarketChange: number | null
  regularMarketChangePercent: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  trailingPE: number | null
  marketCap: number | null
  currency: string | null
}

export type QuoteMap = Record<string, QuoteData>

interface CacheEntry {
  data: QuoteMap
  expiresAt: number
}

// Simple in-memory cache — TTL 5 minutes
const cache = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

function cacheKey(tickers: string[]): string {
  return [...tickers].sort().join(',')
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
        const q = await yf.quote(ticker)
        result[ticker] = {
          ticker,
          regularMarketPrice: q.regularMarketPrice ?? null,
          regularMarketChange: q.regularMarketChange ?? null,
          regularMarketChangePercent: q.regularMarketChangePercent ?? null,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
          trailingPE: q.trailingPE ?? null,
          marketCap: q.marketCap ?? null,
          currency: q.currency ?? null,
        }
      } catch {
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
        }
      }
    })
  )

  cache.set(key, { data: result, expiresAt: Date.now() + TTL_MS })
  return result
}
