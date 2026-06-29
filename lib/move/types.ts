import type { MoveCategory } from './seedTasks'

export type { MoveCategory }

export interface Profile {
  user_id: string
  display_name: string
}

export interface MoveTask {
  id: string
  title: string
  notes: string
  category: MoveCategory
  assigned_to: string | null
  completed: boolean
  completed_at: string | null
  completed_by: string | null
  sort_order: number
  created_at: string
  created_by: string | null
}

// Display order + emoji + label for each category section.
export const CATEGORY_META: { id: MoveCategory; emoji: string; label: string }[] = [
  { id: 'property_legal', emoji: '🏠', label: 'Property & Legal' },
  { id: 'packing_moving', emoji: '📦', label: 'Packing & Moving' },
  { id: 'utilities', emoji: '🔌', label: 'Utilities & Services' },
  { id: 'address_changes', emoji: '📮', label: 'Address Changes' },
  { id: 'schools_childcare', emoji: '🏫', label: 'Schools & Childcare' },
  { id: 'pets_deliveries', emoji: '🐕', label: 'Pets & Deliveries' },
  { id: 'new_home', emoji: '🏡', label: 'New Home Setup' },
  { id: 'misc', emoji: '✅', label: 'Misc' },
]

export function displayNameFor(profiles: Profile[], userId: string | null): string | null {
  if (!userId) return null
  return profiles.find((p) => p.user_id === userId)?.display_name ?? null
}

export function initialFor(name: string | null): string {
  return name ? name.charAt(0).toUpperCase() : '?'
}
