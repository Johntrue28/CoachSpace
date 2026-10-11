"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UsersIcon, ChatIcon, CalendarIcon, BookIcon, VideoIcon } from "./Icons";
import { isParticipantPath } from "./RoleSwitcher";

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
  const items = isParticipantPath(pathname) ? participantItems : coachItems;
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
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  active ? "text-brand" : "text-ink-soft"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
