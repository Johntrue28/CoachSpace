import type { Session } from "@/data/types";
import { formatDateKey } from "@/components/format";
import { badgeClass, type BadgeTone } from "@/components/ui/Badge";
import { t } from "@/i18n";

/** Labels that make a session's changes visible everywhere: cancelled, moved, new place, one-off. */
export default function SessionBadges({ session, compact = false }: { session: Session; compact?: boolean }) {
  const badges: { key: string; text: string; tone: BadgeTone }[] = [];
  if (session.status === "cancelled") badges.push({ key: "c", text: t("session.badgeCancelled"), tone: "solid-danger" });
  if (session.movedFrom) {
    badges.push({
      key: "m",
      text: compact ? t("session.badgeRescheduled") : t("session.badgeMoved", { day: formatDateKey(session.movedFrom.date), time: session.movedFrom.time }),
      tone: "attention",
    });
  }
  if (session.placeChanged && session.kind === "recurring") {
    badges.push({ key: "p", text: t("session.badgeNewPlace"), tone: "attention" });
  }
  if (session.kind === "one-off") badges.push({ key: "o", text: t("session.badgeExtra"), tone: "brand" });
  if (badges.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span key={b.key} className={badgeClass(b.tone)}>
          {b.text}
        </span>
      ))}
    </span>
  );
}
