import { formatPounds, formatPercent, gainColour } from '@/lib/utils'
import type { QuoteMap } from '@/lib/yahoo'

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
}

export default function SummaryBar({ holdings, quotes, gbpusdRate }: Props) {
  let totalValue = 0
  let totalCost = 0
  let totalDayChange = 0
  let hasPrices = false

  // Convert USD amount to GBP using live rate (fallback: ~1.27 if unavailable)
  const rate = gbpusdRate ?? 1.27
  function toGBP(amount: number, currency: string | null): number {
    return currency === 'USD' ? amount / rate : amount
  }

  for (const h of holdings) {
    const q = quotes[h.ticker]
    const currency = q?.currency ?? null

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
      totalDayChange += toGBP(changeNative * h.shares, currency === 'GBp' ? 'GBP' : currency)
    }
  }

  const totalPnL = hasPrices ? totalValue - totalCost : null
  const totalPnLPercent = hasPrices && totalCost > 0
    ? ((totalValue - totalCost) / totalCost) * 100
    : null
  const dayChangePercent = hasPrices && (totalValue - totalDayChange) > 0
    ? (totalDayChange / (totalValue - totalDayChange)) * 100
    : null

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-[3px] overflow-hidden mb-8">
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
  )
}
