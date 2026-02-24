import { useState } from 'react'
import { addEntry } from '../lib/entries'
import type { EntryType, PoopAmount } from '../types/entry'

const POOP_OPTIONS: PoopAmount[] = ['small', 'medium', 'large']
const POOP_LABELS: Record<PoopAmount, string> = { small: 'קטן', medium: 'בינוני', large: 'גדול' }

type Props = { type: EntryType; onDone: () => void }

export function EntryForm({ type, onDone }: Props) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      let value: string | undefined = amount.trim() || undefined
      if (type === 'pee') value = 'logged'
      if (type === 'sleep_start' || type === 'sleep_end') value = undefined
      await addEntry(type, value)
      onDone()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBlockStart: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
      {type === 'food' && (
        <input
          type="text"
          placeholder="כמות (למשל 120 מ״ל)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '100%', padding: 8, marginBlockEnd: 8 }}
        />
      )}
      {type === 'poop' && (
        <div style={{ marginBlockEnd: 8 }}>
          {POOP_OPTIONS.map((opt) => (
            <label key={opt} style={{ marginInlineEnd: 12 }}>
              <input
                type="radio"
                name="poop"
                value={opt}
                checked={amount === opt}
                onChange={() => setAmount(opt)}
              />
              {' '}{POOP_LABELS[opt]}
            </label>
          ))}
        </div>
      )}
      {type === 'pee' && <p style={{ marginBlockEnd: 8 }}>נרשם שתן</p>}
      {(type === 'sleep_start' || type === 'sleep_end') && (
        <p style={{ marginBlockEnd: 8 }}>{type === 'sleep_start' ? 'נרדמה' : 'התעוררה'}</p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading}>שמור</button>
        <button type="button" onClick={onDone}>ביטול</button>
      </div>
    </form>
  )
}
