'use client'

import { useState, useEffect, useCallback } from 'react'
import { timeAgo } from '@/lib/utils'
import SummaryBar from './SummaryBar'
import HoldingsTable from './HoldingsTable'
import WatchlistTable from './WatchlistTable'
import PortfolioThesisPanel from './PortfolioThesisPanel'
import type { QuoteMap } from '@/lib/yahoo'
import type { ThesisAnalysis, PositionRecommendation } from './ThesisPanel'

interface Holding {
  id: string
  ticker: string
  name: string
  shares: number
  avg_cost_pence: number
  thesis: string
  sector: string
  added_at: string
}

interface WatchlistItem {
  id: string
  ticker: string
  name: string
  notes: string
  added_at: string
}

interface Props {
  holdings: Holding[]
  watchlistItems: WatchlistItem[]
  portfolioThesis: string
  analyses: ThesisAnalysis[]
  recommendations: PositionRecommendation[]
}

export default function DashboardShell({
  holdings,
  watchlistItems,
  portfolioThesis,
  analyses,
  recommendations,
}: Props) {
  const [quotes, setQuotes] = useState<QuoteMap>({})
  const [gbpusdRate, setGbpusdRate] = useState<number | null>(null)
  const [fetchTime, setFetchTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)

  const loadQuotes = useCallback(async () => {
    const allTickers = [
      ...holdings.map((h) => h.ticker),
      ...watchlistItems.map((w) => w.ticker),
    ]
    if (allTickers.length === 0) return

    setLoading(true)
    try {
      const res = await fetch(`/api/quotes?t=${allTickers.join(',')}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setQuotes(data.quotes ?? {})
      setGbpusdRate(data.gbpusdRate ?? null)
      setFetchTime(new Date())
    } catch (err) {
      console.error('[DashboardShell] failed to load quotes:', err)
    } finally {
      setLoading(false)
    }
  }, [holdings, watchlistItems])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  // Derive last analysed timestamp from most recent analysis row
  const lastAnalysedAt = analyses.length > 0
    ? analyses.reduce((latest, a) =>
        a.analyzed_at > latest ? a.analyzed_at : latest,
        analyses[0].analyzed_at
      )
    : null

  const hasHoldingsWithThesis = holdings.some((h) => h.thesis?.trim())

  return (
    <>
      {/* Refresh bar */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-8 mt-[-2rem] pb-8">
        <div /> {/* spacer */}
        <div className="flex items-center gap-3">
          {fetchTime && (
            <span className="text-text-muted" style={{ fontSize: '0.7rem' }}>
              {timeAgo(fetchTime)}
            </span>
          )}
          <button
            onClick={loadQuotes}
            disabled={loading}
            className="flex items-center gap-1.5 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
            style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? 'animate-spin' : ''}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <SummaryBar holdings={holdings} quotes={quotes} gbpusdRate={gbpusdRate} />

      {/* Portfolio thesis + analyse button */}
      <PortfolioThesisPanel
        initialThesis={portfolioThesis}
        lastAnalysedAt={lastAnalysedAt}
        hasHoldingsWithThesis={hasHoldingsWithThesis}
      />

      {/* Holdings section */}
      <section className="mb-12">
        <div className="flex items-baseline gap-3 mb-6">
          <span
            className="text-accent shrink-0"
            style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Holdings
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted shrink-0" style={{ fontSize: '0.65rem' }}>
            {holdings.length} {holdings.length === 1 ? 'position' : 'positions'}
          </span>
        </div>
        <HoldingsTable
          holdings={holdings}
          quotes={quotes}
          gbpusdRate={gbpusdRate}
          analyses={analyses}
          recommendations={recommendations}
        />
      </section>

      {/* Watchlist section */}
      <section className="mb-16">
        <div className="flex items-baseline gap-3 mb-6">
          <span
            className="text-accent shrink-0"
            style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Watchlist
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-muted shrink-0" style={{ fontSize: '0.65rem' }}>
            {watchlistItems.length} {watchlistItems.length === 1 ? 'ticker' : 'tickers'}
          </span>
        </div>
        <WatchlistTable watchlist={watchlistItems} quotes={quotes} />
      </section>
    </>
  )
}
