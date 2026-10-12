import Link from "next/link";
import type { Group } from "@/data/types";
import { memberCount, scheduleLabel } from "@/data/groups";
import { groupConversationId } from "@/data/messages";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon, ClockIcon, PinIcon } from "@/components/Icons";
import NextSessionLabel from "@/components/calendar/NextSessionLabel";
import UnreadBadge from "@/components/chat/UnreadBadge";
import { cardClass } from "@/components/ui/Card";

/**
 * A group as a card that opens its page (Figma Groups). `grid` is the Groups page card; `rail` is
 * the compact list next to an open group from 1280 px, with the open group marked.
 */
export default function GroupCard({ group: g, variant = "grid", current = false }: { group: Group; variant?: "grid" | "rail"; current?: boolean }) {
  const unread = <UnreadBadge conversationId={groupConversationId(g.id)} label="unread in the group chat" />;
  const summary = `${g.discipline} · ${memberCount(g.id)} participants`;

  if (variant === "rail") {
    return (
      <Link
        href={`/groups/${g.id}`}
        aria-current={current ? "page" : undefined}
        className={`flex items-center gap-3 rounded-card bg-card p-3 transition ${
          current ? "shadow-card ring-2 ring-brand" : "ring-1 ring-line hover:ring-brand/40"
        }`}
      >
        <Avatar name={g.name} size="sm" />
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

  return (
    <Link href={`/groups/${g.id}`} className={cardClass({ interactive: true, className: "group flex h-full flex-col sm:p-5" })}>
      <span className="flex items-start justify-between gap-3">
        <Avatar name={g.name} />
        <span className="flex items-center gap-2">
          {unread}
          <ChevronRightIcon className="h-4 w-4 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-brand-strong" />
        </span>
      </span>
      <span className="mt-4 block text-base font-bold text-ink">{g.name}</span>
      <span className="mt-0.5 block text-sm text-ink-soft">{summary}</span>
      <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span className="flex items-center gap-1">
          <ClockIcon className="h-3.5 w-3.5" />
          {scheduleLabel(g)}
        </span>
        <span className="flex items-center gap-1">
          <PinIcon className="h-3.5 w-3.5" />
          {g.venue}
        </span>
      </span>
      <span className="mt-auto block pt-3">
        <span className="block border-t border-line pt-3 text-xs font-semibold text-brand-strong">
          <NextSessionLabel groupId={g.id} fallback={scheduleLabel(g)} />
        </span>
      </span>
    </Link>
  );
}
