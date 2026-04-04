import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchQuotes, fetchFxRate } from '@/lib/yahoo'
import SummaryBar from '@/components/SummaryBar'
import HoldingsTable from '@/components/HoldingsTable'
import WatchlistTable from '@/components/WatchlistTable'
import RefreshButton from '@/components/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [holdingsResult, watchlistResult] = await Promise.all([
    supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: true }),
    supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: true }),
  ])

  const holdings = holdingsResult.data ?? []
  const watchlistItems = watchlistResult.data ?? []

  const allTickers = [
    ...holdings.map((h) => h.ticker),
    ...watchlistItems.map((w) => w.ticker),
  ]

  const [quotes, gbpusdRate] = await Promise.all([
    allTickers.length > 0 ? fetchQuotes(allTickers) : Promise.resolve({}),
    fetchFxRate('GBPUSD=X'),
  ])
  const fetchTime = new Date()

  async function handleSignOut() {
    'use server'
    const { createClient: createServerClient } = await import('@/lib/supabase/server')
    const sb = await createServerClient()
    await sb.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">

        {/* Nav */}
        <nav className="flex items-center justify-between pt-10 pb-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
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
                  href="/"
                  className="text-text-muted hover:text-site-text transition-colors"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-accent"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Watchlist
                </Link>
              </li>
              <li>
                <Link
                  href="/manage"
                  className="text-text-muted hover:text-site-text transition-colors"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  Manage
                </Link>
              </li>
            </ul>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-text-muted hover:text-site-text transition-colors"
                style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Sign out
              </button>
            </form>
          </div>
        </nav>

        {/* Hero */}
        <div className="pt-12 pb-8 animate-fade-up-slow" style={{ animationDelay: '0.25s' }}>
          <div
            className="text-text-muted mb-4 flex items-center gap-3"
            style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            <span
              className="inline-block w-8 h-px"
              style={{ background: '#8A7249' }}
            />
            Portfolio
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
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
              UK <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>Holdings.</em>
            </h1>
            <RefreshButton initialFetchTime={fetchTime} />
          </div>
        </div>

        {/* Summary bar */}
        <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <SummaryBar holdings={holdings} quotes={quotes} gbpusdRate={gbpusdRate} />
        </div>

        {/* Holdings section */}
        <section className="mb-12 animate-fade-up" style={{ animationDelay: '0.5s' }}>
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
          <HoldingsTable holdings={holdings} quotes={quotes} gbpusdRate={gbpusdRate} />
        </section>

        {/* Watchlist section */}
        <section className="mb-16 animate-fade-up" style={{ animationDelay: '0.65s' }}>
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

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-10 flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.8s' }}>
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
