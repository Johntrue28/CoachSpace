import Link from "next/link";
import Avatar from "@/components/Avatar";
import { ChevronRightIcon } from "@/components/Icons";
import UnreadBadge from "@/components/chat/UnreadBadge";
import { groups, memberCount, scheduleLabel } from "@/data/groups";
import { groupConversationId } from "@/data/messages";

/** The coach's groups with their size, weekly schedule and unread group chat, each opening its page. */
export default function GroupsList() {
  return (
    <ul className="divide-y divide-line">
      {groups.map((g) => (
        <li key={g.id}>
          <Link href={`/groups/${g.id}`} className="-mx-2 flex items-center gap-3 rounded-control px-2 py-3 hover:bg-surface">
            <Avatar name={g.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{g.name}</p>
              <p className="truncate text-sm text-ink-soft">
                {g.discipline} · {memberCount(g.id)} participants
              </p>
              <p className="truncate text-xs text-ink-soft">{scheduleLabel(g)}</p>
            </div>
            <UnreadBadge conversationId={groupConversationId(g.id)} label="unread in the group chat" />
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
