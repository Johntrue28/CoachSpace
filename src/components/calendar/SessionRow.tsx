import Link from "next/link";
import type { Session } from "@/data/types";
import { groupName } from "@/data/groups";
import { ChevronRightIcon, PinIcon } from "@/components/Icons";
import SessionBadges from "./SessionBadges";

/** One session in a calendar list (week view and the month view's day agenda). */
export default function SessionRow({ session: s, href, past = false }: { session: Session; href: string; past?: boolean }) {
  const cancelled = s.status === "cancelled";
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-line hover:ring-brand ${past ? "opacity-70" : ""}`}
    >
      <div className="w-14 shrink-0 text-sm">
        <p className="font-semibold">{s.time}</p>
        <p className="text-xs text-ink-soft">{s.endTime}</p>
      </div>
      <div className={`min-w-0 flex-1 border-l-2 pl-3 ${cancelled ? "border-red-700" : "border-brand"}`}>
        <p className={`truncate font-semibold ${cancelled ? "text-ink-soft line-through" : ""}`}>{s.title}</p>
        <p className="truncate text-sm text-ink-soft">{groupName(s.groupId)}</p>
        <p className="flex items-center gap-1 text-xs text-ink-soft">
          <PinIcon className="h-3.5 w-3.5" /> {s.place}
        </p>
        <SessionBadges session={s} />
      </div>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
    </Link>
  );
}
