export interface NewsItem {
  title: string
  publisher: string
  url: string
  publishedAt: Date | null
}

// Same browser-like headers as lib/yahoo.ts to avoid Yahoo blocking
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
}

/**
 * Fetch recent news items for a ticker from Yahoo Finance search API.
 * Returns up to 10 items; caller is responsible for filtering by date.
 */
export async function fetchNews(ticker: string): Promise<NewsItem[]> {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=10&enableNews=true&lang=en-US`

  const res = await fetch(url, { headers: FETCH_HEADERS })
  if (!res.ok) {
    throw new Error(`Yahoo Finance news HTTP ${res.status} for ${ticker}`)
  }

  const data = await res.json()
  const raw: Array<{
    title?: string
    publisher?: string
    link?: string
    providerPublishTime?: number
  }> = data?.news ?? []

  return raw
    .filter((item) => item.title)
    .map((item) => ({
      title: item.title!,
      publisher: item.publisher ?? 'Unknown',
      url: item.link ?? '',
      publishedAt: item.providerPublishTime
        ? new Date(item.providerPublishTime * 1000)
        : null,
    }))
}
