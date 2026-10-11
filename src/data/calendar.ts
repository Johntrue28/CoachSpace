// Fictional demo data. Will be replaced by a real data source in a later phase.
//
// Sessions are generated from each group's weekly slots (src/data/groups.ts), so the
// calendar always shows real dates around today. Dates are local "YYYY-MM-DD" strings;
// date arithmetic is done in UTC so daylight-saving changes never shift a day.
import type { Session, WeeklySlot } from "./types";
import { groupById, groups } from "./groups";

/**
 * Session topics per group, used in rotation session after session.
 * `from` is the date of a session that uses the first topic, chosen to match the
 * fictional chat messages (e.g. pick-and-roll defence on Thursday 15 October 2026).
 */
const topics: Record<string, { from: string; list: string[] }> = {
  g1: { from: "2026-10-12", list: ["Passing and first touch", "Small-sided games", "Dribbling and 1v1", "Shooting technique"] },
  g2: { from: "2026-10-15", list: ["Pick-and-roll defence", "Shooting drills", "Fast break", "Zone offence"] },
  g3: { from: "2026-10-07", list: ["Serve technique", "Serve and return", "Forehand consistency", "Volleys at the net"] },
  g4: { from: "2026-10-13", list: ["Core and mobility", "Balance and posture", "Full-body flow", "Hip and spine mobility"] },
};

/** Position of a group's session in its rotation, counted from the `from` session. */
function sessionNumber(slots: WeeklySlot[], date: string, slotIndex: number, from: string) {
  const fromSlot = Math.max(0, slots.findIndex((s) => s.weekday === weekdayOf(from)));
  return (weekIndex(date) - weekIndex(from)) * slots.length + slotIndex - fromSlot;
}

const DAY_MS = 86_400_000;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string | undefined): value is string {
  return Boolean(value && DATE_KEY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)));
}

/** Local date of a Date object, as "YYYY-MM-DD". */
export function toDateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayNumber(key: string) {
  return Date.parse(`${key}T00:00:00Z`) / DAY_MS;
}

function fromDayNumber(n: number) {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

export function addDays(key: string, days: number) {
  return fromDayNumber(dayNumber(key) + days);
}

/** 1 = Monday … 7 = Sunday. 1 January 1970 was a Thursday. */
export function weekdayOf(key: string) {
  return ((((dayNumber(key) + 3) % 7) + 7) % 7) + 1;
}

/** The Monday of the week that contains `key`. */
export function weekStart(key: string) {
  return addDays(key, 1 - weekdayOf(key));
}

function weekIndex(key: string) {
  return Math.floor((dayNumber(key) + 3) / 7);
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** All sessions on one date, earliest first. */
export function sessionsOn(date: string, groupId?: string): Session[] {
  const weekday = weekdayOf(date);
  return groups
    .filter((g) => !groupId || g.id === groupId)
    .flatMap((g) =>
      g.slots.flatMap((slot, i) => {
        if (slot.weekday !== weekday) return [];
        const rotation = topics[g.id] ?? { from: date, list: ["Training session"] };
        const n = sessionNumber(g.slots, date, i, rotation.from);
        const list = rotation.list;
        return [
          {
            id: `${g.id}-${date}`,
            groupId: g.id,
            title: list[((n % list.length) + list.length) % list.length],
            date,
            time: slot.time,
            endTime: addMinutes(slot.time, slot.durationMin),
            place: g.venue,
          },
        ];
      }),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
}

/** The seven days (Monday to Sunday) of the week starting on `start`, with their sessions. */
export function weekDays(start: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, sessions: sessionsOn(date) };
  });
}

/** Finds a session from its id (`<groupId>-<YYYY-MM-DD>`). */
export function sessionById(id: string) {
  const match = /^(.+)-(\d{4}-\d{2}-\d{2})$/.exec(id);
  if (!match || !groupById(match[1]) || !isDateKey(match[2])) return undefined;
  return sessionsOn(match[2], match[1]).find((s) => s.id === id);
}

/** Local start time of a session as a Date. */
export function sessionStart(s: Session) {
  const [y, mo, d] = s.date.split("-").map(Number);
  const [h, mi] = s.time.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi);
}

/** Sessions that have not started yet, from `now` onwards (looks ahead two weeks). */
export function upcomingSessions(now: Date, { limit = 4, groupId }: { limit?: number; groupId?: string } = {}) {
  const today = toDateKey(now);
  const result: Session[] = [];
  for (let i = 0; i < 14 && result.length < limit; i++) {
    for (const s of sessionsOn(addDays(today, i), groupId)) {
      if (sessionStart(s) >= now && result.length < limit) result.push(s);
    }
  }
  return result;
}
