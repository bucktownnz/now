'use client'

import Link from 'next/link'
import FiftyTwoWeekBar from './FiftyTwoWeekBar'
import { formatNativePrice, formatPercentRaw, formatPE, gainColour } from '@/lib/utils'
import type { QuoteMap } from '@/lib/yahoo'

interface WatchlistItem {
  id: string
  ticker: string
  name: string
  notes: string
  added_at: string
}

interface Props {
  watchlist: WatchlistItem[]
  quotes: QuoteMap
}

export default function WatchlistTable({ watchlist, quotes }: Props) {
  if (watchlist.length === 0) {
    return (
      <p className="text-text-muted text-sm italic py-4">
        No watchlist items yet.{' '}
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
              {['Name', 'Price', 'Day %', '52wk', 'P/E', 'Notes', ''].map((h) => (
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
            {watchlist.map((item, i) => {
              const q = quotes[item.ticker]
              return (
                <tr
                  key={item.id}
                  className={`border-b border-border ${
                    i % 2 === 0 ? 'bg-transparent' : 'bg-bg-2/40'
                  }`}
                >
                  <td className="py-3 pr-4">
                    <span className="text-site-text" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}>
                      {item.name}
                    </span>
                    <span
                      className="block text-text-muted font-mono"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {item.ticker}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-site-text">
                    {formatNativePrice(q?.nativePrice ?? null, q?.currency ?? null)}
                  </td>
                  <td className={`py-3 pr-4 font-mono ${gainColour(q?.regularMarketChangePercent ?? null)}`}>
                    {formatPercentRaw(q?.regularMarketChangePercent ?? null)}
                  </td>
                  <td className="py-3 pr-4">
                    <FiftyTwoWeekBar
                      low={q?.currency === 'GBp' ? (q.fiftyTwoWeekLow ?? null) && (q.fiftyTwoWeekLow! / 100) : (q?.fiftyTwoWeekLow ?? null)}
                      high={q?.currency === 'GBp' ? (q.fiftyTwoWeekHigh ?? null) && (q.fiftyTwoWeekHigh! / 100) : (q?.fiftyTwoWeekHigh ?? null)}
                      current={q?.nativePrice ?? null}
                    />
                  </td>
                  <td className="py-3 pr-4 font-mono text-site-text">
                    {formatPE(q?.trailingPE ?? null)}
                  </td>
                  <td className="py-3 pr-4 text-text-muted" style={{ fontSize: '0.82rem', maxWidth: '240px' }}>
                    {item.notes || <span className="italic">—</span>}
                  </td>
                  <td className="py-3">
                    <Link
                      href="/manage"
                      className="text-text-muted hover:text-accent transition-colors"
                      style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {watchlist.map((item) => {
          const q = quotes[item.ticker]
          return (
            <div
              key={item.id}
              className="bg-bg-2 border border-border rounded-[3px] p-4 hover:border-accent-dim transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-site-text block" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}>
                    {item.name}
                  </span>
                  <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                    {item.ticker}
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

              {item.notes && (
                <p className="text-text-muted mt-2" style={{ fontSize: '0.82rem', lineHeight: 1.65 }}>
                  {item.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
