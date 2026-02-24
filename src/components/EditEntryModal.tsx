import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { updateEntry } from "../lib/entries";
import type { Entry, EntryType } from "../types/entry";
import { Button } from "./Button";

function toDatetimeLocal(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

type Props = { entry: Entry; onClose: () => void; onSaved: () => void };

const HAS_AMOUNT: EntryType[] = ["food", "poop", "medicine"];

export function EditEntryModal({ entry, onClose, onSaved }: Props) {
  const [timestamp, setTimestamp] = useState(() =>
    toDatetimeLocal(entry.timestamp)
  );
  const [amount, setAmount] = useState(entry.amount ?? "");
  const [saving, setSaving] = useState(false);

  const canEditAmount = HAS_AMOUNT.includes(entry.type);

  useEffect(() => {
    setTimestamp(toDatetimeLocal(entry.timestamp));
    setAmount(entry.amount ?? "");
  }, [entry.id, entry.timestamp, entry.amount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEntry(entry.id, {
        timestamp: parseISO(timestamp),
        ...(canEditAmount && { amount: amount.trim() || undefined }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-entry-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-entry-title" className="mb-4 text-lg font-semibold text-white">
          עריכת רשומה
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-muted">תאריך ושעה</label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent [color-scheme:dark]"
            />
          </div>
          {canEditAmount && (
            <div className="mb-4">
              <label className="mb-1.5 block text-sm text-muted">
                {entry.type === "food" ? "כמות" : entry.type === "medicine" ? "פרטים" : "גודל"}
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={
                  entry.type === "food"
                    ? "למשל 120 מ״ל"
                    : entry.type === "poop"
                      ? "קטן / בינוני / גדול"
                      : ""
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "..." : "שמור"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
