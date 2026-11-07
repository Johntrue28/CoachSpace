import Link from "next/link";
import type { Group } from "@/data/types";
import { colourOf, memberCount, scheduleLabel, participantsLabel } from "@/data/groups";
import { groupConversationId } from "@/data/messages";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon } from "@/components/Icons";
import NextSessionLabel from "@/components/calendar/NextSessionLabel";
import UnreadBadge from "@/components/chat/UnreadBadge";
import { rowLinkClass } from "@/components/ui/Card";

/**
 * A group that opens its page (Figma Groups). `row` is one row of the Groups list (R8: one surface,
 * rows separated by hairlines); `rail` the compact list next to an open group
 * from 1280 px, with the open group marked.
 */
export default function GroupCard({ group: g, variant = "row", current = false }: { group: Group; variant?: "row" | "rail"; current?: boolean }) {
  const unread = <UnreadBadge conversationId={groupConversationId(g.id)} label="unread in the group chat" />;
  const summary = `${g.discipline} · ${participantsLabel(memberCount(g.id))}`;

  if (variant === "row") {
    return (
      <Link href={`/groups/${g.id}`} className={`${rowLinkClass} group py-3.5`}>
        <Avatar name={g.name} colour={colourOf(g.id)} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{g.name}</span>
          <span className="block truncate text-sm text-ink-soft">
            {participantsLabel(memberCount(g.id))} · {scheduleLabel(g)}
          </span>
          <span className="mt-0.5 block truncate text-xs font-semibold text-brand-strong">
            <NextSessionLabel groupId={g.id} fallback={g.venue} />
          </span>
        </span>
        {unread}
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
      </Link>
    );
  }

  return (
    <Link
      href={`/groups/${g.id}`}
      aria-current={current ? "page" : undefined}
      className={`flex items-center gap-3 rounded-card bg-card p-3 transition ${
        current ? "shadow-card ring-2 ring-brand" : "ring-1 ring-line hover:ring-brand/40"
      }`}
    >
      <Avatar name={g.name} size="sm" colour={colourOf(g.id)} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">{g.name}</span>
        <span className="block truncate text-xs text-ink-soft">{summary}</span>
        <span className="block truncate text-xs text-ink-soft">
          <NextSessionLabel groupId={g.id} fallback={g.venue} />
        </span>
      </span>
      {unread}
    </Link>
  );
}
