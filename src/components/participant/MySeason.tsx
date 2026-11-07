"use client";

import { useAttendanceSetting, useDemoStore } from "@/data/store";
import { seasonOf, seededClaps } from "@/data/season";
import { listClass } from "@/components/ui/Card";

/**
 * "My season" (D-074): the player's attendance, their current streak and the coach's claps — small rewards
 * that make coming back feel good, like Strava's kudos. Worked out from this demo's registers.
 */
export default function MySeason({ participantId }: { participantId: string }) {
  const { attendance, claps, ready } = useDemoStore();
  // With attendance switched off (D-042) the player sees no attendance figures, only the claps.
  const attendanceOn = useAttendanceSetting().enabled;
  if (!ready) return null;
  const season = seasonOf(participantId, attendance);
  const total = seededClaps(participantId) + (claps[participantId] ?? 0);
  const rate = season.rate ?? 0;
  return (
    <section aria-labelledby="season-heading">
      <h2 id="season-heading" className="px-1 text-base font-bold text-ink">
        My season
      </h2>
      <ul className={listClass(`mt-2 grid divide-x divide-y-0 ${attendanceOn ? "grid-cols-3" : "grid-cols-1"}`)}>
        {attendanceOn && (
          <>
        <li className="flex flex-col items-center gap-1.5 px-2 py-4">
          <span
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{ background: `conic-gradient(var(--color-brand-strong) 0 ${rate}%, var(--color-line) ${rate}% 100%)` }}
            aria-hidden="true"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-card text-sm font-bold text-ink">{season.rate === null ? "–" : `${rate}%`}</span>
          </span>
          <span className="text-xs font-semibold text-ink-soft">
            Attendance<span className="sr-only">: {season.rate === null ? "no registers yet" : `${rate}%, ${season.attended} of ${season.total}`}</span>
          </span>
        </li>
        <li className="flex flex-col items-center justify-center gap-1.5 px-2 py-4">
          <span className="text-2xl font-bold text-ink">
            <span aria-hidden="true">🔥</span> {season.streak}
          </span>
          <span className="text-center text-xs font-semibold text-ink-soft">In a row</span>
        </li>
          </>
        )}
        <li className="flex flex-col items-center justify-center gap-1.5 px-2 py-4">
          <span className="text-2xl font-bold text-ink">
            <span aria-hidden="true">👏</span> {total}
          </span>
          <span className="text-center text-xs font-semibold text-ink-soft">Claps from your coach</span>
        </li>
      </ul>
    </section>
  );
}
