'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SwingProgressBar from './SwingProgressBar'
import AddSwingTradeForm from './AddSwingTradeForm'
import { closeSwingTrade, deleteSwingTrade } from '@/app/actions'
import { formatNativePrice, formatPercent, formatPounds, gainColour } from '@/lib/utils'
import type { QuoteMap } from '@/lib/yahoo'

export interface SwingTrade {
  id: string
  ticker: string
  name: string
  shares: number
  entry_price_pence: number   // £/$ per share
  target_price_pence: number | null
  stop_loss_pence: number | null
  catalyst: string
  horizon: string
  status: string
  exit_price_pence: number | null
  opened_at: string
  closed_at: string | null
  notes: string
}

interface Props {
  trades: SwingTrade[]
  quotes: QuoteMap
  gbpusdRate: number | null
}

function tickerCurrency(ticker: string): string {
  return ticker.endsWith('.L') ? 'GBP' : 'USD'
}

function toGBP(amount: number, currency: string, rate: number): number {
  return currency === 'USD' ? amount / rate : amount
}

function calcSwingPnL(
  currentNative: number | null,
  entry: number,
  shares: number,
  currency: string,
  rate: number
): { pounds: number | null; percent: number | null } {
  if (currentNative == null) return { pounds: null, percent: null }
  const nativePnL = (currentNative - entry) * shares
  const pounds = toGBP(nativePnL, currency, rate)
  const percent = entry > 0 ? ((currentNative - entry) / entry) * 100 : null
  return { pounds, percent }
}

export default function SwingTradesTable({ trades, quotes, gbpusdRate }: Props) {
  const router = useRouter()
  const [closingId, setClosingId] = useState<string | null>(null)
  const [exitPrice, setExitPrice] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const rate = gbpusdRate ?? 1.27

  async function handleClose(id: string) {
    const price = parseFloat(exitPrice)
    if (isNaN(price) || price <= 0) return
    setClosing(true)
    try {
      await closeSwingTrade(id, price)
      setClosingId(null)
      setExitPrice('')
      router.refresh()
    } finally {
      setClosing(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete swing trade for ${name}?`)) return
    setDeleting(id)
    try {
      await deleteSwingTrade(id)
      router.refresh()
    } finally {
      setDeleting(null)
    }
  }

  if (trades.length === 0) {
    return (
      <p className="text-text-muted text-sm italic py-4">
        No open swing trades.{' '}
        <span className="text-text-muted">Use the Scout below to find a setup.</span>
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-px bg-border rounded-[3px] overflow-hidden">
      {trades.map((trade) => {
        const q = quotes[trade.ticker]
        const rawCurrency = q?.currency ?? null
        const currency = rawCurrency === 'GBp' ? 'GBP' : (rawCurrency ?? tickerCurrency(trade.ticker))
        const currentNative = q?.nativePrice ?? null
        const { pounds: pnlPounds, percent: pnlPercent } = calcSwingPnL(
          currentNative, trade.entry_price_pence, trade.shares, currency, rate
        )
        const isEditing = editingId === trade.id
        const isClosing = closingId === trade.id

        return (
          <div key={trade.id} className="bg-bg-2">
            {isEditing ? (
              <div className="p-5">
                <AddSwingTradeForm
                  initial={trade}
                  onDone={() => { setEditingId(null); router.refresh() }}
                />
              </div>
            ) : (
              <div className="px-4 py-4">
                {/* Row 1: Name + P&L */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-site-text" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}>
                        {trade.name}
                      </span>
                      <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                        {trade.ticker}
                      </span>
                      {trade.horizon && (
                        <span
                          className="text-text-muted border border-border rounded-[2px] px-1.5 py-0.5"
                          style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                        >
                          {trade.horizon}
                        </span>
                      )}
                    </div>
                    {trade.catalyst && (
                      <p className="text-text-muted mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                        {trade.catalyst}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-mono text-sm block ${gainColour(pnlPounds)}`}>
                      {pnlPounds != null ? formatPounds(pnlPounds) : '—'}
                    </span>
                    {pnlPercent != null && (
                      <span className={`font-mono ${gainColour(pnlPercent)}`} style={{ fontSize: '0.75rem' }}>
                        {formatPercent(pnlPercent)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Price data */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Entry', value: `${currency === 'USD' ? '$' : '£'}${trade.entry_price_pence.toFixed(2)}` },
                    { label: 'Current', value: currentNative != null ? formatNativePrice(currentNative, q?.currency ?? null) : '—' },
                    { label: 'Target', value: trade.target_price_pence != null ? `${currency === 'USD' ? '$' : '£'}${trade.target_price_pence.toFixed(2)}` : '—' },
                    { label: 'Stop', value: trade.stop_loss_pence != null ? `${currency === 'USD' ? '$' : '£'}${trade.stop_loss_pence.toFixed(2)}` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span
                        className="block text-text-muted"
                        style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                      >
                        {label}
                      </span>
                      <span className="font-mono text-site-text" style={{ fontSize: '0.8rem' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Row 3: Progress bar */}
                <div className="mb-3">
                  <SwingProgressBar
                    entry={trade.entry_price_pence}
                    target={trade.target_price_pence}
                    stop={trade.stop_loss_pence}
                    current={currentNative}
                  />
                </div>

                {/* Row 4: Close inline form OR actions */}
                {isClosing ? (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Exit price (£/$)
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      placeholder={currentNative?.toFixed(2) ?? '0.00'}
                      className="bg-bg border border-border rounded-[3px] px-2 py-1 text-site-text font-mono text-sm outline-none focus:border-accent-dim w-28"
                      autoFocus
                    />
                    <button
                      onClick={() => handleClose(trade.id)}
                      disabled={closing}
                      className="bg-accent-dim hover:bg-accent text-bg font-mono py-1 px-3 rounded-[3px] transition-colors disabled:opacity-50"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      {closing ? 'Closing…' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => { setClosingId(null); setExitPrice('') }}
                      className="text-text-muted hover:text-site-text transition-colors font-mono"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 mt-1">
                    <button
                      onClick={() => { setClosingId(trade.id); setExitPrice('') }}
                      className="text-text-muted hover:text-accent transition-colors"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Close trade
                    </button>
                    <button
                      onClick={() => setEditingId(trade.id)}
                      className="text-text-muted hover:text-accent transition-colors"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trade.id, trade.name)}
                      disabled={deleting === trade.id}
                      className="text-text-muted hover:text-loss transition-colors"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Delete
                    </button>
                    <span className="text-text-muted ml-auto" style={{ fontSize: '0.65rem' }}>
                      {trade.shares} shares
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
