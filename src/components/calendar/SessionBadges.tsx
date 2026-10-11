import type { Session } from "@/data/types";
import { formatDateKey } from "@/components/format";

const pill = "rounded-full px-2 py-0.5 text-[11px] font-semibold";

/** Labels that make a session's changes visible everywhere: cancelled, moved, new place, one-off. */
export default function SessionBadges({ session, compact = false }: { session: Session; compact?: boolean }) {
  const badges: { key: string; text: string; className: string }[] = [];
  if (session.status === "cancelled") badges.push({ key: "c", text: "Cancelled", className: "bg-red-700 text-white" });
  if (session.movedFrom) {
    badges.push({
      key: "m",
      text: compact ? "Rescheduled" : `Moved from ${formatDateKey(session.movedFrom.date)}, ${session.movedFrom.time}`,
      className: "bg-accent/20 text-[#8a5a10]",
    });
  }
  if (session.placeChanged && session.kind === "recurring") {
    badges.push({ key: "p", text: "New location", className: "bg-accent/20 text-[#8a5a10]" });
  }
  if (session.kind === "one-off") badges.push({ key: "o", text: "Extra session", className: "bg-brand-soft text-brand" });
  if (badges.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span key={b.key} className={`${pill} ${b.className}`}>
          {b.text}
        </span>
      ))}
    </span>
  );
}
