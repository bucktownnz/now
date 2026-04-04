import YahooFinance from 'yahoo-finance2'

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

/** Convert raw Yahoo price to a comparable native price.
 *  UK stocks come back as GBp (pence) — divide by 100 to get GBP.
 *  US stocks come back as USD — use directly. */
function toNativePrice(price: number | null | undefined, currency: string | null | undefined): number | null {
  if (price == null) return null
  if (currency === 'GBp') return price / 100
  return price
}

export async function fetchQuotes(tickers: string[]): Promise<QuoteMap> {
  if (tickers.length === 0) return {}

  const key = cacheKey(tickers)
  const cached = cache.get(key)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data
  }

  // Create instance per call — avoids module-level state issues in serverless
  const yf = new YahooFinance()

  const result: QuoteMap = {}

  await Promise.allSettled(
    tickers.map(async (ticker) => {
      try {
        const q = await yf.quote(ticker)
        const currency = q.currency ?? null
        const rawPrice = q.regularMarketPrice ?? null
        result[ticker] = {
          ticker,
          regularMarketPrice: rawPrice,
          regularMarketChange: q.regularMarketChange ?? null,
          regularMarketChangePercent: q.regularMarketChangePercent ?? null,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
          trailingPE: q.trailingPE ?? null,
          marketCap: q.marketCap ?? null,
          currency,
          nativePrice: toNativePrice(rawPrice, currency),
        }
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
