// Small inline badges for thesis impact and position recommendations

type Impact = 'strengthens' | 'weakens' | 'neutral'
type Recommendation = 'accumulate' | 'hold' | 'reduce' | 'exit'
type Urgency = 'immediate' | 'consider' | 'monitor'

const IMPACT_STYLES: Record<Impact, { label: string; color: string; border: string }> = {
  strengthens: { label: '↑ Strengthens', color: '#4A7C59', border: '#4A7C5940' },
  weakens:     { label: '↓ Weakens',     color: '#7C4A4A', border: '#7C4A4A40' },
  neutral:     { label: '→ Neutral',     color: '#7A7870', border: '#7A787040' },
}

const RECOMMENDATION_STYLES: Record<Recommendation, { label: string; color: string; border: string }> = {
  accumulate: { label: 'Accumulate', color: '#4A7C59', border: '#4A7C5940' },
  hold:       { label: 'Hold',       color: '#7A7870', border: '#7A787040' },
  reduce:     { label: 'Reduce',     color: '#C8A96E', border: '#C8A96E40' },
  exit:       { label: 'Exit',       color: '#7C4A4A', border: '#7C4A4A40' },
}

const URGENCY_STYLES: Record<Urgency, { label: string; color: string }> = {
  immediate: { label: 'Act now',   color: '#7C4A4A' },
  consider:  { label: 'Consider',  color: '#C8A96E' },
  monitor:   { label: 'Monitor',   color: '#7A7870' },
}

export function ImpactBadge({ impact }: { impact: Impact }) {
  const s = IMPACT_STYLES[impact]
  return (
    <span
      style={{
        fontSize: '0.6rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: '2px',
        padding: '1px 6px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

export function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  const s = RECOMMENDATION_STYLES[recommendation]
  return (
    <span
      style={{
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 500,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: '2px',
        padding: '2px 8px',
        display: 'inline-block',
      }}
    >
      {s.label}
    </span>
  )
}

export function UrgencyLabel({ urgency }: { urgency: Urgency }) {
  const s = URGENCY_STYLES[urgency]
  return (
    <span
      style={{
        fontSize: '0.6rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: s.color,
      }}
    >
      {s.label}
    </span>
  )
}
