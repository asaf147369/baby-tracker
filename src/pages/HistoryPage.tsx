import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useEntries, deleteEntry } from "../lib/entries";
import type { Entry, EntryType } from "../types/entry";
import { Button } from "../components/Button";
import { EditEntryModal } from "../components/EditEntryModal";

const typeLabel: Record<string, string> = {
  food: "אוכל",
  poop: "קקי",
  pee: "פיפי",
  sleep_start: "נרדמה",
  sleep_end: "התעוררה",
  medicine: "תרופה",
};

type FilterType = EntryType | "all" | "sleep" | "sleep_food" | "food_poop";

function getQueryType(filter: FilterType): EntryType | EntryType[] | undefined {
  if (filter === "all") return undefined;
  if (filter === "sleep") return ["sleep_start", "sleep_end"];
  if (filter === "sleep_food") return ["sleep_start", "sleep_end", "food"];
  if (filter === "food_poop") return ["food", "poop"];
  return filter;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "sleep", label: "שינה" },
  { value: "sleep_food", label: "שינה + אוכל" },
  { value: "food", label: "אוכל" },
  { value: "food_poop", label: "אוכל + קקי" },
  { value: "poop", label: "קקי" },
  { value: "pee", label: "פיפי" },
  { value: "medicine", label: "תרופות" },
];

const row =
  "flex justify-between items-center gap-3 border-b border-border py-3 last:border-b-0";

export function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const entries = useEntries({ type: getQueryType(filter) });

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteEntry(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[480px] pb-[100px] ps-5 pe-5 pt-5">
      <header className="mb-7 flex items-center justify-between">
        <Link
          to="/"
          search={{ tab: undefined }}
          className="text-accent underline-offset-2 hover:underline"
        >
          חזרה
        </Link>
        <h1 className="m-0 text-xl font-semibold">היסטוריה</h1>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <Button
            key={value}
            variant="filter"
            active={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <ul className="list-none p-0 m-0">
        {entries.map((e) => (
          <li key={e.id} className={row}>
            <span>
              {typeLabel[e.type] ?? e.type}
              {e.amount ? ` – ${e.amount}` : ""}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sm text-muted">
                {e.timestamp.toLocaleDateString("he-IL")}{" "}
                {e.timestamp.toLocaleTimeString("he-IL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <Button
                variant="ghost"
                onClick={() => setEditingEntry(e)}
                aria-label="ערוך"
              >
                ערוך
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(e.id)}
                disabled={deletingId === e.id}
                aria-label="מחק"
              >
                {deletingId === e.id ? "..." : "מחק"}
              </Button>
            </span>
          </li>
        ))}
      </ul>

      {editingEntry && (
        <EditEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}
