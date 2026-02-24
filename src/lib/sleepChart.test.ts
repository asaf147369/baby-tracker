import { describe, it, expect } from "vitest";
import { getNapsByDay, formatDayLabel } from "./sleepChart";
import type { Entry } from "@/types/entry";

function entry(
  type: "sleep_start" | "sleep_end",
  date: Date,
  id = "1"
): Entry {
  return {
    id,
    type,
    timestamp: date,
    userId: "u1",
  };
}

describe("getNapsByDay", () => {
  it("returns day keys with zero minutes when no entries", () => {
    const result = getNapsByDay([], 2);
    expect(result).toHaveLength(2);
    expect(result.every((d) => d.totalMinutes === 0 && d.napCount === 0)).toBe(
      true
    );
  });

  it("sums sleep duration for matching start/end pairs", () => {
    const start = new Date("2025-02-24T10:00:00");
    const end = new Date("2025-02-24T11:30:00");
    const entries: Entry[] = [
      entry("sleep_start", start, "1"),
      entry("sleep_end", end, "2"),
    ];
    const result = getNapsByDay(entries, 14);
    const day = result.find((d) => d.date === "2025-02-24");
    expect(day).toBeDefined();
    expect(day?.totalMinutes).toBe(90);
    expect(day?.napCount).toBe(1);
  });
});

describe("formatDayLabel", () => {
  it("formats date string to Hebrew locale", () => {
    const out = formatDayLabel("2025-02-24");
    expect(out).toMatch(/\d+/);
    expect(out.length).toBeGreaterThan(0);
  });
});
