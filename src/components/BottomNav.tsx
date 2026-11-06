"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CountDot } from "./chat/ChatNotification";
import { useUnreadTotal } from "./chat/UnreadBadge";
import NavIcon from "./shell/NavIcon";
import { coachTabs, isActive, isParticipantPath, participantNav } from "./shell/sections";
import { formatBadgeCount } from "@/data/unread";
import { COACH_SENDER_ID } from "@/data/messages";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";

/** Mobile and tablet navigation (hidden from 1024 px, where the sidebar takes over). */
export default function BottomNav() {
  const pathname = usePathname();
  const participant = isParticipantPath(pathname);
  const items = participant ? participantNav : coachTabs;
  const unread = useUnreadTotal(participant ? DEMO_PARTICIPANT_ID : COACH_SENDER_ID);
  const badge = formatBadgeCount(unread);
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg justify-around px-2">
        {items.map(({ href, label, icon }) => {
          const active = isActive(href, pathname);
          const isChat = icon === "chat";
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={isChat && unread > 0 ? `${label}, ${unread} unread message${unread === 1 ? "" : "s"}` : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-label font-semibold ${
                  active ? "text-brand-strong" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span
                  className={`relative grid h-8 w-14 place-items-center rounded-full transition ${active ? "bg-brand-soft" : ""}`}
                >
                  <NavIcon icon={icon} className="h-5 w-5" />
                  {isChat && badge && <CountDot text={badge} />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
