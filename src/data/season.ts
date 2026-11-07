// "My season" for a player (D-074): attendance rate, the current streak of sessions attended and the
// coach's claps (like Strava's kudos). Pure functions, no React (unit tested). Claps are seeded for the
// fictional members and the coach's claps in this browser are added on top; nobody is notified (demo).
import type { AttendanceRecord } from "./types";

export type Season = { attended: number; total: number; rate: number | null; streak: number };

/** A session's date from its id ("g1-2026-10-12" → "2026-10-12"); one-off ids have none. */
function dateOf(sessionId: string) {
  return /-(\d{4}-\d{2}-\d{2})$/.exec(sessionId)?.[1] ?? "";
}

/**
 * The player's season from the saved registers: sessions where they had a mark, how many present, the rate
 * (null with no register yet) and the streak of "present" counted back from their latest register.
 */
export function seasonOf(participantId: string, records: AttendanceRecord[], dateFor: (sessionId: string) => string = dateOf): Season {
  const mine = records
    .filter((r) => r.marks[participantId] !== undefined)
    .map((r) => ({ date: dateFor(r.sessionId) || r.savedAt.slice(0, 10), present: r.marks[participantId] === "present" }))
    .sort((a, b) => b.date.localeCompare(a.date));
  const attended = mine.filter((m) => m.present).length;
  let streak = 0;
  for (const m of mine) {
    if (!m.present) break;
    streak++;
  }
  return { attended, total: mine.length, rate: mine.length ? Math.round((attended / mine.length) * 100) : null, streak };
}

/** Claps the coach gave a fictional member before the visitor arrived: a stable number from 2 to 11. */
export function seededClaps(participantId: string) {
  let h = 2166136261;
  for (const c of `claps:${participantId}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return 2 + ((h >>> 0) % 10);
}

/** Claps given in this browser, read back safely: participant id → a whole number ≥ 0. */
export function normaliseClaps(value: unknown): Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, n]) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n < 10_000),
  ) as Record<string, number>;
}
