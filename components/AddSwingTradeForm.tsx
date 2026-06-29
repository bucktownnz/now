'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { addSwingTrade, updateSwingTrade } from '@/app/actions'

interface SwingTradeValues {
  id?: string
  ticker?: string
  name?: string
  shares?: number
  entry_price_pence?: number
  target_price_pence?: number | null
  stop_loss_pence?: number | null
  catalyst?: string
  horizon?: string
  notes?: string
}

interface Props {
  initial?: SwingTradeValues
  onDone?: () => void
}

const inputClass =
  'w-full bg-bg border border-border rounded-[3px] px-3 py-2.5 text-site-text font-mono text-sm outline-none focus:border-accent-dim transition-colors placeholder:text-text-muted'
const labelClass = 'block text-text-muted mb-1.5'
const labelStyle = { fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const }

export default function AddSwingTradeForm({ initial, onDone }: Props) {
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
        await updateSwingTrade(initial!.id!, formData)
      } else {
        await addSwingTrade(formData)
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
            placeholder="TSLA"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Company Name</label>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="Tesla"
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
            placeholder="10"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Entry Price (£ or $)</label>
          <input
            name="entry_price_pence"
            type="number"
            step="any"
            required
            defaultValue={initial?.entry_price_pence}
            placeholder="250.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Target Price (£ or $)</label>
          <input
            name="target_price_pence"
            type="number"
            step="any"
            defaultValue={initial?.target_price_pence ?? undefined}
            placeholder="290.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Stop Loss (£ or $)</label>
          <input
            name="stop_loss_pence"
            type="number"
            step="any"
            defaultValue={initial?.stop_loss_pence ?? undefined}
            placeholder="235.00"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Horizon</label>
          <input
            name="horizon"
            defaultValue={initial?.horizon}
            placeholder="1–2 weeks"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Catalyst / Trade Thesis</label>
        <textarea
          name="catalyst"
          rows={2}
          defaultValue={initial?.catalyst}
          placeholder="Why this trade, what's the trigger..."
          className={`${inputClass} resize-y`}
        />
      </div>

      {isEdit && (
        <div>
          <label className={labelClass} style={labelStyle}>Notes</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={initial?.notes}
            placeholder="Observations, learnings..."
            className={`${inputClass} resize-y`}
          />
        </div>
      )}

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
          {loading ? 'Saving…' : isEdit ? 'Update Trade' : 'Open Trade'}
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
