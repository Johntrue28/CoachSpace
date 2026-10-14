// Seed dates (audit R-03). Pure functions, no React.
//
// The fictional messages, announcements, assignments, plans and notes of every scenario were
// written for one week: the week of Monday 12 October 2026, the "seed week". Sessions and
// attendance are already generated around today (calendar.ts, attendance.ts), so without this
// module the seeded content would grow older every week while the calendar stays current.
//
// In the browser, `datedScenario` moves every seeded date forward by whole weeks, to the week the
// visitor is in. Whole weeks keep the weekdays, so "Saturday we'll play doubles" still matches the
// calendar, and the content keeps believable ages: a few days old, never all from today. The
// server and the first render use the unshifted seed; pages show seeded dates only once the
// stores are ready in the browser, so the two never disagree (no hydration mismatch).

import { addDays, toDateKey, weekStart } from "./calendar";
import type { ScenarioData } from "./scenarios/types";

/** Monday of the week the seed content was written for. */
export const SEED_WEEK = "2026-10-12";

const WEEK_MS = 7 * 86_400_000;
const SESSION_ID = /^(.+)-(\d{4}-\d{2}-\d{2})$/;

/** Whole weeks between the seed week and the week that contains `now` (local time). */
export function seedWeekOffset(now: Date) {
  const diff = Date.parse(`${weekStart(toDateKey(now))}T00:00:00Z`) - Date.parse(`${SEED_WEEK}T00:00:00Z`);
  return Math.round(diff / WEEK_MS);
}

/**
 * An ISO 8601 date and time moved by whole weeks. The local wall-clock time is kept, so a message
 * sent at 17:40 still reads 17:40 after a change to or from summer time.
 */
export function shiftTimestamp(iso: string, weeks: number) {
  if (!weeks) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString();
}

/** A "YYYY-MM-DD" date moved by whole weeks. */
export function shiftDateKey(key: string, weeks: number) {
  return weeks ? addDays(key, weeks * 7) : key;
}

/** A recurring session id (`<groupId>-<YYYY-MM-DD>`) moved by whole weeks; other ids are kept. */
export function shiftSessionId(id: string, weeks: number) {
  const match = SESSION_ID.exec(id);
  return weeks && match ? `${match[1]}-${shiftDateKey(match[2], weeks)}` : id;
}

/** Every value of a read state moved by whole weeks. */
export function shiftReadState(state: ScenarioData["readState"], weeks: number): ScenarioData["readState"] {
  if (!weeks) return state;
  return Object.fromEntries(
    Object.entries(state).map(([viewer, conversations]) => [
      viewer,
      Object.fromEntries(Object.entries(conversations).map(([id, at]) => [id, shiftTimestamp(at, weeks)])),
    ]),
  );
}

/**
 * A copy of a scenario with every seeded date moved to the week that contains `now`. The original
 * seed is never modified, so it stays reproducible. Returns the seed itself in the seed week.
 */
export function datedScenario(data: ScenarioData, now: Date): ScenarioData {
  const weeks = seedWeekOffset(now);
  if (!weeks) return data;
  return {
    ...data,
    sessionTopics: Object.fromEntries(
      Object.entries(data.sessionTopics).map(([groupId, rotation]) => [groupId, { ...rotation, from: shiftDateKey(rotation.from, weeks) }]),
    ),
    assignments: data.assignments.map((a) => ({ ...a, assignedOn: shiftDateKey(a.assignedOn, weeks) })),
    announcements: data.announcements.map((a) => ({ ...a, postedAt: shiftTimestamp(a.postedAt, weeks) })),
    chatMessages: data.chatMessages.map((m) => ({ ...m, sentAt: shiftTimestamp(m.sentAt, weeks) })),
    readState: shiftReadState(data.readState, weeks),
    plans: data.plans.map((p) => ({
      ...p,
      sessionId: p.sessionId && shiftSessionId(p.sessionId, weeks),
      updatedAt: shiftTimestamp(p.updatedAt, weeks),
    })),
    notes: data.notes.map((n) => ({ ...n, sessionId: shiftSessionId(n.sessionId, weeks), savedAt: shiftTimestamp(n.savedAt, weeks) })),
  };
}
