/** Convert pence to formatted pounds string: 134000 → "£1,340.00" */
export function penceToPounds(pence: number | null | undefined): string {
  if (pence == null) return '—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pence / 100)
}

/** Format a number as pounds (already in pounds): 1340 → "£1,340.00" */
export function formatPounds(pounds: number | null | undefined): string {
  if (pounds == null) return '—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pounds)
}

/** Format percent with sign: 1.234 → "+1.23%" */
export function formatPercent(n: number | null | undefined): string {
  if (n == null) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

/** Format a raw percent value (e.g. 0.0123 → "+1.23%") */
export function formatPercentRaw(n: number | null | undefined): string {
  if (n == null) return '—'
  return formatPercent(n * 100)
}

/** Tailwind text colour class for a gain/loss value */
export function gainColour(n: number | null | undefined): string {
  if (n == null) return 'text-text-muted'
  return n >= 0 ? 'text-gain' : 'text-loss'
}

/** Tailwind border colour class for a gain/loss value */
export function gainBorderColour(n: number | null | undefined): string {
  if (n == null) return 'border-border'
  return n >= 0 ? 'border-gain' : 'border-loss'
}

/** Format pence as a display price: 134025 → "1,340.25p" */
export function formatPence(pence: number | null | undefined): string {
  if (pence == null) return '—'
  return `${new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pence)}p`
}

/** Format market cap: 1_200_000_000 → "£1.2B" */
export function formatMarketCap(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1e9) return `£${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `£${(n / 1e6).toFixed(0)}M`
  return `£${n.toLocaleString('en-GB')}`
}

/** Format P/E ratio: 18.5 → "18.5x" */
export function formatPE(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${n.toFixed(1)}x`
}

/** Calculate P&L in pounds: (currentPence - avgCostPence) * shares / 100 */
export function calcPnLPounds(
  currentPricePence: number | null,
  avgCostPence: number,
  shares: number
): number | null {
  if (currentPricePence == null) return null
  return ((currentPricePence - avgCostPence) * shares) / 100
}

/** Calculate P&L percent: (current - avgCost) / avgCost * 100 */
export function calcPnLPercent(
  currentPricePence: number | null,
  avgCostPence: number
): number | null {
  if (currentPricePence == null || avgCostPence === 0) return null
  return ((currentPricePence - avgCostPence) / avgCostPence) * 100
}

/** Format date: ISO string → "3 Apr 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** "X minutes ago" or "just now" */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 minute ago'
  return `${minutes} minutes ago`
}
