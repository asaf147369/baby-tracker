import { useState, useEffect, useRef } from "react";
import { useSearch } from "@tanstack/react-router";
import { format, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { he } from "date-fns/locale";
import {
  useEntries,
  useLastByType,
  useSleepSummary,
  useMedicineGivenToday,
  useTodaySummary,
  addEntry,
  deleteEntry,
} from "../lib/entries";
import {
  useReminderAlerts,
  getReminderThresholds,
  setReminderThresholds,
  requestNotificationPermission,
  sendReminderNotification,
} from "../lib/reminders";
import { EntryForm } from "../components/EntryForm";
import { Button } from "../components/Button";
import { PeePooForm } from "../components/PeePooForm";
import type { Entry } from "../types/entry";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMins = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);
  if (diffMins < 1) return "עכשיו";
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  return `לפני ${diffDays} ימים`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} דקות`;
  if (m === 0) return `${h} שעות`;
  return `${h} שעות ו־${m} דקות`;
}

const typeLabel: Record<string, string> = {
  food: "אוכל",
  poop: "קקי",
  pee: "פיפי",
  sleep_start: "נרדמה",
  sleep_end: "התעוררה",
  medicine: "תרופה",
  shower: "מקלחת",
};

export function HomePage() {
  const entries = useEntries();
  const last = useLastByType();
  const sleep = useSleepSummary();
  const vitaminD = useMedicineGivenToday();
  const today = useTodaySummary();
  const reminders = useReminderAlerts();
  const [showForm, setShowForm] = useState<string | null>(null);
  const [medicineSaving, setMedicineSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const search = useSearch({ strict: false }) as { tab?: string };
  const tab = search?.tab === "info" ? "info" : "add";
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [reminderFoodHours, setReminderFoodHours] = useState(
    () => getReminderThresholds().foodHours
  );
  const [reminderPoopHours, setReminderPoopHours] = useState(
    () => getReminderThresholds().poopHours
  );

  useEffect(() => {
    if (showReminderSettings) {
      const t = getReminderThresholds();
      setReminderFoodHours(t.foodHours);
      setReminderPoopHours(t.poopHours);
    }
  }, [showReminderSettings]);
  const notificationSentRef = useRef(false);

  useEffect(() => {
    if (!reminders.foodAlert && !reminders.poopAlert) {
      notificationSentRef.current = false;
      return;
    }
    if (notificationSentRef.current) return;
    const parts: string[] = [];
    if (reminders.foodAlert && reminders.foodHoursAgo != null)
      parts.push(`לא אכלה מעל ${reminders.foodHoursAgo} שעות`);
    if (reminders.poopAlert && reminders.poopHoursAgo != null)
      parts.push(`לא הייתה קקי מעל ${reminders.poopHoursAgo} שעות`);
    if (parts.length) {
      sendReminderNotification(parts.join(". "));
      notificationSentRef.current = true;
    }
  }, [
    reminders.foodAlert,
    reminders.poopAlert,
    reminders.foodHoursAgo,
    reminders.poopHoursAgo,
  ]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteEntry(id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleVitaminD() {
    setMedicineSaving(true);
    try {
      await addEntry("medicine", "ויטמין D");
    } finally {
      setMedicineSaving(false);
    }
  }

  function saveReminderThresholds() {
    setReminderThresholds(reminderFoodHours, reminderPoopHours);
    setShowReminderSettings(false);
  }

  const formType = showForm as
    | "food"
    | "poop"
    | "pee"
    | "sleep_start"
    | "sleep_end"
    | "pee_poop"
    | "shower"
    | null;

  const card = "mb-5 rounded-xl border border-border bg-surface pb-3 ps-6 pe-5 pt-4";
  const cardTitle = "mb-2 text-[1.1rem] font-semibold text-white";
  const row =
    "flex justify-between items-center gap-3 border-b border-border py-3 last:border-b-0";

  return (
    <div className="mx-auto max-w-[480px] pb-[100px] ps-5 pe-5 pt-5">
      <header className="mb-5 flex items-center justify-between gap-4">
        <h1 className="m-0 shrink-0 text-xl font-semibold">מעקב על אלה</h1>
        <Button variant="ghost" onClick={() => signOut(auth)}>
          יציאה
        </Button>
      </header>

      {tab === "add" && (
        <>
          {!vitaminD.given && (
            <section className={card}>
              <h2 className={cardTitle}>ויטמין D</h2>
              <p className="mb-2 text-muted">עדיין לא ניתנה היום</p>
              <Button onClick={handleVitaminD} disabled={medicineSaving}>
                {medicineSaving ? "..." : "נתתי"}
              </Button>
            </section>
          )}

          <section className={card}>
            <h2 className={cardTitle}>שינה</h2>
            <p className="mb-2 text-sm text-muted">בחר מתי קרה (אפשר עכשיו או קודם)</p>
            <Button
              onClick={() =>
                setShowForm(
                  sleep.isSleepingNow
                    ? showForm === "sleep_end"
                      ? null
                      : "sleep_end"
                    : showForm === "sleep_start"
                      ? null
                      : "sleep_start"
                )
              }
            >
              {sleep.isSleepingNow ? "התעוררה" : "נרדמה"}
            </Button>
            {(formType === "sleep_start" || formType === "sleep_end") && (
              <EntryForm type={formType} onDone={() => setShowForm(null)} />
            )}
          </section>

          <section className={card}>
            <h2 className={cardTitle}>אוכל, קקי, פיפי, מקלחת</h2>
            <div className="flex flex-wrap gap-2">
              {(["food", "poop", "pee", "shower"] as const).map((type) => (
                <Button
                  key={type}
                  onClick={() => setShowForm(showForm === type ? null : type)}
                >
                  {typeLabel[type]}
                </Button>
              ))}
              <Button
                onClick={() =>
                  setShowForm(showForm === "pee_poop" ? null : "pee_poop")
                }
              >
                פיפי+קקי
              </Button>
            </div>
            {formType &&
              formType !== "sleep_start" &&
              formType !== "sleep_end" &&
              formType !== "pee_poop" && (
                <EntryForm type={formType} onDone={() => setShowForm(null)} />
              )}
            {formType === "pee_poop" && (
              <PeePooForm onDone={() => setShowForm(null)} />
            )}
          </section>

          <section className={card}>
            <h2 className={cardTitle}>אחרונות</h2>
            <ul className="list-none p-0 m-0">
              {entries.slice(0, 5).map((e: Entry) => (
                <li key={e.id} className={row}>
                  <span>
                    {typeLabel[e.type] ?? e.type}
                    {e.amount ? ` – ${e.amount}` : ""}
                  </span>
                  <span className="text-sm text-muted">
                    {format(e.timestamp, "HH:mm", { locale: he })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {tab === "info" && (
        <>
              {vitaminD.given && (
            <section className={card}>
              <h2 className={cardTitle}>ויטמין D</h2>
              <p className="m-0">
                ניתנה היום{" "}
                {vitaminD.time ? format(vitaminD.time, "HH:mm", { locale: he }) : ""}
              </p>
            </section>
          )}

          {(reminders.foodAlert || reminders.poopAlert) && (
            <section className="mb-5 rounded-xl border border-[#6a3a3a] bg-[rgba(120,50,50,0.3)] pb-3 ps-6 pe-5 pt-4">
              <h2 className={cardTitle}>תזכורת</h2>
              {reminders.foodAlert && reminders.foodHoursAgo != null && (
                <p className="m-0">לא אכלה מעל {reminders.foodHoursAgo} שעות</p>
              )}
              {reminders.poopAlert && reminders.poopHoursAgo != null && (
                <p className={reminders.foodAlert ? "mt-2 m-0" : "m-0"}>
                  לא הייתה קקי מעל {reminders.poopHoursAgo} שעות
                </p>
              )}
            </section>
          )}

          <section className={card}>
            <h2 className={cardTitle}>היום</h2>
            <p className="m-0">
              {today.feeds} האכלות, {today.naps} תנומות, סה״כ שינה{" "}
              {formatDuration(today.totalSleepMinutes)}
            </p>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>אחרון</h2>
            <ul className="list-none p-0 m-0">
              <li className="py-1">קקי: {last.poop ? formatTimeAgo(last.poop) : "—"}</li>
              <li className="py-1">אוכל: {last.food ? formatTimeAgo(last.food) : "—"}</li>
              <li className="py-1">פיפי: {last.pee ? formatTimeAgo(last.pee) : "—"}</li>
            </ul>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>שינה</h2>
            {sleep.isSleepingNow && sleep.sleepStart && (
              <p className="m-0">
                ישנה עכשיו מ־
                {format(sleep.sleepStart, "HH:mm", { locale: he })}
              </p>
            )}
            {sleep.lastNapDurationMinutes != null && !sleep.isSleepingNow && (
              <p className="m-0">
                שינה אחרונה: {formatDuration(sleep.lastNapDurationMinutes)}
              </p>
            )}
          </section>

          <section className={card}>
            <div
              className={`flex flex-wrap items-center justify-between gap-3 ${showReminderSettings ? "mb-2" : ""}`}
            >
              <h2 className="m-0 text-[1.1rem] font-semibold text-white">תזכורות</h2>
              <span className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowReminderSettings(!showReminderSettings)}
                >
                  הגדרות
                </Button>
                <Button variant="ghost" onClick={() => requestNotificationPermission()}>
                  התראות בדפדפן
                </Button>
              </span>
            </div>
            {showReminderSettings && (
              <div className="mt-3">
                <label className="mb-2 block">
                  התראות אם לא אכלה מעל
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={reminderFoodHours}
                    onChange={(e) => setReminderFoodHours(Number(e.target.value))}
                    className="ms-2 w-12"
                  />
                  שעות
                </label>
                <label className="mb-3 block">
                  התראות אם לא הייתה קקי מעל
                  <input
                    type="number"
                    min={1}
                    max={72}
                    value={reminderPoopHours}
                    onChange={(e) => setReminderPoopHours(Number(e.target.value))}
                    className="ms-2 w-12"
                  />
                  שעות
                </label>
                <Button onClick={saveReminderThresholds}>שמור</Button>
              </div>
            )}
          </section>

          <section className={card}>
            <h2 className={cardTitle}>רשומה אחרונה</h2>
            <ul className="list-none p-0 m-0">
              {entries.slice(0, 12).map((e: Entry) => (
                <li key={e.id} className={row}>
                  <span>
                    {typeLabel[e.type] ?? e.type}
                    {e.amount ? ` – ${e.amount}` : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm text-muted">
                      {format(e.timestamp, "d.M.yyyy", { locale: he })}{" "}
                      {format(e.timestamp, "HH:mm", { locale: he })}
                    </span>
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
          </section>
        </>
      )}
    </div>
  );
}
