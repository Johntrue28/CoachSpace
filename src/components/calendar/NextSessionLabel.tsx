"use client";

import { toDateKey } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import { relativeDayLabel } from "@/components/format";
import { useNow } from "@/components/useNow";
import { t } from "@/i18n";

/** "Next: Tomorrow, 18:00" for a group, or its weekly schedule until today is known. */
export default function NextSessionLabel({ groupId, fallback }: { groupId: string; fallback: string }) {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  const next = now && ready ? upcoming(now, { limit: 1, groupId, activeOnly: true })[0] : undefined;
  if (!now || !next) return <>{fallback}</>;
  return <>{t("groups.next", { day: relativeDayLabel(next.date, toDateKey(now)), time: next.time })}</>;
}
