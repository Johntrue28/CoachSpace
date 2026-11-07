// The latest announcement pinned on Home (D-076), for the coach and for the players. Pure functions, no React
// (unit tested). Closing the card hides that announcement in this browser until a newer one is posted.
import type { Announcement } from "./types";

/** Who is looking at Home: the coach or the demo player. */
export type PinViewer = "coach" | "player";

/**
 * The newest announcement for everyone or for one of `groupIds` (all groups when left out), unless the viewer
 * closed that very announcement. A newer announcement shows again.
 */
export function pinnedAnnouncement(announcements: Announcement[], hiddenId: string | undefined, groupIds?: string[]) {
  const latest = announcements
    .filter((a) => a.groupId === null || !groupIds || groupIds.includes(a.groupId))
    .reduce<Announcement | undefined>((best, a) => (!best || a.postedAt > best.postedAt ? a : best), undefined);
  return latest && latest.id !== hiddenId ? latest : undefined;
}

/** The first line of an announcement's text, for the pinned card. */
export function firstLine(body: string) {
  return body.trim().split(/\n/)[0].trim();
}

/** Closed pins read back safely: viewer → announcement id. */
export function normaliseHiddenPins(value: unknown): Partial<Record<PinViewer, string>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const out: Partial<Record<PinViewer, string>> = {};
  for (const viewer of ["coach", "player"] as const) {
    const id = (value as Record<string, unknown>)[viewer];
    if (typeof id === "string" && id.length < 200) out[viewer] = id;
  }
  return out;
}
