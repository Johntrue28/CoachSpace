// Shared date formatting (chat, announcements), in the viewer's time zone (24-hour clock, British English).

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });

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
  if (ago === 1) return "Yesterday";
  return shortDate.format(d);
}

/** Day separator in a conversation: "Today", "Yesterday" or "Friday 9 October". */
export function formatDay(iso: string, now = new Date()) {
  const d = new Date(iso);
  const ago = daysAgo(d, now);
  if (ago === 0) return "Today";
  if (ago === 1) return "Yesterday";
  return longDate.format(d);
}

export function sameDay(a: string, b: string) {
  return dayKey(new Date(a)) === dayKey(new Date(b));
}

/** "Today, 13:00", "Yesterday, 17:30" or "9 Oct, 10:15". */
export function formatPosted(iso: string, now = new Date()) {
  const d = new Date(iso);
  const ago = daysAgo(d, now);
  const day = ago === 0 ? "Today" : ago === 1 ? "Yesterday" : shortDate.format(d);
  return `${day}, ${time.format(d)}`;
}

// Calendar dates are "YYYY-MM-DD" keys. They are formatted in UTC so the day never shifts.
const keyDate = (key: string) => new Date(`${key}T00:00:00Z`);
const dayLong = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });
const dayFull = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const weekdayName = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "Monday 13 Oct" */
export function formatDateKey(key: string) {
  return dayLong.format(keyDate(key));
}

/** "Monday 13 October 2026" */
export function formatDateKeyFull(key: string) {
  return dayFull.format(keyDate(key));
}

/** "13 – 19 Oct 2026" for a Monday-to-Sunday week. */
export function formatWeekRange(start: string, end: string) {
  return `${dayMonth.format(keyDate(start))} – ${dayMonthYear.format(keyDate(end))}`;
}

/** "Today", "Tomorrow", a weekday name within the next week, otherwise "13 Oct". */
export function relativeDayLabel(key: string, todayKey: string) {
  const diff = (Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return weekdayName.format(keyDate(key));
  return dayMonth.format(keyDate(key));
}

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** "October 2026" for a "YYYY-MM" month. */
export function formatMonth(month: string) {
  return monthYear.format(new Date(`${month}-01T00:00:00Z`));
}

const weekdayShortName = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

/** A register's day in the attendance log (D-076): "Thu 12 Nov". */
export function formatLogDay(key: string) {
  return `${weekdayShortName.format(keyDate(key))} ${dayMonth.format(keyDate(key))}`;
}

/** A short day label for tight spaces (D-071): "Today", "Tomorrow", otherwise "Tue 10". */
export function shortDayLabel(key: string, todayKey: string) {
  const diff = (Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${weekdayShortName.format(keyDate(key))} ${Number(key.slice(8))}`;
}

/** Agenda day heading (D-071): "Today · 6 Nov", "Tomorrow · 7 Nov", otherwise "Monday 9 Nov". */
export function agendaDayLabel(key: string, todayKey: string) {
  const diff = (Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000;
  if (diff === 0 || diff === 1) return `${diff === 0 ? "Today" : "Tomorrow"} · ${dayMonth.format(keyDate(key))}`;
  return formatDateKey(key);
}
