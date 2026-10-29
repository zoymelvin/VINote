import { format, startOfWeek } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function uid() {
  return crypto.randomUUID();
}

export function now() {
  return Date.now();
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function groupHistoryDate(ts: number | null, nowMs = Date.now()) {
  if (!ts) return "older";
  const date = new Date(ts);
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  if (date >= today) return "today";
  if (date >= yesterday && date < today) return "yesterday";
  if (date >= weekStart) return "week";
  return "older";
}

export function formatDate(ts: number, locale = "id") {
  return format(new Date(ts), "d MMM yyyy HH:mm", {
    locale: locale === "id" ? idLocale : undefined,
  });
}

export function stripHtml(text: string) {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
