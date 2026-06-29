'use client'

import { useState } from 'react'
import { timeAgo } from '@/lib/utils'
import AddSwingTradeForm from './AddSwingTradeForm'
import type { SwingAnalysis } from '@/lib/agents'

interface WatchlistItem {
  id: string
  ticker: string
  name: string
  notes: string
}

// Row from the scout_results table — written by the morning cron loop.
export interface ScoutResult {
  id: string
  ticker: string
  name: string
  setup_quality: 'good' | 'fair' | 'poor'
  catalyst: string
  entry_rationale: string
  target_rationale: string
  invalidation: string
  conviction: 'high' | 'medium' | 'low'
  horizon: string
  prev_conviction: 'high' | 'medium' | 'low' | null
  current_price: number | null
  scouted_at: string
}

interface Props {
  watchlistItems: WatchlistItem[]
  scoutResults?: ScoutResult[]
}

type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; analysis: SwingAnalysis; scoutedAt?: string; prevConviction?: 'high' | 'medium' | 'low' | null }
  | { status: 'error'; message: string }

const qualityColour = {
  good: 'text-gain',
  fair: 'text-accent',
  poor: 'text-text-muted',
}

const convictionLabel = {
  high: { text: 'High conviction', colour: 'text-gain' },
  medium: { text: 'Medium conviction', colour: 'text-accent' },
  low: { text: 'Low conviction', colour: 'text-text-muted' },
}

const convictionRank = { low: 0, medium: 1, high: 2 }

export default function SwingScoutPanel({ watchlistItems, scoutResults = [] }: Props) {
  // Seed each watchlist item with its latest pre-computed scout result (matched
  // by ticker). Manual re-analysis overwrites this with fresh live state.
  const [states, setStates] = useState<Record<string, AnalysisState>>(() => {
    const byTicker = new Map(scoutResults.map((r) => [r.ticker.toUpperCase(), r]))
    const seeded: Record<string, AnalysisState> = {}
    for (const item of watchlistItems) {
      const r = byTicker.get(item.ticker.toUpperCase())
      if (r) {
        seeded[item.id] = {
          status: 'done',
          analysis: {
            setup_quality: r.setup_quality,
            catalyst: r.catalyst,
            entry_rationale: r.entry_rationale,
            target_rationale: r.target_rationale,
            invalidation: r.invalidation,
            conviction: r.conviction,
            horizon: r.horizon,
          },
          scoutedAt: r.scouted_at,
          prevConviction: r.prev_conviction,
        }
      }
    }
    return seeded
  })
  const [openTradeFor, setOpenTradeFor] = useState<string | null>(null)

  if (watchlistItems.length === 0) return null

  function getState(id: string): AnalysisState {
    return states[id] ?? { status: 'idle' }
  }

  function setState(id: string, state: AnalysisState) {
    setStates((prev) => ({ ...prev, [id]: state }))
  }

  async function analyseSetup(item: WatchlistItem) {
    setState(item.id, { status: 'loading' })
    setOpenTradeFor(null)

    try {
      const res = await fetch('/api/analyze-swing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: item.ticker, name: item.name, notes: item.notes }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `HTTP ${res.status}`)
      }

      const data = await res.json()
      setState(item.id, { status: 'done', analysis: data.analysis })
    } catch (err) {
      setState(item.id, {
        status: 'error',
        message: err instanceof Error ? err.message : 'Analysis failed',
      })
    }
  }

  return (
    <div className="flex flex-col gap-px bg-border rounded-[3px] overflow-hidden">
      {watchlistItems.map((item) => {
        const state = getState(item.id)
        const isOpeningTrade = openTradeFor === item.id
        const analysis = state.status === 'done' ? state.analysis : null
        const scoutedAt = state.status === 'done' ? state.scoutedAt : undefined
        const prevConviction = state.status === 'done' ? state.prevConviction : undefined
        // Conviction changed since the previous scout run?
        const convictionShift =
          analysis && prevConviction && prevConviction !== analysis.conviction
            ? {
                from: prevConviction,
                to: analysis.conviction,
                up: convictionRank[analysis.conviction] > convictionRank[prevConviction],
              }
            : null

        return (
          <div key={item.id} className="bg-bg-2">
            {/* Header row */}
            <div className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-site-text mr-2" style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}>
                  {item.name}
                </span>
                <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                  {item.ticker}
                </span>
                {item.notes && (
                  <p className="text-text-muted mt-0.5" style={{ fontSize: '0.78rem' }}>
                    {item.notes}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-0.5">
                <button
                  onClick={() => analyseSetup(item)}
                  disabled={state.status === 'loading'}
                  className="text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                  style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  {state.status === 'loading' ? 'Analysing…' : scoutedAt ? 'Re-analyse' : 'Analyse setup'}
                </button>
                {scoutedAt && (
                  <span className="text-text-muted" style={{ fontSize: '0.6rem' }}>
                    scouted {timeAgo(new Date(scoutedAt))}
                  </span>
                )}
              </div>
            </div>

            {/* Analysis result */}
            {state.status === 'done' && analysis && !isOpeningTrade && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="pt-3 flex flex-wrap items-center gap-3 mb-3">
                  <span
                    className={`font-mono font-medium ${qualityColour[analysis.setup_quality]}`}
                    style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}
                  >
                    {analysis.setup_quality} setup
                  </span>
                  <span className="text-border">·</span>
                  <span
                    className={`font-mono ${convictionLabel[analysis.conviction].colour}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {convictionLabel[analysis.conviction].text}
                  </span>
                  {convictionShift && (
                    <span
                      className={`font-mono ${convictionShift.up ? 'text-gain' : 'text-loss'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {convictionShift.up ? '▲' : '▼'} {convictionShift.from} → {convictionShift.to}
                    </span>
                  )}
                  <span className="text-border">·</span>
                  <span className="text-text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                    {analysis.horizon}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 mb-4">
                  {[
                    { label: 'Catalyst', value: analysis.catalyst },
                    { label: 'Entry rationale', value: analysis.entry_rationale },
                    { label: 'Target', value: analysis.target_rationale },
                    { label: 'Invalidation', value: analysis.invalidation },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span
                        className="block text-text-muted mb-0.5"
                        style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                      >
                        {label}
                      </span>
                      <p className="text-site-text" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setOpenTradeFor(item.id)}
                  className="bg-accent-dim hover:bg-accent text-bg font-mono py-2 px-4 rounded-[3px] transition-colors"
                  style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Open trade
                </button>
              </div>
            )}

            {/* Open trade form — pre-filled from analysis */}
            {isOpeningTrade && (
              <div className="px-4 pb-4 border-t border-border pt-4">
                <AddSwingTradeForm
                  initial={{
                    ticker: item.ticker,
                    name: item.name,
                    catalyst: analysis?.catalyst ?? '',
                    horizon: analysis?.horizon ?? '',
                  }}
                  onDone={() => setOpenTradeFor(null)}
                />
              </div>
            )}

            {state.status === 'error' && (
              <div className="px-4 pb-3 border-t border-border pt-3">
                <p className="text-loss" style={{ fontSize: '0.8rem' }}>{state.message}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
