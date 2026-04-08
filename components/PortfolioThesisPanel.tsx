'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePortfolioThesis } from '@/app/actions'

interface Props {
  initialThesis: string
  lastAnalysedAt: string | null  // ISO string of most recent analysis
  hasHoldingsWithThesis: boolean
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
}

export default function PortfolioThesisPanel({ initialThesis, lastAnalysedAt, hasHoldingsWithThesis }: Props) {
  const router = useRouter()
  const [thesis, setThesis] = useState(initialThesis)
  const [isExpanded, setIsExpanded] = useState(!!initialThesis)
  const [isSaving, startSave] = useTransition()
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{ newAnalyses: number; analysedHoldings: number } | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  function handleSave() {
    startSave(async () => {
      await updatePortfolioThesis(thesis)
    })
  }

  async function handleAnalyse() {
    setIsAnalysing(true)
    setAnalysisResult(null)
    setAnalysisError(null)

    try {
      const res = await fetch('/api/analyze', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json()
      setAnalysisResult({ newAnalyses: data.newAnalyses, analysedHoldings: data.analysedHoldings })
      // Refresh server data (analyses, recommendations) without full reload
      router.refresh()
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalysing(false)
    }
  }

  const lastAnalysedLabel = lastAnalysedAt
    ? (() => {
        const d = new Date(lastAnalysedAt)
        const diffMs = Date.now() - d.getTime()
        const diffH = Math.floor(diffMs / (1000 * 60 * 60))
        const diffD = Math.floor(diffH / 24)
        if (diffD >= 1) return `last analysed ${diffD}d ago`
        if (diffH >= 1) return `last analysed ${diffH}h ago`
        return 'last analysed just now'
      })()
    : null

  return (
    <div className="mb-10 border border-border rounded-[3px] overflow-hidden">
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-2/60 transition-colors"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-accent" style={labelStyle}>Portfolio Thesis</span>
          {!isExpanded && thesis && (
            <span className="text-text-muted hidden sm:block" style={{ fontSize: '0.75rem', lineHeight: 1.5, maxWidth: '40rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {thesis}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {lastAnalysedLabel && (
            <span className="text-text-muted hidden sm:block" style={{ fontSize: '0.65rem' }}>
              {lastAnalysedLabel}
            </span>
          )}
          <span className="text-text-muted" style={{ fontSize: '0.7rem' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border px-5 py-5 bg-bg-2/30">
          {/* Thesis textarea */}
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            placeholder="Describe the overall objectives and strategy of your portfolio. The AI agents will use this to align position recommendations with your goals."
            rows={4}
            className="w-full bg-bg border border-border rounded-[2px] px-3 py-2.5 text-site-text font-mono resize-none focus:outline-none focus:border-accent-dim transition-colors"
            style={{ fontSize: '0.8rem', lineHeight: 1.7 }}
          />

          <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving || thesis === initialThesis}
              className="text-text-muted hover:text-accent transition-colors disabled:opacity-40"
              style={labelStyle}
            >
              {isSaving ? 'Saving…' : 'Save thesis'}
            </button>

            {/* Analyse button */}
            <div className="flex items-center gap-4">
              {analysisError && (
                <span className="text-loss" style={{ fontSize: '0.7rem' }}>{analysisError}</span>
              )}
              {analysisResult && !isAnalysing && (
                <span className="text-text-muted" style={{ fontSize: '0.7rem' }}>
                  {analysisResult.newAnalyses === 0
                    ? 'No new announcements to analyse'
                    : `${analysisResult.newAnalyses} announcement${analysisResult.newAnalyses === 1 ? '' : 's'} analysed across ${analysisResult.analysedHoldings} holding${analysisResult.analysedHoldings === 1 ? '' : 's'}`}
                </span>
              )}
              <button
                onClick={handleAnalyse}
                disabled={isAnalysing || !hasHoldingsWithThesis}
                title={!hasHoldingsWithThesis ? 'Add an investment thesis to at least one holding first' : undefined}
                className="flex items-center gap-2 text-accent hover:text-site-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-accent-dim hover:border-border rounded-[2px] px-3 py-1.5"
                style={labelStyle}
              >
                {isAnalysing ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-spin"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    Analysing…
                  </>
                ) : (
                  'Analyse portfolio'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
