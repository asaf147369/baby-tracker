import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useEntries, deleteEntry } from '../lib/entries'
import type { EntryType } from '../types/entry'

const typeLabel: Record<string, string> = {
  food: 'אוכל',
  poop: 'צואה',
  pee: 'שתן',
  sleep_start: 'נרדמה',
  sleep_end: 'התעוררה',
  medicine: 'תרופה',
}

type FilterType = EntryType | 'all' | 'sleep' | 'sleep_food' | 'food_poop'

function getQueryType(filter: FilterType): EntryType | EntryType[] | undefined {
  if (filter === 'all') return undefined
  if (filter === 'sleep') return ['sleep_start', 'sleep_end']
  if (filter === 'sleep_food') return ['sleep_start', 'sleep_end', 'food']
  if (filter === 'food_poop') return ['food', 'poop']
  return filter
}

export function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const entries = useEntries({ type: getQueryType(filter) })

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteEntry(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div style={{ padding: 20, paddingBlockEnd: 100, maxWidth: 480, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 28 }}>
        <Link to="/">חזרה</Link>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>היסטוריה</h1>
      </header>

      <div style={{ marginBlockEnd: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" onClick={() => setFilter('all')}>הכל</button>
        <button type="button" onClick={() => setFilter('sleep')}>שינה</button>
        <button type="button" onClick={() => setFilter('sleep_food')}>שינה + אוכל</button>
        <button type="button" onClick={() => setFilter('food')}>אוכל</button>
        <button type="button" onClick={() => setFilter('food_poop')}>אוכל + צואה</button>
        <button type="button" onClick={() => setFilter('poop')}>צואה</button>
        <button type="button" onClick={() => setFilter('pee')}>שתן</button>
        <button type="button" onClick={() => setFilter('medicine')}>תרופות</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {entries.map((e) => (
          <li key={e.id} className="entry-row">
            <span>{typeLabel[e.type] ?? e.type}{e.amount ? ` – ${e.amount}` : ''}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                {e.timestamp.toLocaleDateString('he-IL')} {e.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                type="button"
                className="btn-delete"
                onClick={() => handleDelete(e.id)}
                disabled={deletingId === e.id}
                aria-label="מחק"
              >
                {deletingId === e.id ? '...' : 'מחק'}
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
