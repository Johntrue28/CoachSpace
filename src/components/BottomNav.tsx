"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, UsersIcon, ChatIcon, CalendarIcon, VideoIcon } from "./Icons";

const items = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/groups", label: "Groups", Icon: UsersIcon },
  { href: "/chat", label: "Chat", Icon: ChatIcon },
  { href: "/calendar", label: "Calendar", Icon: CalendarIcon },
  { href: "/videos", label: "Videos", Icon: VideoIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
