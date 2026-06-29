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

// ─── Swing Trades ─────────────────────────────────────────────────────────────

export async function addSwingTrade(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const targetRaw = formData.get('target_price_pence')
  const stopRaw = formData.get('stop_loss_pence')

  await supabase.from('swing_trades').insert({
    user_id: user.id,
    ticker: String(formData.get('ticker')).toUpperCase().trim(),
    name: String(formData.get('name')).trim(),
    shares: parseFloat(String(formData.get('shares'))),
    entry_price_pence: parseFloat(String(formData.get('entry_price_pence'))),
    target_price_pence: targetRaw ? parseFloat(String(targetRaw)) : null,
    stop_loss_pence: stopRaw ? parseFloat(String(stopRaw)) : null,
    catalyst: String(formData.get('catalyst') ?? '').trim(),
    horizon: String(formData.get('horizon') ?? '').trim(),
    status: 'open',
  })

  revalidatePath('/dashboard')
  revalidatePath('/manage')
}

export async function updateSwingTrade(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const targetRaw = formData.get('target_price_pence')
  const stopRaw = formData.get('stop_loss_pence')

  await supabase
    .from('swing_trades')
    .update({
      ticker: String(formData.get('ticker')).toUpperCase().trim(),
      name: String(formData.get('name')).trim(),
      shares: parseFloat(String(formData.get('shares'))),
      entry_price_pence: parseFloat(String(formData.get('entry_price_pence'))),
      target_price_pence: targetRaw ? parseFloat(String(targetRaw)) : null,
      stop_loss_pence: stopRaw ? parseFloat(String(stopRaw)) : null,
      catalyst: String(formData.get('catalyst') ?? '').trim(),
      horizon: String(formData.get('horizon') ?? '').trim(),
      notes: String(formData.get('notes') ?? '').trim(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/manage')
}

export async function closeSwingTrade(id: string, exitPricePence: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('swing_trades')
    .update({
      status: 'closed',
      exit_price_pence: exitPricePence,
      closed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/manage')
}

export async function deleteSwingTrade(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('swing_trades')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/manage')
}

// ─── Move Checklist ───────────────────────────────────────────────────────────
// Unlike the portfolio tables above, move_tasks is SHARED state: any household
// member (anyone with a profiles row) reads/writes every row. So these actions
// deliberately do NOT scope by user_id — RLS enforces household membership.

const MOVE_CATEGORIES = [
  'property_legal', 'packing_moving', 'utilities', 'address_changes',
  'schools_childcare', 'pets_deliveries', 'new_home', 'misc',
] as const

function normaliseCategory(raw: unknown): string {
  const value = String(raw ?? '').trim()
  return (MOVE_CATEGORIES as readonly string[]).includes(value) ? value : 'misc'
}

function normaliseAssignee(raw: unknown): string | null {
  const value = String(raw ?? '').trim()
  return value === '' || value === 'unassigned' ? null : value
}

export async function addMoveTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = String(formData.get('title') ?? '').trim()
  if (!title) throw new Error('Title is required')

  await supabase.from('move_tasks').insert({
    title,
    notes: String(formData.get('notes') ?? '').trim(),
    category: normaliseCategory(formData.get('category')),
    assigned_to: normaliseAssignee(formData.get('assigned_to')),
    created_by: user.id,
  })

  revalidatePath('/move')
}

export async function updateMoveTask(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = String(formData.get('title') ?? '').trim()
  if (!title) throw new Error('Title is required')

  await supabase
    .from('move_tasks')
    .update({
      title,
      notes: String(formData.get('notes') ?? '').trim(),
      category: normaliseCategory(formData.get('category')),
      assigned_to: normaliseAssignee(formData.get('assigned_to')),
    })
    .eq('id', id)

  revalidatePath('/move')
}

export async function toggleMoveTask(id: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('move_tasks')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? user.id : null,
    })
    .eq('id', id)

  revalidatePath('/move')
}

export async function assignMoveTask(id: string, assignedTo: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('move_tasks')
    .update({ assigned_to: assignedTo })
    .eq('id', id)

  revalidatePath('/move')
}

export async function deleteMoveTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('move_tasks').delete().eq('id', id)

  revalidatePath('/move')
}
