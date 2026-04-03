interface Props {
  low: number | null
  high: number | null
  current: number | null
}

export default function FiftyTwoWeekBar({ low, high, current }: Props) {
  if (low == null || high == null || current == null || high === low) {
    return <span className="text-text-muted" style={{ fontSize: '0.75rem' }}>—</span>
  }

  const range = high - low
  const position = Math.max(0, Math.min(100, ((current - low) / range) * 100))

  return (
    <div className="flex items-center gap-1.5 min-w-[80px]">
      <span className="text-text-muted font-mono" style={{ fontSize: '0.65rem' }}>
        {Math.round(low)}
      </span>
      <div className="flex-1 relative h-1 bg-border rounded-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent"
          style={{ left: `calc(${position}% - 4px)` }}
        />
      </div>
      <span className="text-text-muted font-mono" style={{ fontSize: '0.65rem' }}>
        {Math.round(high)}
      </span>
    </div>
  )
}
