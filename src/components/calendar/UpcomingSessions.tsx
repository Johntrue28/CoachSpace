"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import { useNow } from "@/components/useNow";
import { Loading } from "@/components/ui/EmptyState";
import { toDateKey } from "@/data/calendar";
import { useSessions } from "@/data/use-sessions";
import SessionTile from "./SessionTile";

/**
 * The next sessions as date cards (Figma "Upcoming sessions"), cancelled ones left out. The coach
 * dashboard skips the next session, which has its own card with actions.
 */
export default function UpcomingSessions({
  limit = 4,
  skipNext = false,
  groupIds,
  basePath = "/calendar",
  title = "Upcoming sessions",
  seeAll,
  listClassName = "md:grid-cols-2",
  className = "",
  emptyText,
}: {
  limit?: number;
  skipNext?: boolean;
  /** Only these groups' sessions (participant view, or a group filter). */
  groupIds?: string[];
  /** Where a session opens: `${basePath}/${id}`. */
  basePath?: string;
  title?: string;
  seeAll?: { href: string; label: string };
  listClassName?: string;
  className?: string;
  emptyText?: string;
}) {
  const now = useNow();
  const { ready, upcoming } = useSessions();
  const skip = skipNext ? 1 : 0;
  const list = now && ready ? upcoming(now, { limit: limit + skip, activeOnly: true, groupIds }).slice(skip) : null;

  return (
    <section aria-labelledby="upcoming-heading" className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="upcoming-heading" className="text-base font-bold text-ink">
          {title}
        </h2>
        {seeAll && (
          <Link href={seeAll.href} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-strong hover:underline">
            {seeAll.label}
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
      {!list || !now ? (
        <Loading />
      ) : list.length === 0 ? (
        <p className="text-sm text-ink-soft">{emptyText ?? (skipNext ? "No other sessions in the next two weeks." : "No sessions in the next two weeks.")}</p>
      ) : (
        <ul className={`grid gap-3 ${listClassName}`}>
          {list.map((s) => (
            <li key={s.id}>
              <SessionTile session={s} todayKey={toDateKey(now)} href={`${basePath}/${s.id}`} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
