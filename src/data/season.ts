// A player's attendance this season, worked out from the saved registers. The player sees only this
// percentage (no streaks or claps, D-075). Pure functions, no React (unit tested).
import type { AttendanceRecord } from "./types";

export type Season = { attended: number; total: number; rate: number | null };

/** The player's season from the saved registers: sessions where they had a mark, how many present and the rate (null with no register yet). */
export function seasonOf(participantId: string, records: AttendanceRecord[]): Season {
  const mine = records.filter((r) => r.marks[participantId] !== undefined);
  const attended = mine.filter((r) => r.marks[participantId] === "present").length;
  return { attended, total: mine.length, rate: mine.length ? Math.round((attended / mine.length) * 100) : null };
}
