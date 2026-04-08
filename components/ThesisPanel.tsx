import { formatDate } from '@/lib/utils'
import { ImpactBadge, RecommendationBadge, UrgencyLabel } from './AnalysisBadge'

export interface ThesisAnalysis {
  id: string
  ticker: string
  announcement_title: string
  announcement_publisher: string | null
  announcement_url: string | null
  announcement_date: string | null
  thesis_impact: 'strengthens' | 'weakens' | 'neutral'
  impact_explanation: string
  impact_confidence: 'high' | 'medium' | 'low' | null
  analyzed_at: string
}

export interface PositionRecommendation {
  ticker: string
  recommendation: 'accumulate' | 'hold' | 'reduce' | 'exit'
  rationale: string
  urgency: 'immediate' | 'consider' | 'monitor' | null
  portfolio_alignment: string | null
  recommended_at: string
}

interface Props {
  thesis: string
  sector: string
  addedAt: string
  ticker: string
  analyses?: ThesisAnalysis[]
  recommendation?: PositionRecommendation | null
}

export default function ThesisPanel({ thesis, sector, addedAt, ticker, analyses, recommendation }: Props) {
  const hasAnalysis = (analyses && analyses.length > 0) || recommendation

  return (
    <div className="bg-bg border-t border-border px-4 py-4 sm:px-6">
      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {sector && (
          <span
            className="text-text-muted border border-border rounded-[2px] px-2 py-0.5"
            style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {sector}
          </span>
        )}
        <span
          className="text-accent border border-accent-dim rounded-[2px] px-2 py-0.5"
          style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {ticker}
        </span>
        <span
          className="text-text-muted"
          style={{ fontSize: '0.7rem' }}
        >
          Added {formatDate(addedAt)}
        </span>
      </div>

      {/* Thesis text */}
      {thesis ? (
        <p className="text-site-text mb-4" style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>
          {thesis}
        </p>
      ) : (
        <p className="text-text-muted italic mb-4" style={{ fontSize: '0.875rem' }}>
          No thesis written yet.
        </p>
      )}

      {/* AI Analysis section */}
      {hasAnalysis && (
        <div className="border-t border-border pt-4 mt-2">

          {/* Position recommendation */}
          {recommendation && (
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span
                  className="text-text-muted"
                  style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                  AI Recommendation
                </span>
                <RecommendationBadge recommendation={recommendation.recommendation} />
                {recommendation.urgency && (
                  <UrgencyLabel urgency={recommendation.urgency} />
                )}
                <span className="text-text-muted" style={{ fontSize: '0.6rem' }}>
                  {formatDate(recommendation.recommended_at)}
                </span>
              </div>
              <p className="text-site-text" style={{ fontSize: '0.8rem', lineHeight: 1.65 }}>
                {recommendation.rationale}
              </p>
              {recommendation.portfolio_alignment && (
                <p className="text-text-muted mt-1" style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
                  {recommendation.portfolio_alignment}
                </p>
              )}
            </div>
          )}

          {/* Recent announcements */}
          {analyses && analyses.length > 0 && (
            <div>
              <span
                className="text-text-muted block mb-2"
                style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
              >
                Recent Announcements
              </span>
              <div className="flex flex-col gap-3">
                {analyses.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex flex-col gap-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      <ImpactBadge impact={a.thesis_impact} />
                      {a.announcement_url ? (
                        <a
                          href={a.announcement_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-site-text hover:text-accent transition-colors flex-1"
                          style={{ fontSize: '0.78rem', lineHeight: 1.5 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {a.announcement_title}
                        </a>
                      ) : (
                        <span className="text-site-text flex-1" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                          {a.announcement_title}
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted" style={{ fontSize: '0.72rem', lineHeight: 1.6, paddingLeft: '0' }}>
                      {a.impact_explanation}
                      {a.announcement_publisher && (
                        <span className="ml-2" style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                          — {a.announcement_publisher}
                          {a.announcement_date && `, ${formatDate(a.announcement_date)}`}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No analysis yet — show placeholder if thesis exists */}
      {!hasAnalysis && thesis && (
        <p className="text-text-muted border-t border-border pt-3 mt-1" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
          No announcements analysed yet. Click &ldquo;Analyse portfolio&rdquo; to assess recent news.
        </p>
      )}
    </div>
  )
}
