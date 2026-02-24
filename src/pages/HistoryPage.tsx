import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useEntries } from '../lib/entries'
import type { EntryType } from '../types/entry'

const typeLabel: Record<string, string> = {
  food: 'אוכל',
  poop: 'צואה',
  pee: 'שתן',
}

const TYPES: EntryType[] = ['food', 'poop', 'pee']

export function HistoryPage() {
  const [filter, setFilter] = useState<EntryType | 'all'>('all')
  const entries = useEntries({ type: filter === 'all' ? undefined : filter })

  return (
    <div style={{ padding: 24, paddingBlockEnd: 80 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 24 }}>
        <Link to="/">חזרה</Link>
        <h1 style={{ margin: 0 }}>היסטוריה</h1>
      </header>

      <div style={{ marginBlockEnd: 16 }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{ marginInlineEnd: 8 }}
        >
          הכל
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            style={{ marginInlineEnd: 8 }}
          >
            {typeLabel[t]}
          </button>
        ))}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {entries.map((e) => (
          <li
            key={e.id}
            style={{
              padding: '12px 0',
              borderBlockEnd: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{typeLabel[e.type]}{e.amount ? ` – ${e.amount}` : ''}</span>
            <span style={{ color: '#666' }}>
              {e.timestamp.toLocaleDateString('he-IL')} {e.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
