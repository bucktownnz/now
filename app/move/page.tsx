import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SEED_TASKS } from '@/lib/move/seedTasks'
import type { MoveTask, Profile } from '@/lib/move/types'
import MoveChecklist from '@/components/move/MoveChecklist'

export const dynamic = 'force-dynamic'

export default async function MovePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // First-load seed fallback: if the shared list is empty, populate it from
  // SEED_TASKS. The SQL seed (migration 006) normally handles this; this guard
  // covers a fresh DB where the migration hasn't run. RLS still applies — only
  // a household member (a user with a profiles row) can insert here.
  const { count } = await supabase
    .from('move_tasks')
    .select('id', { count: 'exact', head: true })

  if (count === 0) {
    await supabase.from('move_tasks').insert(
      SEED_TASKS.map((t, i) => ({
        title: t.title,
        notes: t.notes ?? '',
        category: t.category,
        sort_order: i,
        created_by: user.id,
      }))
    )
  }

  const [tasksResult, profilesResult] = await Promise.all([
    supabase
      .from('move_tasks')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase
      .from('profiles')
      .select('user_id, display_name')
      .order('display_name', { ascending: true }),
  ])

  const tasks = (tasksResult.data ?? []) as MoveTask[]
  const profiles = (profilesResult.data ?? []) as Profile[]

  const doneCount = tasks.filter((t) => t.completed).length
  const total = tasks.length

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
                <Link href="/" className="text-text-muted hover:text-site-text transition-colors" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Home</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-text-muted hover:text-site-text transition-colors" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Watchlist</Link>
              </li>
              <li>
                <Link href="/manage" className="text-text-muted hover:text-site-text transition-colors" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Manage</Link>
              </li>
              <li>
                <Link href="/move" className="text-accent" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Move</Link>
              </li>
            </ul>
            <form action={handleSignOut}>
              <button type="submit" className="text-text-muted hover:text-site-text transition-colors" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sign out</button>
            </form>
          </div>
        </nav>

        {/* Hero */}
        <div className="pt-12 pb-8 animate-fade-up-slow" style={{ animationDelay: '0.25s' }}>
          <div
            className="text-text-muted mb-4 flex items-center gap-3"
            style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            <span className="inline-block w-8 h-px" style={{ background: '#8A7249' }} />
            Lincoln → Loughborough
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
            The <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>Move.</em>
          </h1>
          <p className="text-text-muted mt-4" style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
            {total > 0
              ? `${doneCount} of ${total} done · ${total - doneCount} to go`
              : 'No tasks yet.'}
          </p>
        </div>

        {/* Checklist */}
        <div className="animate-fade-up pb-4" style={{ animationDelay: '0.4s' }}>
          <MoveChecklist tasks={tasks} profiles={profiles} />
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-10 flex items-center justify-between animate-fade-up" style={{ animationDelay: '0.8s' }}>
          <span className="text-text-muted" style={{ fontSize: '0.75rem' }}>move.sambuxton.dev</span>
          <span className="text-text-muted" style={{ fontSize: '0.75rem' }}>{new Date().getFullYear()}</span>
        </footer>

      </div>
    </div>
  )
}
