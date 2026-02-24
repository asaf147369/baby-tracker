import { useLastByType } from "./entries";

const KEY_FOOD_HOURS = "baby-reminder-food-hours";
const KEY_POOP_HOURS = "baby-reminder-poop-hours";
const DEFAULT_FOOD_HOURS = 4;
const DEFAULT_POOP_HOURS = 24;

export function getReminderThresholds(): { foodHours: number; poopHours: number } {
  const food = localStorage.getItem(KEY_FOOD_HOURS);
  const poop = localStorage.getItem(KEY_POOP_HOURS);
  return {
    foodHours: food ? parseInt(food, 10) : DEFAULT_FOOD_HOURS,
    poopHours: poop ? parseInt(poop, 10) : DEFAULT_POOP_HOURS,
  };
}

export function setReminderThresholds(foodHours: number, poopHours: number): void {
  localStorage.setItem(KEY_FOOD_HOURS, String(foodHours));
  localStorage.setItem(KEY_POOP_HOURS, String(poopHours));
}

export interface ReminderAlerts {
  foodAlert: boolean;
  poopAlert: boolean;
  foodHoursAgo: number | null;
  poopHoursAgo: number | null;
}

export function useReminderAlerts(): ReminderAlerts {
  const last = useLastByType();
  const { foodHours, poopHours } = getReminderThresholds();
  const now = Date.now();
  const foodMs = last.food ? now - last.food.getTime() : null;
  const poopMs = last.poop ? now - last.poop.getTime() : null;
  const foodHoursAgo = foodMs != null ? foodMs / (60 * 60 * 1000) : null;
  const poopHoursAgo = poopMs != null ? poopMs / (60 * 60 * 1000) : null;
  return {
    foodAlert: foodHoursAgo != null && foodHoursAgo >= foodHours,
    poopAlert: poopHoursAgo != null && poopHoursAgo >= poopHours,
    foodHoursAgo: foodHoursAgo != null ? Math.round(foodHoursAgo * 10) / 10 : null,
    poopHoursAgo: poopHoursAgo != null ? Math.round(poopHoursAgo * 10) / 10 : null,
  };
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return Promise.resolve("denied");
  return Notification.requestPermission();
}

export function sendReminderNotification(body: string): void {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("מעקב על אלה", { body });
  }
}
