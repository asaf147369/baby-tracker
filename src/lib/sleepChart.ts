import { format, subDays, getTime } from "date-fns";
import { he } from "date-fns/locale";
import type { Entry } from "../types/entry";

function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export interface DaySleep {
  date: string;
  totalMinutes: number;
  napCount: number;
}

export function getNapsByDay(entries: Entry[], days: number = 14): DaySleep[] {
  const sleepEntries = entries
    .filter((e) => e.type === "sleep_start" || e.type === "sleep_end")
    .sort((a, b) => getTime(a.timestamp) - getTime(b.timestamp));

  const byDay: Record<string, { minutes: number; count: number }> = {};
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = subDays(today, i);
    const key = toDateKey(d);
    byDay[key] = { minutes: 0, count: 0 };
  }

  for (let i = 0; i < sleepEntries.length - 1; i++) {
    if (
      sleepEntries[i].type === "sleep_start" &&
      sleepEntries[i + 1].type === "sleep_end"
    ) {
      const start = sleepEntries[i].timestamp;
      const end = sleepEntries[i + 1].timestamp;
      const key = toDateKey(start);
      if (byDay[key]) {
        const mins = Math.round((getTime(end) - getTime(start)) / 60000);
        byDay[key].minutes += mins;
        byDay[key].count += 1;
      }
    }
  }

  const keys = Object.keys(byDay).sort();
  return keys.map((date) => ({
    date,
    totalMinutes: byDay[date].minutes,
    napCount: byDay[date].count,
  }));
}

export function formatDayLabel(dateStr: string): string {
  return format(new Date(dateStr + "T12:00:00"), "EEE d MMM", { locale: he });
}
