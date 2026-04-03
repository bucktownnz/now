'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] animate-fade-up-slow" style={{ animationDelay: '0.1s' }}>

        {/* Logo / name */}
        <div className="mb-10 text-center">
          <span
            className="text-accent"
            style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', fontWeight: 400 }}
          >
            Sam Buxton
          </span>
          <p className="text-text-muted mt-1" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Watchlist
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-2 border border-border rounded-[3px] p-8">

          {/* Section header */}
          <div className="flex items-baseline gap-3 mb-6">
            <span
              className="text-accent shrink-0"
              style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              Sign in
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-text-muted mb-2"
                style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg border border-border rounded-[3px] px-3 py-2.5 text-site-text font-mono text-sm outline-none focus:border-accent-dim transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-text-muted mb-2"
                style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-border rounded-[3px] px-3 py-2.5 text-site-text font-mono text-sm outline-none focus:border-accent-dim transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-loss text-sm" style={{ fontSize: '0.8rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-accent-dim hover:bg-accent text-bg font-mono py-2.5 rounded-[3px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 400 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
