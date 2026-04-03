import yahooFinance from 'yahoo-finance2'

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
        const quote = await yahooFinance.quoteSummary(ticker, {
          modules: ['price'],
        })
        const price = quote.price
        result[ticker] = {
          ticker,
          regularMarketPrice: price?.regularMarketPrice ?? null,
          regularMarketChange: price?.regularMarketChange ?? null,
          regularMarketChangePercent: price?.regularMarketChangePercent ?? null,
          fiftyTwoWeekHigh: price?.fiftyTwoWeekHigh ?? null,
          fiftyTwoWeekLow: price?.fiftyTwoWeekLow ?? null,
          trailingPE: price?.trailingPE ?? null,
          marketCap: price?.marketCap ?? null,
          currency: price?.currency ?? null,
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
