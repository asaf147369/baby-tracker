import type { Entry } from '../types/entry'

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export interface DaySleep {
  date: string
  totalMinutes: number
  napCount: number
}

export function getNapsByDay(entries: Entry[], days: number = 14): DaySleep[] {
  const sleepEntries = entries
    .filter((e) => e.type === 'sleep_start' || e.type === 'sleep_end')
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  const byDay: Record<string, { minutes: number; count: number }> = {}
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = toDateKey(d)
    byDay[key] = { minutes: 0, count: 0 }
  }

  for (let i = 0; i < sleepEntries.length - 1; i++) {
    if (sleepEntries[i].type === 'sleep_start' && sleepEntries[i + 1].type === 'sleep_end') {
      const start = sleepEntries[i].timestamp
      const end = sleepEntries[i + 1].timestamp
      const key = toDateKey(start)
      if (byDay[key]) {
        const mins = Math.round((end.getTime() - start.getTime()) / 60000)
        byDay[key].minutes += mins
        byDay[key].count += 1
      }
    }
  }

  const keys = Object.keys(byDay).sort()
  return keys.map((date) => ({
    date,
    totalMinutes: byDay[date].minutes,
    napCount: byDay[date].count,
  }))
}

export function formatDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' })
}
