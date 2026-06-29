import { formatPounds, formatPercent, gainColour } from '@/lib/utils'
import type { QuoteMap } from '@/lib/yahoo'
import type { SwingTrade } from './SwingTradesTable'

interface Holding {
  id: string
  ticker: string
  shares: number
  avg_cost_pence: number  // stored as £/$ per share (not actual pence)
}

interface Props {
  holdings: Holding[]
  quotes: QuoteMap
  gbpusdRate: number | null
  swingTrades?: SwingTrade[]
  swingBudget?: number
}

export default function SummaryBar({ holdings, quotes, gbpusdRate, swingTrades = [], swingBudget = 1000 }: Props) {
  let totalValue = 0
  let totalCost = 0
  let totalDayChange = 0
  let hasPrices = false

  // Convert USD amount to GBP using live rate (fallback: ~1.27 if unavailable)
  const rate = gbpusdRate ?? 1.27

  // Derive currency from ticker when Yahoo data unavailable:
  // Tickers ending in .L are LSE (GBP), otherwise assume USD
  function tickerCurrency(ticker: string): string {
    return ticker.endsWith('.L') ? 'GBP' : 'USD'
  }

  function toGBP(amount: number, currency: string): number {
    return currency === 'USD' ? amount / rate : amount
  }

  for (const h of holdings) {
    const q = quotes[h.ticker]
    // Use Yahoo currency if available, else derive from ticker
    const currency = q?.currency === 'GBp' ? 'GBP' : (q?.currency ?? tickerCurrency(h.ticker))

    totalCost += toGBP(h.avg_cost_pence * h.shares, currency)

    if (q?.nativePrice != null) {
      hasPrices = true
      totalValue += toGBP(q.nativePrice * h.shares, currency)
    }
    if (q?.regularMarketChange != null) {
      // regularMarketChange is in the raw currency — convert GBp to GBP first
      const changeNative = currency === 'GBp'
        ? q.regularMarketChange / 100
        : q.regularMarketChange
      totalDayChange += toGBP(changeNative * h.shares, currency)
    }
  }

  const totalPnL = hasPrices ? totalValue - totalCost : null
  const totalPnLPercent = hasPrices && totalCost > 0
    ? ((totalValue - totalCost) / totalCost) * 100
    : null
  const dayChangePercent = hasPrices && (totalValue - totalDayChange) > 0
    ? (totalDayChange / (totalValue - totalDayChange)) * 100
    : null

  // ── Swing trade stats ────────────────────────────────────────────────────────
  let swingDeployed = 0
  let swingUnrealisedPnL = 0
  let swingHasPrices = false

  for (const s of swingTrades) {
    const currency = s.ticker.endsWith('.L') ? 'GBP' : 'USD'
    swingDeployed += toGBP(s.entry_price_pence * s.shares, currency)
    const q = quotes[s.ticker]
    if (q?.nativePrice != null) {
      swingHasPrices = true
      const pnlNative = (q.nativePrice - s.entry_price_pence) * s.shares
      swingUnrealisedPnL += toGBP(pnlNative, currency)
    }
  }

  const swingAvailable = Math.max(0, swingBudget - swingDeployed)

  const stats = [
    {
      label: 'Total Value',
      value: hasPrices ? formatPounds(totalValue) : '—',
      sub: null,
      colourClass: 'text-site-text',
    },
    {
      label: 'Total Cost',
      value: formatPounds(totalCost),
      sub: null,
      colourClass: 'text-site-text',
    },
    {
      label: 'Day Change',
      value: hasPrices ? formatPounds(totalDayChange) : '—',
      sub: dayChangePercent != null ? formatPercent(dayChangePercent) : null,
      colourClass: gainColour(totalDayChange),
    },
    {
      label: 'Total P&L',
      value: totalPnL != null ? formatPounds(totalPnL) : '—',
      sub: totalPnLPercent != null ? formatPercent(totalPnLPercent) : null,
      colourClass: gainColour(totalPnL),
    },
  ]

  const swingStats = [
    {
      label: 'Swing Deployed',
      value: formatPounds(swingDeployed),
      sub: `of ${formatPounds(swingBudget)}`,
      colourClass: 'text-site-text',
    },
    {
      label: 'Available',
      value: formatPounds(swingAvailable),
      sub: null,
      colourClass: 'text-site-text',
    },
    {
      label: 'Swing P&L',
      value: swingHasPrices ? formatPounds(swingUnrealisedPnL) : '—',
      sub: null,
      colourClass: gainColour(swingHasPrices ? swingUnrealisedPnL : null),
    },
    {
      label: 'Open Trades',
      value: String(swingTrades.length),
      sub: null,
      colourClass: 'text-site-text',
    },
  ]

  return (
    <div className="flex flex-col gap-2 mb-8">
      {/* Long-term portfolio */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-[3px] overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-2 px-4 py-4">
            <p
              className="text-text-muted mb-1"
              style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              {stat.label}
            </p>
            <p className={`font-mono text-sm font-normal ${stat.colourClass}`}>
              {stat.value}
              {stat.sub && (
                <span className="text-text-muted ml-1.5" style={{ fontSize: '0.75rem' }}>
                  {stat.sub}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Swing trades summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-[3px] overflow-hidden">
        {swingStats.map((stat) => (
          <div key={stat.label} className="bg-bg-2/60 px-4 py-3">
            <p
              className="text-text-muted mb-1"
              style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              {stat.label}
            </p>
            <p className={`font-mono text-sm font-normal ${stat.colourClass}`}>
              {stat.value}
              {stat.sub && (
                <span className="text-text-muted ml-1.5" style={{ fontSize: '0.7rem' }}>
                  {stat.sub}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
