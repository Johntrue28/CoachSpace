"use client";

import Link from "next/link";
import { BookIcon, ChatIcon, MegaphoneIcon, UserCheckIcon } from "@/components/Icons";
import { cardClass } from "@/components/ui/Card";
import { useAttendanceSetting } from "@/data/store";

// Each label says exactly where it goes (audit F-08). New sessions already have a button on the
// dashboard's calendar and in the top bar, so the fourth shortcut posts an announcement instead.
const actions = [
  { href: "/attendance", label: "Take attendance", Icon: UserCheckIcon, tile: "bg-brand-soft text-brand-strong", attendance: true },
  { href: "/announcements/new", label: "Post announcement", Icon: MegaphoneIcon, tile: "bg-info-soft text-info", attendance: false },
  { href: "/library/new", label: "Add exercise", Icon: BookIcon, tile: "bg-planning-soft text-planning", attendance: false },
  { href: "/chat", label: "Open chats", Icon: ChatIcon, tile: "bg-sunken text-ink", attendance: false },
];

/** Shortcuts to the coach's most common tasks (Figma). "Take attendance" only while attendance is on (D-042). */
export default function QuickActions({ className = "" }: { className?: string }) {
  const { enabled } = useAttendanceSetting();
  const shown = actions.filter((a) => !a.attendance || enabled);
  return (
    <section aria-labelledby="quick-actions" className={cardClass({ className: `sm:p-5 ${className}` })}>
      <h2 id="quick-actions" className="mb-3 text-base font-bold text-ink">
        Quick actions
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {shown.map(({ href, label, Icon, tile }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full min-h-20 flex-col justify-between gap-3 rounded-control border border-line p-3 transition hover:border-brand/40 hover:bg-surface"
            >
              <span className={`grid h-8 w-8 place-items-center rounded-control ${tile}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold leading-tight text-ink">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
