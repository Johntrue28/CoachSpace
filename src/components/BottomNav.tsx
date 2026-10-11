"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UsersIcon, ChatIcon, CalendarIcon, BookIcon, VideoIcon } from "./Icons";
import { isParticipantPath } from "./RoleSwitcher";
import { CountDot } from "./chat/ChatNotification";
import { useUnreadTotal } from "./chat/UnreadBadge";
import { formatBadgeCount } from "@/data/unread";
import { COACH_SENDER_ID } from "@/data/messages";
import { DEMO_PARTICIPANT_ID } from "@/data/groups";

const coachItems = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/groups", label: "Groups", Icon: UsersIcon },
  { href: "/chat", label: "Chat", Icon: ChatIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/library", label: "Library", Icon: BookIcon },
];

// The participant view has no management sections (groups admin, library).
const participantItems = [
  { href: "/me", label: "Home", Icon: HomeIcon },
  { href: "/me/chat", label: "Chat", Icon: ChatIcon },
  { href: "/me/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/me/videos", label: "My Videos", Icon: VideoIcon },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href === "/me") return pathname === "/me" || pathname.startsWith("/me/groups");
  return pathname.startsWith(href);
}

export default function BottomNav() {
  const pathname = usePathname();
  const participant = isParticipantPath(pathname);
  const items = participant ? participantItems : coachItems;
  const unread = useUnreadTotal(participant ? DEMO_PARTICIPANT_ID : COACH_SENDER_ID);
  const badge = formatBadgeCount(unread);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(href, pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={label === "Chat" && unread > 0 ? `Chat, ${unread} unread message${unread === 1 ? "" : "s"}` : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-label font-medium ${
                  active ? "text-brand-strong" : "text-ink-soft"
                }`}
              >
                <span className="relative">
                  <Icon className="h-6 w-6" />
                  {label === "Chat" && badge && <CountDot text={badge} />}
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
