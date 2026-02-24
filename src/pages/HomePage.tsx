import { useState, useEffect, useRef } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useEntries, useLastByType, useSleepSummary, useMedicineGivenToday, useTodaySummary, addEntry, deleteEntry } from '../lib/entries'
import { useReminderAlerts, getReminderThresholds, setReminderThresholds, requestNotificationPermission, sendReminderNotification } from '../lib/reminders'
import { EntryForm } from '../components/EntryForm'
import type { Entry } from '../types/entry'
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
  medicine: 'תרופה',
}

export function HomePage() {
  const entries = useEntries()
  const last = useLastByType()
  const sleep = useSleepSummary()
  const vitaminD = useMedicineGivenToday()
  const today = useTodaySummary()
  const reminders = useReminderAlerts()
  const [showForm, setShowForm] = useState<string | null>(null)
  const [medicineSaving, setMedicineSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const search = useSearch({ strict: false }) as { tab?: string }
  const tab = search?.tab === 'info' ? 'info' : 'add'
  const [showReminderSettings, setShowReminderSettings] = useState(false)
  const [reminderFoodHours, setReminderFoodHours] = useState(() => getReminderThresholds().foodHours)
  const [reminderPoopHours, setReminderPoopHours] = useState(() => getReminderThresholds().poopHours)

  useEffect(() => {
    if (showReminderSettings) {
      const t = getReminderThresholds()
      setReminderFoodHours(t.foodHours)
      setReminderPoopHours(t.poopHours)
    }
  }, [showReminderSettings])
  const notificationSentRef = useRef(false)

  useEffect(() => {
    if (!reminders.foodAlert && !reminders.poopAlert) {
      notificationSentRef.current = false
      return
    }
    if (notificationSentRef.current) return
    const parts: string[] = []
    if (reminders.foodAlert && reminders.foodHoursAgo != null) parts.push(`לא אכלה מעל ${reminders.foodHoursAgo} שעות`)
    if (reminders.poopAlert && reminders.poopHoursAgo != null) parts.push(`לא הייתה צואה מעל ${reminders.poopHoursAgo} שעות`)
    if (parts.length) {
      sendReminderNotification(parts.join('. '))
      notificationSentRef.current = true
    }
  }, [reminders.foodAlert, reminders.poopAlert, reminders.foodHoursAgo, reminders.poopHoursAgo])

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteEntry(id)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleVitaminD() {
    setMedicineSaving(true)
    try {
      await addEntry('medicine', 'ויטמין D')
    } finally {
      setMedicineSaving(false)
    }
  }

  function saveReminderThresholds() {
    setReminderThresholds(reminderFoodHours, reminderPoopHours)
    setShowReminderSettings(false)
  }

  const formType = showForm as 'food' | 'poop' | 'pee' | 'sleep_start' | 'sleep_end' | null

  return (
    <div style={{ padding: 20, paddingBlockEnd: 100, maxWidth: 480, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 16 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>מעקב תינוק</h1>
        <button type="button" onClick={() => signOut(auth)}>יציאה</button>
      </header>

      {tab === 'add' && (
        <>
          {!vitaminD.given && (
            <section className="section-card">
              <h2>ויטמין D</h2>
              <p style={{ margin: '0 0 12px 0' }}>עדיין לא ניתנה היום</p>
              <button type="button" onClick={handleVitaminD} disabled={medicineSaving}>
                {medicineSaving ? '...' : 'נתתי'}
              </button>
            </section>
          )}

          <section className="section-card">
            <h2>שינה</h2>
            <p style={{ margin: '0 0 12px 0', color: '#aaa', fontSize: '0.9rem' }}>בחר מתי קרה (אפשר עכשיו או קודם)</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setShowForm(showForm === 'sleep_start' ? null : 'sleep_start')}>
                נרדמה
              </button>
              <button type="button" onClick={() => setShowForm(showForm === 'sleep_end' ? null : 'sleep_end')}>
                התעוררה
              </button>
            </div>
            {(formType === 'sleep_start' || formType === 'sleep_end') && (
              <EntryForm type={formType} onDone={() => setShowForm(null)} />
            )}
          </section>

          <section className="section-card">
            <h2>אוכל, צואה, שתן</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(['food', 'poop', 'pee'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setShowForm(showForm === type ? null : type)}
                  style={{ padding: '12px 16px' }}
                >
                  {typeLabel[type]}
                </button>
              ))}
            </div>
            {formType && formType !== 'sleep_start' && formType !== 'sleep_end' && (
              <EntryForm type={formType} onDone={() => setShowForm(null)} />
            )}
          </section>

          <section className="section-card">
            <h2 style={{ marginBlockEnd: 8 }}>אחרונות</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {entries.slice(0, 5).map((e: Entry) => (
                <li key={e.id} className="entry-row">
                  <span>{typeLabel[e.type] ?? e.type}{e.amount ? ` – ${e.amount}` : ''}</span>
                  <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    {e.timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {tab === 'info' && (
        <>
          {vitaminD.given && (
            <section className="section-card">
              <h2>ויטמין D</h2>
              <p style={{ margin: 0 }}>
                ניתנה היום {vitaminD.time ? vitaminD.time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </section>
          )}

          {(reminders.foodAlert || reminders.poopAlert) && (
            <section className="section-card" style={{ background: 'rgba(120,50,50,0.3)', borderColor: '#6a3a3a' }}>
              <h2>תזכורת</h2>
              {reminders.foodAlert && reminders.foodHoursAgo != null && (
                <p style={{ margin: 0 }}>לא אכלה מעל {reminders.foodHoursAgo} שעות</p>
              )}
              {reminders.poopAlert && reminders.poopHoursAgo != null && (
                <p style={{ margin: reminders.foodAlert ? '8px 0 0' : 0 }}>לא הייתה צואה מעל {reminders.poopHoursAgo} שעות</p>
              )}
            </section>
          )}

          <section className="section-card">
            <h2>היום</h2>
            <p style={{ margin: 0 }}>
              {today.feeds} האכלות, {today.naps} תנומות, סה״כ שינה {formatDuration(today.totalSleepMinutes)}
            </p>
          </section>

          <section className="section-card">
            <h2>אחרון</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ paddingBlock: 4 }}>צואה: {last.poop ? formatTimeAgo(last.poop) : '—'}</li>
              <li style={{ paddingBlock: 4 }}>אוכל: {last.food ? formatTimeAgo(last.food) : '—'}</li>
              <li style={{ paddingBlock: 4 }}>שתן: {last.pee ? formatTimeAgo(last.pee) : '—'}</li>
            </ul>
          </section>

          <section className="section-card">
            <h2>שינה</h2>
            {sleep.isSleepingNow && sleep.sleepStart && (
              <p style={{ margin: 0 }}>
                ישנה עכשיו מ־{sleep.sleepStart.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {sleep.lastNapDurationMinutes != null && !sleep.isSleepingNow && (
              <p style={{ margin: 0 }}>שינה אחרונה: {formatDuration(sleep.lastNapDurationMinutes)}</p>
            )}
          </section>

          <section className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBlockEnd: showReminderSettings ? 12 : 0 }}>
              <h2 style={{ margin: 0 }}>תזכורות</h2>
              <span style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setShowReminderSettings(!showReminderSettings)}>הגדרות</button>
                <button type="button" onClick={() => requestNotificationPermission()}>התראות בדפדפן</button>
              </span>
            </div>
            {showReminderSettings && (
              <div style={{ marginBlockStart: 12 }}>
                <label style={{ display: 'block', marginBlockEnd: 8 }}>
                  התראות אם לא אכלה מעל
                  <input type="number" min={1} max={24} value={reminderFoodHours} onChange={(e) => setReminderFoodHours(Number(e.target.value))} style={{ marginInlineStart: 8, width: 48 }} />
                  שעות
                </label>
                <label style={{ display: 'block', marginBlockEnd: 12 }}>
                  התראות אם לא הייתה צואה מעל
                  <input type="number" min={1} max={72} value={reminderPoopHours} onChange={(e) => setReminderPoopHours(Number(e.target.value))} style={{ marginInlineStart: 8, width: 48 }} />
                  שעות
                </label>
                <button type="button" onClick={saveReminderThresholds}>שמור</button>
              </div>
            )}
          </section>

          <section className="section-card">
            <h2>רשומה אחרונה</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {entries.slice(0, 12).map((e: Entry) => (
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
          </section>
        </>
      )}
    </div>
  )
}

