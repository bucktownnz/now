-- Shared Move Checklist — Starter task seed
-- Guarded: only inserts when move_tasks is completely empty, so it is safe to
-- re-run and cannot duplicate the list. created_by is left null for the seed.
-- Kept in sync with lib/move/seedTasks.ts (the app also seeds programmatically
-- on first load as a belt-and-braces fallback).

insert into move_tasks (title, notes, category, sort_order)
select v.title, v.notes, v.category, v.ord
from (values
  -- 🏠 Property & Legal
  (0,  'Chase solicitor (Angela Ingall, NBLaw) for exchange date', 'Confirm exchange and completion dates in writing.', 'property_legal'),
  (1,  'Confirm completion date and time NatWest funds are released', '', 'property_legal'),
  (2,  'Notify mortgage lender / broker (Derek Brodie) of move dates', 'NatWest 2yr fixed — confirm completion logistics.', 'property_legal'),
  (3,  'Arrange buildings survey / snagging list for new-build "The Blyth"', '', 'property_legal'),
  (4,  'Confirm key handover arrangements for completion day', '', 'property_legal'),
  -- 📦 Packing & Moving
  (5,  'Confirm removal company booking and access arrangements', '', 'packing_moving'),
  (6,  'Order packing materials (boxes, tape, bubble wrap)', '', 'packing_moving'),
  (7,  'Pack and label fragile items; make an essentials box', '', 'packing_moving'),
  (8,  'Arrange childcare and dog care for moving day', '', 'packing_moving'),
  -- 🔌 Utilities & Services
  (9,  'Notify current gas & electricity supplier of move-out date', '', 'utilities'),
  (10, 'Set up gas & electricity account at new property', '', 'utilities'),
  (11, 'Notify water supplier (both addresses)', '', 'utilities'),
  (12, 'Arrange broadband transfer or new connection at new address', 'Book early — new-build activation can take weeks.', 'utilities'),
  (13, 'Notify council tax — both current and new local authority', 'Current: West Lindsey. New: Charnwood Borough Council.', 'utilities'),
  -- 📮 Address Changes
  (14, 'Update address with DVLA — driving licence', '', 'address_changes'),
  (15, 'Update address with DVLA — vehicle registration (V5C)', '', 'address_changes'),
  (16, 'Update address with HMRC', '', 'address_changes'),
  (17, 'Notify bank(s) of new address', '', 'address_changes'),
  (18, 'Update car insurance & breakdown cover to new address', '', 'address_changes'),
  (19, 'Update pension / ISA / Trading212 providers', '', 'address_changes'),
  (20, 'Notify employer(s) of new address', 'Sam + Anatasia (Boots HQ).', 'address_changes'),
  (21, 'Update electoral roll at new address', '', 'address_changes'),
  (22, 'Set up Royal Mail mail redirection (12 months)', '', 'address_changes'),
  (23, 'Update TV Licence address', '', 'address_changes'),
  (24, 'Update subscription services (Amazon, etc.)', '', 'address_changes'),
  (25, 'Update address on standing orders & direct debits', '', 'address_changes'),
  (26, 'Notify GP surgery of new address & register with a GP near new home', '', 'address_changes'),
  (27, 'Update dentist with new address / register locally', '', 'address_changes'),
  -- 🏫 Schools & Childcare
  (28, 'Confirm school place for eldest son near new home', '', 'schools_childcare'),
  (29, 'Arrange settling-in / induction visit for eldest son', '', 'schools_childcare'),
  (30, 'Sort school uniform and start-date logistics', '', 'schools_childcare'),
  (31, 'Register youngest son with a nursery near new home', '', 'schools_childcare'),
  (32, 'Give notice / leave date to current Storal nursery (Hathern)', '', 'schools_childcare'),
  -- 🐕 Pets & Deliveries
  (33, 'Update vet with new address / register with a local vet', '', 'pets_deliveries'),
  (34, 'Reroute recurring dog food delivery to new address', '', 'pets_deliveries'),
  (35, 'Update microchip registration with new address', '', 'pets_deliveries'),
  (36, 'Redirect any other recurring deliveries / prescriptions', '', 'pets_deliveries'),
  -- 🏡 New Home Setup
  (37, 'Arrange home insurance for new address (or transfer policy)', '', 'new_home'),
  (38, 'Book locksmith to change locks at new property', '', 'new_home'),
  (39, 'Take meter readings at current property on moving day', '', 'new_home'),
  (40, 'Take meter readings at new property on moving day', '', 'new_home'),
  (41, 'Confirm broadband activation date at new address', '', 'new_home'),
  (42, 'Find recycling & bin collection schedule for new address', '', 'new_home'),
  -- ✅ Misc
  (43, 'Confirm completion-day logistics — who has keys, who is where', '', 'misc'),
  (44, 'Cancel or transfer current contents/buildings insurance', '', 'misc'),
  (45, 'Run down freezer & fridge contents before the move', '', 'misc')
) as v(ord, title, notes, category)
where not exists (select 1 from move_tasks);
