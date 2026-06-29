// Starter task list for the shared move checklist (Sudbrooke, Lincoln →
// Garendon Park, Loughborough). Used to seed `move_tasks` on first load when
// the table is empty. Kept in sync with supabase/migrations/006_move_checklist_seed.sql.

export type MoveCategory =
  | 'property_legal'
  | 'packing_moving'
  | 'utilities'
  | 'address_changes'
  | 'schools_childcare'
  | 'pets_deliveries'
  | 'new_home'
  | 'misc'

export interface SeedTask {
  title: string
  notes?: string
  category: MoveCategory
}

// Order within each category is preserved via the array index (→ sort_order).
export const SEED_TASKS: SeedTask[] = [
  // 🏠 Property & Legal
  { category: 'property_legal', title: 'Chase solicitor (Angela Ingall, NBLaw) for exchange date', notes: 'Confirm exchange and completion dates in writing.' },
  { category: 'property_legal', title: 'Confirm completion date and time NatWest funds are released' },
  { category: 'property_legal', title: 'Notify mortgage lender / broker (Derek Brodie) of move dates', notes: 'NatWest 2yr fixed — confirm completion logistics.' },
  { category: 'property_legal', title: 'Arrange buildings survey / snagging list for new-build "The Blyth"' },
  { category: 'property_legal', title: 'Confirm key handover arrangements for completion day' },

  // 📦 Packing & Moving
  { category: 'packing_moving', title: 'Confirm removal company booking and access arrangements' },
  { category: 'packing_moving', title: 'Order packing materials (boxes, tape, bubble wrap)' },
  { category: 'packing_moving', title: 'Pack and label fragile items; make an essentials box' },
  { category: 'packing_moving', title: 'Arrange childcare and dog care for moving day' },

  // 🔌 Utilities & Services
  { category: 'utilities', title: 'Notify current gas & electricity supplier of move-out date' },
  { category: 'utilities', title: 'Set up gas & electricity account at new property' },
  { category: 'utilities', title: 'Notify water supplier (both addresses)' },
  { category: 'utilities', title: 'Arrange broadband transfer or new connection at new address', notes: 'Book early — new-build activation can take weeks.' },
  { category: 'utilities', title: 'Notify council tax — both current and new local authority', notes: 'Current: West Lindsey. New: Charnwood Borough Council.' },

  // 📮 Address Changes
  { category: 'address_changes', title: 'Update address with DVLA — driving licence' },
  { category: 'address_changes', title: 'Update address with DVLA — vehicle registration (V5C)' },
  { category: 'address_changes', title: 'Update address with HMRC' },
  { category: 'address_changes', title: 'Notify bank(s) of new address' },
  { category: 'address_changes', title: 'Update car insurance & breakdown cover to new address' },
  { category: 'address_changes', title: 'Update pension / ISA / Trading212 providers' },
  { category: 'address_changes', title: 'Notify employer(s) of new address', notes: 'Sam + Anatasia (Boots HQ).' },
  { category: 'address_changes', title: 'Update electoral roll at new address' },
  { category: 'address_changes', title: 'Set up Royal Mail mail redirection (12 months)' },
  { category: 'address_changes', title: 'Update TV Licence address' },
  { category: 'address_changes', title: 'Update subscription services (Amazon, etc.)' },
  { category: 'address_changes', title: 'Update address on standing orders & direct debits' },

  // 🏫 Schools & Childcare
  { category: 'schools_childcare', title: 'Confirm school place for eldest son near new home' },
  { category: 'schools_childcare', title: 'Arrange settling-in / induction visit for eldest son' },
  { category: 'schools_childcare', title: 'Sort school uniform and start-date logistics' },
  { category: 'schools_childcare', title: 'Register youngest son with a nursery near new home' },
  { category: 'schools_childcare', title: 'Give notice / leave date to current Storal nursery (Hathern)' },

  // 🐕 Pets & Deliveries
  { category: 'pets_deliveries', title: 'Update vet with new address / register with a local vet' },
  { category: 'pets_deliveries', title: 'Reroute recurring dog food delivery to new address' },
  { category: 'pets_deliveries', title: 'Update microchip registration with new address' },
  { category: 'pets_deliveries', title: 'Redirect any other recurring deliveries / prescriptions' },

  // 🏡 New Home Setup
  { category: 'new_home', title: 'Arrange home insurance for new address (or transfer policy)' },
  { category: 'new_home', title: 'Book locksmith to change locks at new property' },
  { category: 'new_home', title: 'Take meter readings at current property on moving day' },
  { category: 'new_home', title: 'Take meter readings at new property on moving day' },
  { category: 'new_home', title: 'Confirm broadband activation date at new address' },
  { category: 'new_home', title: 'Find recycling & bin collection schedule for new address' },

  // 🏫/GP — health
  { category: 'address_changes', title: 'Notify GP surgery of new address & register with a GP near new home' },
  { category: 'address_changes', title: 'Update dentist with new address / register locally' },

  // ✅ Misc
  { category: 'misc', title: 'Confirm completion-day logistics — who has keys, who is where' },
  { category: 'misc', title: 'Cancel or transfer current contents/buildings insurance' },
  { category: 'misc', title: 'Run down freezer & fridge contents before the move' },
]
