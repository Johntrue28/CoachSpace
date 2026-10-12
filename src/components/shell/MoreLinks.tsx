"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import { useDemoStore } from "@/data/store";
import { visibleItems } from "@/data/features";
import NavIcon from "./NavIcon";
import { coachMore } from "./sections";

const descriptions: Record<string, string> = {
  "/library": "Exercises, session plans and templates",
  "/announcements": "Updates for one group or all groups",
  "/attendance": "Take attendance for a group's session",
};

/** The secondary destinations on /more, without switched-off features (D-042). */
export default function MoreLinks() {
  const { features } = useDemoStore();
  return (
    <ul className="divide-y divide-line">
      {visibleItems(coachMore, features).map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-strong">
              <NavIcon icon={item.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{item.label}</span>
              <span className="block truncate text-sm text-ink-soft">{descriptions[item.href]}</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
