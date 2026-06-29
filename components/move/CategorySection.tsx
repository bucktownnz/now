'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addMoveTask } from '@/app/actions'
import type { MoveCategory, MoveTask, Profile } from '@/lib/move/types'
import TaskRow from './TaskRow'

interface Props {
  category: MoveCategory
  emoji: string
  label: string
  tasks: MoveTask[]
  profiles: Profile[]
}

const sectionLabelStyle = {
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
}

const inputClass =
  'w-full bg-bg border border-border rounded-[3px] px-3 py-2.5 text-site-text font-mono text-sm outline-none focus:border-accent-dim transition-colors placeholder:text-text-muted'

export default function CategorySection({ category, emoji, label, tasks, profiles }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await addMoveTask(new FormData(formRef.current!))
      formRef.current?.reset()
      startTransition(() => router.refresh())
      setAdding(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-accent shrink-0" style={sectionLabelStyle}>
          <span aria-hidden className="mr-1.5" style={{ fontSize: '0.85rem' }}>{emoji}</span>
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-text-muted shrink-0" style={sectionLabelStyle}>{tasks.length} open</span>
        <button
          onClick={() => { setAdding((v) => !v); setError('') }}
          className="text-text-muted hover:text-accent transition-colors shrink-0"
          style={sectionLabelStyle}
        >
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Inline add form */}
      {adding && (
        <form
          ref={formRef}
          onSubmit={handleAdd}
          className="bg-bg-2 border border-border rounded-[3px] p-4 mb-4 flex flex-col gap-3"
        >
          <input type="hidden" name="category" value={category} />
          <input name="title" required autoFocus placeholder="Task title" className={inputClass} />
          <input name="notes" placeholder="Notes (optional)" className={inputClass} />
          <select
            name="assigned_to"
            defaultValue="unassigned"
            className={`${inputClass} text-text-muted`}
          >
            <option value="unassigned">Unassigned</option>
            {profiles.map((p) => (
              <option key={p.user_id} value={p.user_id}>{p.display_name}</option>
            ))}
          </select>
          {error && <p className="text-loss" style={{ fontSize: '0.8rem' }}>{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-accent-dim hover:bg-accent text-bg font-mono py-2 px-4 rounded-[3px] transition-colors disabled:opacity-50"
              style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              {loading ? 'Adding…' : 'Add task'}
            </button>
          </div>
        </form>
      )}

      {/* Tasks */}
      {tasks.length === 0 ? (
        <p className="text-text-muted italic" style={{ fontSize: '0.8rem' }}>
          {adding ? '' : 'All clear here.'}
        </p>
      ) : (
        <div className="flex flex-col gap-px bg-border rounded-[3px] overflow-hidden">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} profiles={profiles} />
          ))}
        </div>
      )}
    </section>
  )
}
