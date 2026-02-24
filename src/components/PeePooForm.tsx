import { useState } from "react";
import { format, parseISO } from "date-fns";
import { addEntry } from "../lib/entries";
import type { PoopAmount } from "../types/entry";
import { Button } from "./Button";

const POOP_OPTIONS: PoopAmount[] = ["small", "medium", "large"];
const POOP_LABELS: Record<PoopAmount, string> = {
  small: "קטן",
  medium: "בינוני",
  large: "גדול",
};

function toDatetimeLocal(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

type Props = { onDone: () => void };

export function PeePooForm({ onDone }: Props) {
  const [poopAmount, setPoopAmount] = useState<PoopAmount>("medium");
  const [loading, setLoading] = useState(false);
  const [useNow, setUseNow] = useState(true);
  const [pickedDateTime, setPickedDateTime] = useState(() =>
    toDatetimeLocal(new Date())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const timestamp = useNow ? undefined : parseISO(pickedDateTime);
      await addEntry("pee", "logged", timestamp);
      await addEntry("poop", poopAmount, timestamp);
      onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-border bg-surface pb-3 ps-6 pe-5 pt-4"
    >
      <div className="mb-3">
        <p className="mb-1.5 font-semibold text-white">גודל קקי</p>
        <div className="flex flex-wrap gap-2">
          {POOP_OPTIONS.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 text-white"
            >
              <input
                type="radio"
                name="poop"
                value={opt}
                checked={poopAmount === opt}
                onChange={() => setPoopAmount(opt)}
              />
              {POOP_LABELS[opt]}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <p className="mb-1.5 font-semibold text-white">מתי קרה?</p>
        <label className="mb-1.5 flex cursor-pointer items-center gap-2 text-white">
          <input type="radio" checked={useNow} onChange={() => setUseNow(true)} />
          <span>קרה עכשיו</span>
        </label>
        <label className="mb-1.5 flex cursor-pointer items-center gap-2 text-white">
          <input
            type="radio"
            checked={!useNow}
            onChange={() => setUseNow(false)}
          />
          <span>קרה קודם</span>
        </label>
        {!useNow && (
          <input
            type="datetime-local"
            value={pickedDateTime}
            onChange={(e) => setPickedDateTime(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent [color-scheme:dark]"
          />
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "..." : "שמור"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
