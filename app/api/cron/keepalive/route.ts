import { createClient } from '@supabase/supabase-js'

// Node.js runtime, never cached — this must be a real request every time.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Keep-alive ping.
 *
 * Supabase pauses free-tier projects after 7 days with no activity, which is
 * what took this site's backend down on 2026-09-02. One trivial read a day
 * keeps the clock from ever reaching seven.
 *
 * Deliberately unauthenticated and deliberately not sharing /api/cron/scout's
 * plumbing: that route fails closed on a missing CRON_SECRET, which is exactly
 * why it 401'd every weekday for two months without reaching the database.
 * This one returns no data, so there is nothing to protect, and it falls back
 * to the anon key so a missing service-role key can't stop the ping either.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[cron/keepalive] Supabase env vars missing')
    return Response.json({ ok: false, error: 'Supabase env vars missing' }, { status: 500 })
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase.from('profiles').select('user_id').limit(1)

  if (error) {
    console.error('[cron/keepalive] ping failed:', error)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  console.log('[cron/keepalive] ok')
  return Response.json({ ok: true, pinged_at: new Date().toISOString() })
}
