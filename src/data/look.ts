// Visual identity rules of the R11 polish (D-074): group colours, the week strip, countdowns, the
// swipe answer and the scenario photos. Pure functions, no React (unit tested).
import type { Discipline, RsvpAnswerLike } from "./look-types";

/**
 * Six group colours, each readable as text on white (WCAG AA ≥ 4.5:1) and as a fill under white text.
 * A group keeps its colour from its position among the coach's groups, so it is the same on every screen.
 */
export const GROUP_COLOURS = [
  { name: "blue", solid: "#1d4ed8", soft: "#e6edff" },
  { name: "orange", solid: "#c2410c", soft: "#ffedd5" },
  { name: "green", solid: "#047857", soft: "#d1fae5" },
  { name: "purple", solid: "#7e22ce", soft: "#f3e8ff" },
  { name: "rose", solid: "#be123c", soft: "#ffe4e6" },
  { name: "teal", solid: "#0f766e", soft: "#ccfbf1" },
] as const;

export type GroupColour = (typeof GROUP_COLOURS)[number];

/** The colour of a group: by its position in `groupIds`; unknown groups get the first colour. */
export function groupColour(groupId: string, groupIds: string[]): GroupColour {
  const i = groupIds.indexOf(groupId);
  return GROUP_COLOURS[(i < 0 ? 0 : i) % GROUP_COLOURS.length];
}

const DAY_MS = 86_400_000;
const keyToNumber = (key: string) => Date.parse(`${key}T00:00:00Z`) / DAY_MS;
const numberToKey = (n: number) => new Date(n * DAY_MS).toISOString().slice(0, 10);
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type StripDay = { date: string; weekday: string; day: number; groupIds: string[] };

/**
 * The week strip at the top of Today (D-074): `days` days from `today`, each with the groups that train
 * that day (once each, in the order of their first session), for the coloured dots.
 */
export function weekStrip(today: string, sessionsOn: (date: string) => { groupId: string; status?: string }[], days = 7): StripDay[] {
  return Array.from({ length: days }, (_, i) => {
    const date = numberToKey(keyToNumber(today) + i);
    const weekday = WEEKDAYS[(((keyToNumber(date) + 3) % 7) + 7) % 7];
    const groupIds = [...new Set(sessionsOn(date).filter((s) => s.status !== "cancelled").map((s) => s.groupId))];
    return { date, weekday, day: Number(date.slice(8, 10)), groupIds };
  });
}

/** "in 4 h 20 min", "in 25 min", "Starting now", "Under way", "in 3 days" — how far away a session is. */
export function countdown(now: Date, start: Date, end?: Date): string {
  const min = Math.round((start.getTime() - now.getTime()) / 60_000);
  if (min <= 0) return end && now < end ? "Under way" : "Started";
  if (min < 2) return "Starting now";
  if (min < 60) return `in ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return min % 60 ? `in ${h} h ${min % 60} min` : `in ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "in 1 day" : `in ${d} days`;
}

/** How far a card must travel before a swipe counts as an answer, in CSS pixels. */
export const SWIPE_THRESHOLD = 90;

/** The answer a swipe gives (D-074): right = going, left = can't go, up = maybe; anything shorter, none. */
export function answerFromSwipe(dx: number, dy: number, threshold = SWIPE_THRESHOLD): RsvpAnswerLike | null {
  if (-dy >= threshold && -dy > Math.abs(dx)) return "maybe";
  if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return null;
  return dx > 0 ? "going" : "not-going";
}

/**
 * Photos of the demo (Pexels licence, see docs/DEMO_CONTENT_SOURCES.md): a cover and session photos per sport.
 * Two photos the owner suggested were left out because real sponsors' logos are clearly visible in them.
 */
export const SPORT_PHOTOS: Record<Discipline, { cover: string; sessions: string[]; alt: string }> = {
  Tennis: { cover: "tennis-cover", sessions: ["tennis-1", "tennis-cover"], alt: "Tennis court" },
  Football: { cover: "football-cover", sessions: ["football-1", "football-cover"], alt: "Football training" },
  Basketball: { cover: "basketball-cover", sessions: ["basketball-1", "basketball-3", "basketball-cover"], alt: "Basketball practice" },
  Pilates: { cover: "pilates-cover", sessions: ["pilates-1", "pilates-cover"], alt: "Pilates studio" },
};

/** The path of a photo at a width: "/photos/tennis-1-640.jpg". */
export function photoSrc(name: string, width: 640 | 1280) {
  return `/photos/${name}-${width}.jpg`;
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A session's photo: one of its sport's photos, the same for the same session every time. */
export function sessionPhoto(sessionId: string, discipline: Discipline) {
  const list = SPORT_PHOTOS[discipline].sessions;
  return list[hash(sessionId) % list.length];
}
