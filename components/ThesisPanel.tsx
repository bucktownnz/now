import { formatDate } from '@/lib/utils'

interface Props {
  thesis: string
  sector: string
  addedAt: string
  ticker: string
}

export default function ThesisPanel({ thesis, sector, addedAt, ticker }: Props) {
  return (
    <div className="bg-bg border-t border-border px-4 py-4 sm:px-6">
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

      {thesis ? (
        <p className="text-site-text" style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>
          {thesis}
        </p>
      ) : (
        <p className="text-text-muted italic" style={{ fontSize: '0.875rem' }}>
          No thesis written yet.
        </p>
      )}
    </div>
  )
}
