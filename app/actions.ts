'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ─── Holdings ────────────────────────────────────────────────────────────────

export async function addHolding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('holdings').insert({
    user_id: user.id,
    ticker: String(formData.get('ticker')).toUpperCase().trim(),
    name: String(formData.get('name')).trim(),
    shares: parseFloat(String(formData.get('shares'))),
    avg_cost_pence: parseFloat(String(formData.get('avg_cost_pence'))),
    sector: String(formData.get('sector') ?? '').trim(),
    thesis: String(formData.get('thesis') ?? '').trim(),
  })

  revalidatePath('/')
  revalidatePath('/manage')
}

export async function updateHolding(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('holdings')
    .update({
      ticker: String(formData.get('ticker')).toUpperCase().trim(),
      name: String(formData.get('name')).trim(),
      shares: parseFloat(String(formData.get('shares'))),
      avg_cost_pence: parseFloat(String(formData.get('avg_cost_pence'))),
      sector: String(formData.get('sector') ?? '').trim(),
      thesis: String(formData.get('thesis') ?? '').trim(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidatePath('/manage')
}

export async function deleteHolding(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('holdings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidatePath('/manage')
}

// ─── Portfolio Settings ───────────────────────────────────────────────────────

export async function getPortfolioThesis(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return ''

  const { data } = await supabase
    .from('portfolio_settings')
    .select('portfolio_thesis')
    .eq('user_id', user.id)
    .single()

  return data?.portfolio_thesis ?? ''
}

export async function updatePortfolioThesis(thesis: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('portfolio_settings')
    .upsert({ user_id: user.id, portfolio_thesis: thesis, updated_at: new Date().toISOString() })

  revalidatePath('/dashboard')
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export async function addWatchlistItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('watchlist').insert({
    user_id: user.id,
    ticker: String(formData.get('ticker')).toUpperCase().trim(),
    name: String(formData.get('name')).trim(),
    notes: String(formData.get('notes') ?? '').trim(),
  })

  revalidatePath('/')
  revalidatePath('/manage')
}

export async function updateWatchlistItem(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('watchlist')
    .update({
      ticker: String(formData.get('ticker')).toUpperCase().trim(),
      name: String(formData.get('name')).trim(),
      notes: String(formData.get('notes') ?? '').trim(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidatePath('/manage')
}

export async function deleteWatchlistItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('watchlist')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidatePath('/manage')
}
