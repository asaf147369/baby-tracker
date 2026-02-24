import { Link } from "@tanstack/react-router";
import { useEntries } from "../lib/entries";
import { getNapsByDay, formatDayLabel } from "../lib/sleepChart";

const MAX_BAR_HOURS = 24;

export function SleepChartPage() {
  const entries = useEntries({ max: 500 });
  const days = getNapsByDay(entries, 14);

  return (
    <div className="pb-20 ps-6 pe-6 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" search={{ tab: undefined }}>חזרה</Link>
        <h1 className="m-0">גרף שינה</h1>
      </header>

      <div className="flex flex-col gap-5">
        {[...days].reverse().map((day) => {
          const hours = day.totalMinutes / 60;
          const pct = Math.min(100, (hours / MAX_BAR_HOURS) * 100);
          return (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-[100px] text-[0.85rem]">{formatDayLabel(day.date)}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-chart-track">
                <div
                  className="h-full rounded bg-chart-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[0.85rem]">
                {day.napCount} תנומות, {hours.toFixed(1)} ש׳
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
