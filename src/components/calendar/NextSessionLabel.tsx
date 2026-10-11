"use client";

import { toDateKey, upcomingSessions } from "@/data/calendar";
import { relativeDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";

/** "Next: Tomorrow, 18:00" for a group, or its weekly schedule until today is known. */
export default function NextSessionLabel({ groupId, fallback }: { groupId: string; fallback: string }) {
  const now = useNow();
  const next = now ? upcomingSessions(now, { limit: 1, groupId })[0] : undefined;
  if (!now || !next) return <>{fallback}</>;
  return <>{`Next: ${relativeDayLabel(next.date, toDateKey(now))}, ${next.time}`}</>;
}
