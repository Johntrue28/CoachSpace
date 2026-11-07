// Shared date formatting, in the viewer's time zone and the interface language (24-hour clock; British English
// by default, Spanish when chosen in Settings, D-083).
import { intlLocale, t } from "@/i18n";

const cache = new Map<string, Intl.DateTimeFormat>();
/** A date formatter for the active language, made once per language and options. */
function fmt(options: Intl.DateTimeFormatOptions) {
  const key = `${intlLocale()}|${JSON.stringify(options)}`;
  let f = cache.get(key);
  if (!f) cache.set(key, (f = new Intl.DateTimeFormat(intlLocale(), options)));
  return f;
}
const time = { format: (d: Date) => fmt({ hour: "2-digit", minute: "2-digit", hour12: false }).format(d) };
const shortDate = { format: (d: Date) => fmt({ day: "numeric", month: "short" }).format(d) };
const longDate = { format: (d: Date) => fmt({ weekday: "long", day: "numeric", month: "long" }).format(d) };

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function daysAgo(d: Date, now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(d) === dayKey(now)) return 0;
  if (dayKey(d) === dayKey(yesterday)) return 1;
  return null;
}

/** "18:05" */
export function formatTime(iso: string) {
  return time.format(new Date(iso));
}

/** Time in the conversation list: "18:05" today, "Yesterday", otherwise "9 Oct". */
export function formatListStamp(iso: string, now = new Date()) {
  const d = new Date(iso);
  const ago = daysAgo(d, now);
  if (ago === 0) return time.format(d);
  if (ago === 1) return t("common.yesterday");
  return shortDate.format(d);
}

/** Day separator in a conversation: "Today", "Yesterday" or "Friday 9 October". */
export function formatDay(iso: string, now = new Date()) {
  const d = new Date(iso);
  const ago = daysAgo(d, now);
  if (ago === 0) return t("common.today");
  if (ago === 1) return t("common.yesterday");
  return longDate.format(d);
}

export function sameDay(a: string, b: string) {
  return dayKey(new Date(a)) === dayKey(new Date(b));
}

/** "Today, 13:00", "Yesterday, 17:30" or "9 Oct, 10:15". */
export function formatPosted(iso: string, now = new Date()) {
  const d = new Date(iso);
  const ago = daysAgo(d, now);
  const day = ago === 0 ? t("common.today") : ago === 1 ? t("common.yesterday") : shortDate.format(d);
  return `${day}, ${time.format(d)}`;
}

// Calendar dates are "YYYY-MM-DD" keys. They are formatted in UTC so the day never shifts.
const keyDate = (key: string) => new Date(`${key}T00:00:00Z`);
const dayLong = { format: (d: Date) => fmt({ weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }).format(d) };
const dayFull = { format: (d: Date) => fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d) };
const weekdayName = { format: (d: Date) => fmt({ weekday: "long", timeZone: "UTC" }).format(d) };
const dayMonth = { format: (d: Date) => fmt({ day: "numeric", month: "short", timeZone: "UTC" }).format(d) };

/** "Monday 13 Oct" */
export function formatDateKey(key: string) {
  return dayLong.format(keyDate(key));
}

/** "Monday 13 October 2026" */
export function formatDateKeyFull(key: string) {
  return dayFull.format(keyDate(key));
}

/** "Today", "Tomorrow", a weekday name within the next week, otherwise "13 Oct". */
export function relativeDayLabel(key: string, todayKey: string) {
  const diff = (Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000;
  if (diff === 0) return t("common.today");
  if (diff === 1) return t("common.tomorrow");
  if (diff > 1 && diff < 7) return weekdayName.format(keyDate(key));
  return dayMonth.format(keyDate(key));
}

const monthYear = { format: (d: Date) => fmt({ month: "long", year: "numeric", timeZone: "UTC" }).format(d) };

/** "October 2026" for a "YYYY-MM" month. */
export function formatMonth(month: string) {
  return monthYear.format(new Date(`${month}-01T00:00:00Z`));
}

const weekdayShortName = { format: (d: Date) => fmt({ weekday: "short", timeZone: "UTC" }).format(d) };

/** A register's day in the attendance log (D-076): "Thu 12 Nov". */
export function formatLogDay(key: string) {
  return `${weekdayShortName.format(keyDate(key))} ${dayMonth.format(keyDate(key))}`;
}

/** A short day label for tight spaces (D-071): "Today", "Tomorrow", otherwise "Tue 10". */
export function shortDayLabel(key: string, todayKey: string) {
  const diff = (Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000;
  if (diff === 0) return t("common.today");
  if (diff === 1) return t("common.tomorrow");
  return `${weekdayShortName.format(keyDate(key))} ${Number(key.slice(8))}`;
}

/** Agenda day heading (D-071): "Today · 6 Nov", "Tomorrow · 7 Nov", otherwise "Monday 9 Nov". */
export function agendaDayLabel(key: string, todayKey: string) {
  const diff = (Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000;
  if (diff === 0 || diff === 1) return `${diff === 0 ? t("common.today") : t("common.tomorrow")} · ${dayMonth.format(keyDate(key))}`;
  return formatDateKey(key);
}
