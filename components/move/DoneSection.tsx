'use client'

import { useState } from 'react'
import type { MoveTask, Profile } from '@/lib/move/types'
import TaskRow from './TaskRow'

interface Props {
  tasks: MoveTask[]
  profiles: Profile[]
}

const sectionLabelStyle = {
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
}

export default function DoneSection({ tasks, profiles }: Props) {
  const [open, setOpen] = useState(false)

  if (tasks.length === 0) return null

  return (
    <section className="mb-10">
      <div className="flex items-baseline gap-3 mb-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-text-muted hover:text-accent transition-colors shrink-0 flex items-baseline gap-2"
          style={sectionLabelStyle}
        >
          <span aria-hidden style={{ fontSize: '0.6rem' }}>{open ? '▾' : '▸'}</span>
          Done
        </button>
        <div className="flex-1 h-px bg-border" />
        <span className="text-text-muted shrink-0" style={sectionLabelStyle}>{tasks.length} complete</span>
      </div>

      {open && (
        <div className="flex flex-col gap-px bg-border rounded-[3px] overflow-hidden">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} profiles={profiles} />
          ))}
        </div>
      )}
    </section>
  )
}
