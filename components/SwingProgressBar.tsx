interface Props {
  entry: number
  target: number | null
  stop: number | null
  current: number | null
}

export default function SwingProgressBar({ entry, target, stop, current }: Props) {
  if (!target || !stop || !current) return null

  const range = target - stop
  if (range <= 0) return null

  // Clamp position between -5% and 105% so the marker stays visible even outside range
  const rawPos = ((current - stop) / range) * 100
  const pos = Math.max(-5, Math.min(105, rawPos))

  const pctToTarget = ((target - current) / current) * 100
  const pctToStop = ((current - stop) / current) * 100
  const isProfit = current >= entry
  const isNearStop = rawPos < 20
  const isNearTarget = rawPos > 80

  return (
    <div className="w-full">
      {/* Bar */}
      <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: 'rgba(124,74,74,0.25)' }}>
        {/* Fill from stop to current */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{
            width: `${Math.max(0, Math.min(100, rawPos))}%`,
            background: isProfit ? 'rgba(74,124,89,0.5)' : 'rgba(124,74,74,0.5)',
          }}
        />
        {/* Target marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full"
          style={{ right: 0, background: '#4A7C59' }}
        />
        {/* Entry marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-px h-3"
          style={{
            left: `${Math.max(0, Math.min(100, ((entry - stop) / range) * 100))}%`,
            background: '#8A7249',
          }}
        />
        {/* Current price marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-bg"
          style={{
            left: `${pos}%`,
            transform: 'translate(-50%, -50%)',
            background: isProfit ? '#4A7C59' : '#7C4A4A',
          }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between mt-1">
        <span
          className={`font-mono ${isNearStop ? 'text-loss' : 'text-text-muted'}`}
          style={{ fontSize: '0.6rem' }}
        >
          stop {pctToStop > 0 ? `−${pctToStop.toFixed(1)}%` : `+${Math.abs(pctToStop).toFixed(1)}%`}
        </span>
        <span
          className={`font-mono ${isNearTarget ? 'text-gain' : 'text-text-muted'}`}
          style={{ fontSize: '0.6rem' }}
        >
          {pctToTarget > 0 ? `+${pctToTarget.toFixed(1)}%` : `−${Math.abs(pctToTarget).toFixed(1)}%`} target
        </span>
      </div>
    </div>
  )
}
