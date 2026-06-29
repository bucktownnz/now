'use client'

import { useRouter } from 'next/navigation'
import { deleteSwingTrade } from '@/app/actions'
import { formatDate, formatPercent, formatPounds, gainColour } from '@/lib/utils'
import type { SwingTrade } from './SwingTradesTable'

interface Props {
  trades: SwingTrade[]
}

function tickerCurrency(ticker: string): string {
  return ticker.endsWith('.L') ? 'GBP' : 'USD'
}

function calcClosedPnL(trade: SwingTrade, gbpusdRate: number) {
  if (!trade.exit_price_pence) return { pounds: null, percent: null }
  const currency = tickerCurrency(trade.ticker)
  const nativePnL = (trade.exit_price_pence - trade.entry_price_pence) * trade.shares
  const pounds = currency === 'USD' ? nativePnL / gbpusdRate : nativePnL
  const percent = trade.entry_price_pence > 0
    ? ((trade.exit_price_pence - trade.entry_price_pence) / trade.entry_price_pence) * 100
    : null
  return { pounds, percent }
}

function tradeDuration(openedAt: string, closedAt: string | null): string {
  if (!closedAt) return '—'
  const days = Math.round(
    (new Date(closedAt).getTime() - new Date(openedAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days === 0) return 'same day'
  return `${days} day${days !== 1 ? 's' : ''}`
}

export default function ClosedTradesTable({ trades }: Props) {
  const router = useRouter()

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete closed trade for ${name}?`)) return
    await deleteSwingTrade(id)
    router.refresh()
  }

  if (trades.length === 0) {
    return (
      <p className="text-text-muted italic" style={{ fontSize: '0.875rem' }}>
        No closed trades yet.
      </p>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Name', 'Entry', 'Exit', 'Shares', 'P&L £', 'P&L %', 'Duration', 'Opened', ''].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 pr-4 font-normal text-text-muted"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => {
              const { pounds, percent } = calcClosedPnL(trade, 1.27)
              const currency = tickerCurrency(trade.ticker)
              const sym = currency === 'USD' ? '$' : '£'
              return (
                <tr
                  key={trade.id}
                  className={`border-b border-border ${i % 2 === 0 ? 'bg-transparent' : 'bg-bg-2/40'}`}
                >
                  <td className="py-3 pr-4">
                    <span className="text-site-text" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}>
                      {trade.name}
                    </span>
                    <span className="block text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                      {trade.ticker}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-site-text">
                    {sym}{trade.entry_price_pence.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-site-text">
                    {trade.exit_price_pence != null ? `${sym}${trade.exit_price_pence.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3 pr-4 font-mono text-site-text">{trade.shares}</td>
                  <td className={`py-3 pr-4 font-mono ${gainColour(pounds)}`}>
                    {pounds != null ? formatPounds(pounds) : '—'}
                  </td>
                  <td className={`py-3 pr-4 font-mono ${gainColour(percent)}`}>
                    {percent != null ? formatPercent(percent) : '—'}
                  </td>
                  <td className="py-3 pr-4 font-mono text-text-muted">
                    {tradeDuration(trade.opened_at, trade.closed_at)}
                  </td>
                  <td className="py-3 pr-4 text-text-muted" style={{ fontSize: '0.8rem' }}>
                    {formatDate(trade.opened_at)}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(trade.id, trade.name)}
                      className="text-text-muted hover:text-loss transition-colors"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex flex-col gap-2">
        {trades.map((trade) => {
          const { pounds, percent } = calcClosedPnL(trade, 1.27)
          const currency = tickerCurrency(trade.ticker)
          const sym = currency === 'USD' ? '$' : '£'
          return (
            <div key={trade.id} className="bg-bg-2 border border-border rounded-[3px] p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-site-text block" style={{ fontFamily: 'Fraunces, serif' }}>{trade.name}</span>
                  <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>{trade.ticker}</span>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-sm block ${gainColour(pounds)}`}>
                    {pounds != null ? formatPounds(pounds) : '—'}
                  </span>
                  <span className={`font-mono ${gainColour(percent)}`} style={{ fontSize: '0.75rem' }}>
                    {percent != null ? formatPercent(percent) : '—'}
                  </span>
                </div>
              </div>
              <div className="text-text-muted font-mono" style={{ fontSize: '0.72rem' }}>
                {sym}{trade.entry_price_pence.toFixed(2)} → {trade.exit_price_pence != null ? `${sym}${trade.exit_price_pence.toFixed(2)}` : '—'}
                {' · '}{tradeDuration(trade.opened_at, trade.closed_at)}
                {' · '}{formatDate(trade.opened_at)}
              </div>
              {trade.catalyst && (
                <p className="text-text-muted mt-1.5" style={{ fontSize: '0.78rem' }}>{trade.catalyst}</p>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
