'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { timeAgo } from '@/lib/utils'

interface Props {
  initialFetchTime: Date
}

export default function RefreshButton({ initialFetchTime }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lastFetched, setLastFetched] = useState<Date>(initialFetchTime)

  const refresh = useCallback(async () => {
    setLoading(true)
    router.refresh()
    // Give Next.js a moment to revalidate then update timestamp
    setTimeout(() => {
      setLastFetched(new Date())
      setLoading(false)
    }, 1500)
  }, [router])

  return (
    <div className="flex items-center gap-3">
      <span className="text-text-muted" style={{ fontSize: '0.7rem' }}>
        {timeAgo(lastFetched)}
      </span>
      <button
        onClick={refresh}
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
  )
}
