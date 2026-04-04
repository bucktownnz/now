'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { deleteHolding, deleteWatchlistItem } from '@/app/actions'
import AddHoldingForm from '@/components/AddHoldingForm'
import AddWatchlistForm from '@/components/AddWatchlistForm'
import { formatPence, formatDate } from '@/lib/utils'

interface Holding {
  id: string
  ticker: string
  name: string
  shares: number
  avg_cost_pence: number
  sector: string
  thesis: string
  added_at: string
}

interface WatchlistItem {
  id: string
  ticker: string
  name: string
  notes: string
  added_at: string
}

const sectionLabelStyle = {
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
}

export default function ManagePage() {
  const router = useRouter()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null)
  const [editingWatchlist, setEditingWatchlist] = useState<WatchlistItem | null>(null)
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [showAddWatchlist, setShowAddWatchlist] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const [h, w] = await Promise.all([
      supabase.from('holdings').select('*').eq('user_id', user.id).order('added_at'),
      supabase.from('watchlist').select('*').eq('user_id', user.id).order('added_at'),
    ])

    setHoldings(h.data ?? [])
    setWatchlist(w.data ?? [])
    setLoading(false)
  }

  async function handleDeleteHolding(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    await deleteHolding(id)
    setHoldings((prev) => prev.filter((h) => h.id !== id))
  }

  async function handleDeleteWatchlist(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from watchlist?`)) return
    await deleteWatchlistItem(id)
    setWatchlist((prev) => prev.filter((w) => w.id !== id))
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="text-text-muted font-mono" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>
          Loading…
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">

        {/* Nav */}
        <nav className="flex items-center justify-between pt-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <span
            className="text-accent"
            style={{ fontFamily: 'Fraunces, serif', fontSize: '1rem', fontWeight: 400 }}
          >
            Sam Buxton
          </span>
          <div className="flex items-center gap-6">
            <ul className="flex gap-6 list-none">
              <li>
                <Link
                  href="/dashboard"
                  className="text-text-muted hover:text-site-text transition-colors"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  href="/manage"
                  className="text-accent"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Manage
                </Link>
              </li>
            </ul>
            <button
              onClick={handleSignOut}
              className="text-text-muted hover:text-site-text transition-colors"
              style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Sign out
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="pt-12 pb-8 animate-fade-up-slow" style={{ animationDelay: '0.25s' }}>
          <div
            className="text-text-muted mb-4 flex items-center gap-3"
            style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            <span className="inline-block w-8 h-px" style={{ background: '#8A7249' }} />
            Portfolio
          </div>
          <h1
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#E8E4DC',
            }}
          >
            Manage <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>Holdings.</em>
          </h1>
        </div>

        {/* ── Holdings section ── */}
        <section className="mb-12 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-accent shrink-0" style={sectionLabelStyle}>Holdings</span>
            <div className="flex-1 h-px bg-border" />
            <button
              onClick={() => { setShowAddHolding((v) => !v); setEditingHolding(null) }}
              className="text-text-muted hover:text-accent transition-colors shrink-0"
              style={sectionLabelStyle}
            >
              {showAddHolding ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showAddHolding && (
            <div className="bg-bg-2 border border-border rounded-[3px] p-5 mb-6">
              <AddHoldingForm onDone={() => { setShowAddHolding(false); loadData() }} />
            </div>
          )}

          {holdings.length === 0 ? (
            <p className="text-text-muted italic" style={{ fontSize: '0.875rem' }}>No holdings yet.</p>
          ) : (
            <div className="flex flex-col gap-px bg-border rounded-[3px] overflow-hidden">
              {holdings.map((h) => (
                <div key={h.id}>
                  {editingHolding?.id === h.id ? (
                    <div className="bg-bg-2 p-5">
                      <AddHoldingForm
                        initial={h}
                        onDone={() => { setEditingHolding(null); loadData() }}
                      />
                    </div>
                  ) : (
                    <div className="bg-bg-2 px-4 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span
                          className="text-site-text mr-2"
                          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
                        >
                          {h.name}
                        </span>
                        <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                          {h.ticker} · {h.shares} shares @ {formatPence(h.avg_cost_pence)}
                        </span>
                        {h.sector && (
                          <span
                            className="ml-3 text-text-muted border border-border rounded-[2px] px-1.5 py-0.5"
                            style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                          >
                            {h.sector}
                          </span>
                        )}
                        <span className="block text-text-muted mt-0.5" style={{ fontSize: '0.7rem' }}>
                          Added {formatDate(h.added_at)}
                        </span>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button
                          onClick={() => setEditingHolding(h)}
                          className="text-text-muted hover:text-accent transition-colors"
                          style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHolding(h.id, h.name)}
                          className="text-text-muted hover:text-loss transition-colors"
                          style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Watchlist section ── */}
        <section className="mb-16 animate-fade-up" style={{ animationDelay: '0.55s' }}>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-accent shrink-0" style={sectionLabelStyle}>Watchlist</span>
            <div className="flex-1 h-px bg-border" />
            <button
              onClick={() => { setShowAddWatchlist((v) => !v); setEditingWatchlist(null) }}
              className="text-text-muted hover:text-accent transition-colors shrink-0"
              style={sectionLabelStyle}
            >
              {showAddWatchlist ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showAddWatchlist && (
            <div className="bg-bg-2 border border-border rounded-[3px] p-5 mb-6">
              <AddWatchlistForm onDone={() => { setShowAddWatchlist(false); loadData() }} />
            </div>
          )}

          {watchlist.length === 0 ? (
            <p className="text-text-muted italic" style={{ fontSize: '0.875rem' }}>No watchlist items yet.</p>
          ) : (
            <div className="flex flex-col gap-px bg-border rounded-[3px] overflow-hidden">
              {watchlist.map((item) => (
                <div key={item.id}>
                  {editingWatchlist?.id === item.id ? (
                    <div className="bg-bg-2 p-5">
                      <AddWatchlistForm
                        initial={item}
                        onDone={() => { setEditingWatchlist(null); loadData() }}
                      />
                    </div>
                  ) : (
                    <div className="bg-bg-2 px-4 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span
                          className="text-site-text mr-2"
                          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
                        >
                          {item.name}
                        </span>
                        <span className="text-text-muted font-mono" style={{ fontSize: '0.7rem' }}>
                          {item.ticker}
                        </span>
                        {item.notes && (
                          <p className="text-text-muted mt-0.5" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                            {item.notes}
                          </p>
                        )}
                        <span className="block text-text-muted mt-0.5" style={{ fontSize: '0.7rem' }}>
                          Added {formatDate(item.added_at)}
                        </span>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button
                          onClick={() => setEditingWatchlist(item)}
                          className="text-text-muted hover:text-accent transition-colors"
                          style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteWatchlist(item.id, item.name)}
                          className="text-text-muted hover:text-loss transition-colors"
                          style={{ fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-10 flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <span className="text-text-muted" style={{ fontSize: '0.75rem' }}>
            watchlist.sambuxton.dev
          </span>
          <span className="text-text-muted" style={{ fontSize: '0.75rem' }}>
            {new Date().getFullYear()}
          </span>
        </footer>

      </div>
    </div>
  )
}
