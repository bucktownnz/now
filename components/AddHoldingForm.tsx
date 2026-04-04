'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { addHolding, updateHolding } from '@/app/actions'

interface HoldingValues {
  id?: string
  ticker?: string
  name?: string
  shares?: number
  avg_cost_pence?: number
  sector?: string
  thesis?: string
}

interface Props {
  initial?: HoldingValues
  onDone?: () => void
}

const inputClass =
  'w-full bg-bg border border-border rounded-[3px] px-3 py-2.5 text-site-text font-mono text-sm outline-none focus:border-accent-dim transition-colors placeholder:text-text-muted'
const labelClass = 'block text-text-muted mb-1.5'
const labelStyle = { fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const }

export default function AddHoldingForm({ initial, onDone }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEdit = !!initial?.id

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(formRef.current!)

    try {
      if (isEdit) {
        await updateHolding(initial!.id!, formData)
      } else {
        await addHolding(formData)
        formRef.current?.reset()
      }
      router.refresh()
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>Ticker</label>
          <input
            name="ticker"
            required
            defaultValue={initial?.ticker}
            placeholder="BAES.L"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Display Name</label>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="BAE Systems"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Shares</label>
          <input
            name="shares"
            type="number"
            step="any"
            required
            defaultValue={initial?.shares}
            placeholder="100"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Avg Cost per share (£ or $)</label>
          <input
            name="avg_cost_pence"
            type="number"
            step="any"
            required
            defaultValue={initial?.avg_cost_pence}
            placeholder="89.82"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Sector</label>
          <input
            name="sector"
            defaultValue={initial?.sector}
            placeholder="Aerospace & Defence"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Thesis</label>
        <textarea
          name="thesis"
          rows={3}
          defaultValue={initial?.thesis}
          placeholder="Why you hold this position..."
          className={`${inputClass} resize-y`}
        />
      </div>

      {error && (
        <p className="text-loss" style={{ fontSize: '0.8rem' }}>{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent-dim hover:bg-accent text-bg font-mono py-2 px-4 rounded-[3px] transition-colors disabled:opacity-50"
          style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {loading ? 'Saving…' : isEdit ? 'Update Holding' : 'Add Holding'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-text-muted hover:text-site-text transition-colors font-mono py-2 px-3"
            style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
