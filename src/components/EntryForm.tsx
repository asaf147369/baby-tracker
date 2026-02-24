import { useState } from "react";
import { addEntry } from "../lib/entries";
import type { EntryType, PoopAmount } from "../types/entry";

const POOP_OPTIONS: PoopAmount[] = ["small", "medium", "large"];
const POOP_LABELS: Record<PoopAmount, string> = {
  small: "קטן",
  medium: "בינוני",
  large: "גדול",
};

type Props = { type: EntryType; onDone: () => void };

function toDatetimeLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
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
      if (type === "sleep_start" || type === "sleep_end") value = undefined;
      const timestamp = useNow ? undefined : new Date(pickedDateTime);
      await addEntry(type, value, timestamp);
      onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="entry-form-card">
      {type === "food" && (
        <input
          type="text"
          placeholder="כמות (למשל 120 מ״ל)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="entry-form-input"
        />
      )}
      {type === "poop" && (
        <div className="entry-form-group">
          {POOP_OPTIONS.map((opt) => (
            <label key={opt} className="entry-form-label">
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
      {type === "pee" && <p className="entry-form-group">נרשם פיפי</p>}
      {(type === "sleep_start" || type === "sleep_end") && (
        <p className="entry-form-group">
          {type === "sleep_start" ? "נרדמה" : "התעוררה"}
        </p>
      )}
      <div className="entry-form-group">
        <p className="entry-form-time-label">מתי קרה?</p>
        <label className="entry-form-radio">
          <input
            type="radio"
            checked={useNow}
            onChange={() => setUseNow(true)}
          />
          <span>קרה עכשיו</span>
        </label>
        <label className="entry-form-radio">
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
            className="entry-form-input entry-form-datetime"
          />
        )}
      </div>
      <div className="entry-form-actions">
        <button type="submit" disabled={loading}>
          שמור
        </button>
        <button type="button" onClick={onDone}>
          ביטול
        </button>
      </div>
    </form>
  );
}
