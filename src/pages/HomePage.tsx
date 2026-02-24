import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useEntries, useLastByType, useSleepSummary, addEntry } from '../lib/entries'
import { EntryForm } from '../components/EntryForm'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'עכשיו'
  if (diffMins < 60) return `לפני ${diffMins} דקות`
  if (diffHours < 24) return `לפני ${diffHours} שעות`
  return `לפני ${diffDays} ימים`
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} דקות`
  if (m === 0) return `${h} שעות`
  return `${h} שעות ו־${m} דקות`
}

const typeLabel: Record<string, string> = {
  food: 'אוכל',
  poop: 'צואה',
  pee: 'שתן',
  sleep_start: 'נרדמה',
  sleep_end: 'התעוררה',
}

export function HomePage() {
  const entries = useEntries()
  const last = useLastByType()
  const sleep = useSleepSummary()
  const [showForm, setShowForm] = useState<string | null>(null)
  const [sleepSaving, setSleepSaving] = useState<string | null>(null)

  async function handleSleep(type: 'sleep_start' | 'sleep_end') {
    setSleepSaving(type)
    try {
      await addEntry(type)
    } finally {
      setSleepSaving(null)
    }
  }

  return (
    <div style={{ padding: 24, paddingBlockEnd: 80 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 24 }}>
        <h1 style={{ margin: 0 }}>מעקב תינוק</h1>
        <button type="button" onClick={() => signOut(auth)}>יציאה</button>
      </header>

      <section style={{ marginBlockEnd: 24 }}>
        <h2 style={{ fontSize: '1rem', marginBlockEnd: 8 }}>אחרון</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>צואה: {last.poop ? formatTimeAgo(last.poop) : '—'}</li>
          <li>אוכל: {last.food ? formatTimeAgo(last.food) : '—'}</li>
          <li>שתן: {last.pee ? formatTimeAgo(last.pee) : '—'}</li>
        </ul>
      </section>

      <section style={{ marginBlockEnd: 24 }}>
        <h2 style={{ fontSize: '1rem', marginBlockEnd: 8 }}>שינה</h2>
        {sleep.isSleepingNow && sleep.sleepStart && (
          <p style={{ marginBlockEnd: 8 }}>
            ישנה עכשיו מ־{sleep.sleepStart.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {sleep.lastNapDurationMinutes != null && !sleep.isSleepingNow && (
          <p style={{ marginBlockEnd: 8 }}>שינה אחרונה: {formatDuration(sleep.lastNapDurationMinutes)}</p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => handleSleep('sleep_start')}
            disabled={!!sleepSaving}
          >
            {sleepSaving === 'sleep_start' ? '...' : 'נרדמה'}
          </button>
          <button
            type="button"
            onClick={() => handleSleep('sleep_end')}
            disabled={!!sleepSaving}
          >
            {sleepSaving === 'sleep_end' ? '...' : 'התעוררה'}
          </button>
        </div>
      </section>

      <section style={{ marginBlockEnd: 24 }}>
        <h2 style={{ fontSize: '1rem', marginBlockEnd: 8 }}>הוסף</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['food', 'poop', 'pee'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setShowForm(showForm === type ? null : type)}
              style={{ padding: 12 }}
            >
              {typeLabel[type]}
            </button>
          ))}
        </div>
        {showForm && (
          <EntryForm
            type={showForm}
            onDone={() => setShowForm(null)}
          />
        )}
      </section>

      <section style={{ marginBlockEnd: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 8 }}>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>רשומה אחרונה</h2>
          <Link to="/history">היסטוריה</Link>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {entries.slice(0, 12).map((e) => (
            <li
              key={e.id}
              style={{
                padding: '8px 0',
                borderBlockEnd: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <span>{typeLabel[e.type] ?? e.type}{e.amount ? ` – ${e.amount}` : ''}</span>
              <span style={{ color: '#666' }}>
                {e.timestamp.toLocaleDateString('he-IL')} {e.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

