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
