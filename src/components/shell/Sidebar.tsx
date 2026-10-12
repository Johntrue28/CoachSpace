"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/Avatar";
import RoleSwitcher from "@/components/RoleSwitcher";
import { CountBadge } from "@/components/ui/Badge";
import { useUnreadTotal } from "@/components/chat/UnreadBadge";
import { useDemoStore } from "@/data/store";
import { visibleItems } from "@/data/features";
import { coach, DEMO_PARTICIPANT_ID, groupIdsOf, groupName, participantById } from "@/data/groups";
import { COACH_SENDER_ID } from "@/data/messages";
import { formatBadgeCount } from "@/data/unread";
import Logo from "./Logo";
import NavIcon from "./NavIcon";
import { coachSidebar, isActive, isParticipantPath, participantNav } from "./sections";

/** Persistent desktop navigation (from 1024 px), as in the Figma design. */
export default function Sidebar() {
  const pathname = usePathname();
  const participant = isParticipantPath(pathname);
  const { features } = useDemoStore();
  const items = participant ? participantNav : visibleItems(coachSidebar, features);
  const unread = useUnreadTotal(participant ? DEMO_PARTICIPANT_ID : COACH_SENDER_ID);
  const badge = formatBadgeCount(unread);
  const person = participant
    ? {
        name: participantById(DEMO_PARTICIPANT_ID)?.name ?? "Participant",
        detail: groupIdsOf(DEMO_PARTICIPANT_ID).map(groupName).join(", "),
      }
    : { name: coach.name, detail: coach.organisation };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-line bg-card px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo href={participant ? "/me" : "/"} />
      </div>

      <p className="mb-2 mt-9 px-3 text-label font-semibold uppercase tracking-widest text-ink-soft">
        {participant ? "Participant" : "Workspace"}
      </p>
      <nav aria-label="Main">
        <ul className="space-y-1">
          {items.map(({ href, label, icon }) => {
            const active = isActive(href, pathname);
            const isChat = icon === "chat";
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  aria-label={isChat && unread > 0 ? `Chat, ${unread} unread message${unread === 1 ? "" : "s"}` : undefined}
                  className={`group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition ${
                    active ? "bg-brand-soft font-semibold text-brand-strong" : "text-ink-soft hover:bg-surface hover:text-ink"
                  }`}
                >
                  <NavIcon
                    icon={icon}
                    className={`h-5 w-5 shrink-0 ${active ? "text-brand-strong" : "text-ink-muted group-hover:text-ink-soft"}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {isChat && badge && <CountBadge text={badge} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="my-5 border-t border-line" />
      <RoleSwitcher variant="panel" className="px-3" />

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
          <Avatar name={person.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{person.name}</p>
            <p className="truncate text-xs text-ink-soft">{person.detail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
