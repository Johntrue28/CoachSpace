"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import NavIcon from "./NavIcon";
import { coachMore } from "./sections";
import { t } from "@/i18n";

const descriptions: Record<string, () => string> = {
  "/calendar": () => t("profile.calendarDetail"),
  "/attendance": () => t("profile.attendanceDetail"),
  "/settings": () => t("profile.settingsDetail"),
};

/** The Profile list (D-076): Calendar, Attendance, Settings. */
export default function MoreLinks() {
  return (
    <ul className="divide-y divide-line">
      {coachMore.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="flex min-h-14 items-center gap-3 px-4 py-3.5 transition hover:bg-surface">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand-strong">
              <NavIcon icon={item.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{item.label}</span>
              <span className="block truncate text-sm text-ink-soft">{descriptions[item.href]?.()}</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
