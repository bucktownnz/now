'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThesisPanel from './ThesisPanel'
import FiftyTwoWeekBar from './FiftyTwoWeekBar'
import {
  formatNativePrice,
  formatPercent,
  formatPercentRaw,
  formatPounds,
  formatPE,
  gainColour,
} from '@/lib/utils'
import type { QuoteMap } from '@/lib/yahoo'

interface Holding {
  id: string
  ticker: string
  name: string
  shares: number
  avg_cost_pence: number  // stored as £/$ per share
  thesis: string
  sector: string
  added_at: string
}

interface Props {
  holdings: Holding[]
  quotes: QuoteMap
  gbpusdRate: number | null
}

function calcPnL(
  nativePrice: number | null,
  avgCost: number,
  shares: number,
  currency: string | null,
  gbpusdRate: number | null
) {
  if (nativePrice == null) return { pounds: null, percent: null }
  const rate = gbpusdRate ?? 1.27
  const nativePnL = (nativePrice - avgCost) * shares
  // Convert USD P&L to GBP for consistent display
  const pounds = currency === 'USD' ? nativePnL / rate : nativePnL
  const percent = avgCost > 0 ? ((nativePrice - avgCost) / avgCost) * 100 : null
  return { pounds, percent }
}

function formatCostWithCurrency(cost: number, currency: string | null): string {
  const symbol = currency === 'USD' ? '$' : '£'
  return `${symbol}${cost.toFixed(2)}`
}

export default function HoldingsTable({ holdings, quotes, gbpusdRate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (holdings.length === 0) {
    return (
      <p className="text-text-muted text-sm italic py-4">
        No holdings yet.{' '}
        <Link href="/manage" className="text-accent hover:underline">
          Add one
        </Link>
        .
      </p>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Name', 'Shares', 'Avg Cost', 'Price', 'Day %', 'P&L £', 'P&L %', 'P/E', '52wk', ''].map((h) => (
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
            {holdings.map((h, i) => {
              const q = quotes[h.ticker]
              const currency = q?.currency ?? null
              const { pounds: pnlPounds, percent: pnlPercent } = calcPnL(
                q?.nativePrice ?? null,
                h.avg_cost_pence,
                h.shares,
                currency,
                gbpusdRate
              )
              const isExpanded = expandedId === h.id

              // 52wk range: convert GBp to GBP if needed
              const toNative = (v: number | null | undefined) => {
                if (v == null) return null
                return q?.currency === 'GBp' ? v / 100 : v
              }

              return (
                <>
                  <tr
                    key={h.id}
                    onClick={() => toggle(h.id)}
                    className={`border-b border-border cursor-pointer transition-colors ${
                      i % 2 === 0 ? 'bg-transparent' : 'bg-bg-2/40'
                    } hover:bg-bg-2`}
                  >
                    <td className="py-3 pr-4">
                      <span className="text-site-text" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}>
                        {h.name}
                      </span>
                      <span
                        className="block text-text-muted font-mono"
                        style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
                      >
                        {h.ticker}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-site-text">{h.shares}</td>
                    <td className="py-3 pr-4 font-mono text-site-text">{formatCostWithCurrency(h.avg_cost_pence, currency)}</td>
                    <td className="py-3 pr-4 font-mono text-site-text">
                      {formatNativePrice(q?.nativePrice ?? null, q?.currency ?? null)}
                    </td>
                    <td className={`py-3 pr-4 font-mono ${gainColour(q?.regularMarketChangePercent ?? null)}`}>
                      {formatPercentRaw(q?.regularMarketChangePercent ?? null)}
                    </td>
                    <td className={`py-3 pr-4 font-mono ${gainColour(pnlPounds)}`}>
                      {pnlPounds != null ? formatPounds(pnlPounds) : '—'}
                    </td>
                    <td className={`py-3 pr-4 font-mono ${gainColour(pnlPercent)}`}>
                      {pnlPercent != null ? formatPercent(pnlPercent) : '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-site-text">{formatPE(q?.trailingPE ?? null)}</td>
                    <td className="py-3 pr-4">
                      <FiftyTwoWeekBar
                        low={toNative(q?.fiftyTwoWeekLow)}
                        high={toNative(q?.fiftyTwoWeekHigh)}
                        current={q?.nativePrice ?? null}
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggle(h.id) }}
                          className="text-text-muted hover:text-accent transition-colors"
                          style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          {isExpanded ? 'Hide' : 'Thesis'}
                        </button>
                        <Link
                          href="/manage"
                          onClick={(e) => e.stopPropagation()}
                          className="text-text-muted hover:text-accent transition-colors"
                          style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${h.id}-thesis`}>
                      <td colSpan={10} className="p-0">
                        <ThesisPanel
                          thesis={h.thesis}
                          sector={h.sector}
                          addedAt={h.added_at}
                          ticker={h.ticker}
                        />
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {holdings.map((h) => {
          const q = quotes[h.ticker]
          const currency = q?.currency ?? null
          const { pounds: pnlPounds, percent: pnlPercent } = calcPnL(
            q?.nativePrice ?? null,
            h.avg_cost_pence,
            h.shares,
            currency,
            gbpusdRate
          )
          const isExpanded = expandedId === h.id

          return (
            <div
              key={h.id}
              className="bg-bg-2 border border-border rounded-[3px] overflow-hidden hover:border-accent-dim transition-colors"
            >
              <button
                className="w-full text-left p-4"
                onClick={() => toggle(h.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-site-text block" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: '1rem' }}>
                      {h.name}
                    </span>
                    <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                      {h.ticker} · {h.shares} shares
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-site-text font-mono text-sm block">
                      {formatNativePrice(q?.nativePrice ?? null, q?.currency ?? null)}
                    </span>
                    <span className={`font-mono ${gainColour(q?.regularMarketChangePercent ?? null)}`} style={{ fontSize: '0.8rem' }}>
                      {formatPercentRaw(q?.regularMarketChangePercent ?? null)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="block text-text-muted" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Avg Cost</span>
                    <span className="font-mono text-site-text text-xs">{formatCostWithCurrency(h.avg_cost_pence, currency)}</span>
                  </div>
                  <div>
                    <span className="block text-text-muted" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>P&L</span>
                    <span className={`font-mono text-xs ${gainColour(pnlPounds)}`}>
                      {pnlPounds != null ? formatPounds(pnlPounds) : '—'}
                      {pnlPercent != null && (
                        <span className="ml-1 text-text-muted" style={{ fontSize: '0.65rem' }}>
                          {formatPercent(pnlPercent)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="block text-text-muted" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>P/E</span>
                    <span className="font-mono text-site-text text-xs">{formatPE(q?.trailingPE ?? null)}</span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <ThesisPanel
                  thesis={h.thesis}
                  sector={h.sector}
                  addedAt={h.added_at}
                  ticker={h.ticker}
                />
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
