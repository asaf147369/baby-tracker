import { Link } from '@tanstack/react-router'
import { useEntries } from '../lib/entries'
import { getNapsByDay, formatDayLabel } from '../lib/sleepChart'

const MAX_BAR_HOURS = 24

export function SleepChartPage() {
  const entries = useEntries({ max: 500 })
  const days = getNapsByDay(entries, 14)

  return (
    <div style={{ padding: 24, paddingBlockEnd: 80 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 24 }}>
        <Link to="/">חזרה</Link>
        <h1 style={{ margin: 0 }}>גרף שינה</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[...days].reverse().map((day) => {
          const hours = day.totalMinutes / 60
          const pct = Math.min(100, (hours / MAX_BAR_HOURS) * 100)
          return (
            <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 100, fontSize: '0.85rem' }}>{formatDayLabel(day.date)}</span>
              <div style={{ flex: 1, height: 24, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: '#4a7c59',
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ width: 80, fontSize: '0.85rem' }}>
                {day.napCount} תנומות, {hours.toFixed(1)} ש׳
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
