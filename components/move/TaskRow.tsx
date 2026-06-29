'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleMoveTask, assignMoveTask, deleteMoveTask } from '@/app/actions'
import type { MoveTask, Profile } from '@/lib/move/types'
import { displayNameFor, initialFor } from '@/lib/move/types'

interface Props {
  task: MoveTask
  profiles: Profile[]
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function TaskRow({ task, profiles }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  const assigneeName = displayNameFor(profiles, task.assigned_to)
  const completedByName = displayNameFor(profiles, task.completed_by)

  async function handleToggle() {
    setBusy(true)
    await toggleMoveTask(task.id, !task.completed)
    startTransition(() => router.refresh())
    setBusy(false)
  }

  async function handleAssign(value: string) {
    const assignedTo = value === 'unassigned' ? null : value
    await assignMoveTask(task.id, assignedTo)
    startTransition(() => router.refresh())
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    await deleteMoveTask(task.id)
    startTransition(() => router.refresh())
  }

  const dimmed = busy || pending

  return (
    <div
      className={`bg-bg-2 px-4 py-3.5 flex items-start gap-3 transition-opacity ${dimmed ? 'opacity-50' : ''}`}
    >
      {/* Checkbox — large tap target */}
      <button
        onClick={handleToggle}
        disabled={dimmed}
        aria-label={task.completed ? 'Mark not done' : 'Mark done'}
        className={`mt-0.5 shrink-0 w-6 h-6 rounded-[3px] border flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-accent-dim border-accent-dim text-bg'
            : 'border-border hover:border-accent-dim text-transparent'
        }`}
      >
        <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>✓</span>
      </button>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-site-text ${task.completed ? 'line-through opacity-60' : ''}`}
          style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: '0.95rem', lineHeight: 1.4 }}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="text-text-muted mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
            {task.notes}
          </p>
        )}
        {task.completed && completedByName && (
          <p className="text-text-muted mt-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            Done by {completedByName} · {formatDate(task.completed_at)}
          </p>
        )}

        {/* Assignee + delete row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Initial badge */}
          {assigneeName ? (
            <span
              className="shrink-0 w-5 h-5 rounded-full bg-accent text-bg flex items-center justify-center"
              style={{ fontSize: '0.6rem', fontWeight: 500 }}
              title={assigneeName}
            >
              {initialFor(assigneeName)}
            </span>
          ) : (
            <span
              className="shrink-0 w-5 h-5 rounded-full border border-dashed border-border text-text-muted flex items-center justify-center"
              style={{ fontSize: '0.6rem' }}
              title="Unassigned"
            >
              ?
            </span>
          )}

          {/* Assignee dropdown */}
          <select
            value={task.assigned_to ?? 'unassigned'}
            onChange={(e) => handleAssign(e.target.value)}
            disabled={dimmed}
            className="bg-bg border border-border rounded-[3px] px-2 py-1 text-text-muted font-mono outline-none focus:border-accent-dim transition-colors"
            style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}
          >
            <option value="unassigned">Unassigned</option>
            {profiles.map((p) => (
              <option key={p.user_id} value={p.user_id}>{p.display_name}</option>
            ))}
          </select>

          <button
            onClick={handleDelete}
            disabled={dimmed}
            className="text-text-muted hover:text-loss transition-colors ml-auto"
            style={{ fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
