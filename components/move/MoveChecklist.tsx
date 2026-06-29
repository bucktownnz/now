'use client'

import type { MoveTask, Profile } from '@/lib/move/types'
import { CATEGORY_META } from '@/lib/move/types'
import CategorySection from './CategorySection'
import DoneSection from './DoneSection'

interface Props {
  tasks: MoveTask[]
  profiles: Profile[]
}

export default function MoveChecklist({ tasks, profiles }: Props) {
  const active = tasks.filter((t) => !t.completed)
  const done = tasks
    .filter((t) => t.completed)
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))

  return (
    <>
      {CATEGORY_META.map((meta) => (
        <CategorySection
          key={meta.id}
          category={meta.id}
          emoji={meta.emoji}
          label={meta.label}
          tasks={active.filter((t) => t.category === meta.id)}
          profiles={profiles}
        />
      ))}

      <DoneSection tasks={done} profiles={profiles} />
    </>
  )
}
