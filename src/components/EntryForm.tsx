import { useState } from "react";
import { format, parseISO } from "date-fns";
import { addEntry } from "../lib/entries";
import type { EntryType, PoopAmount } from "../types/entry";
import { Button } from "./Button";

const POOP_OPTIONS: PoopAmount[] = ["small", "medium", "large"];
const POOP_LABELS: Record<PoopAmount, string> = {
  small: "קטן",
  medium: "בינוני",
  large: "גדול",
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

type Props = { type: EntryType; onDone: () => void };

function toDatetimeLocal(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function EntryForm({ type, onDone }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [useNow, setUseNow] = useState(true);
  const [pickedDateTime, setPickedDateTime] = useState(() =>
    toDatetimeLocal(new Date()),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let value: string | undefined = amount.trim() || undefined;
      if (type === "pee") value = "logged";
      if (type === "sleep_start" || type === "sleep_end" || type === "shower") value = undefined;
      const timestamp = useNow ? undefined : parseISO(pickedDateTime);
      await addEntry(type, value, timestamp);
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
      {type === "food" && (
        <input
          type="text"
          placeholder="כמות (למשל 120 מ״ל)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${inputClass} mb-2`}
        />
      )}
      {type === "poop" && (
        <div className="mb-3">
          {POOP_OPTIONS.map((opt) => (
            <label key={opt} className="me-4">
              <input
                type="radio"
                name="poop"
                value={opt}
                checked={amount === opt}
                onChange={() => setAmount(opt)}
              />{" "}
              {POOP_LABELS[opt]}
            </label>
          ))}
        </div>
      )}
      {type === "pee" && <p className="mb-3">נרשם פיפי</p>}
      {(type === "sleep_start" || type === "sleep_end") && (
        <p className="mb-3">{type === "sleep_start" ? "נרדמה" : "התעוררה"}</p>
      )}
      {type === "shower" && <p className="mb-3">מקלחת</p>}
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
            className={`${inputClass} mt-2 [color-scheme:dark]`}
          />
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="submit" disabled={loading}>
          שמור
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
