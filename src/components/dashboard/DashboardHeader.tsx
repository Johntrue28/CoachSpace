"use client";

import { greetingFor } from "@/data/dashboard";
import { useNow } from "@/components/useNow";

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });

/**
 * Page header of the homes (Figma): today's date, a greeting for the time of day and a short line.
 * The date and the greeting are only known in the browser (pages are built ahead of time, D-026).
 */
export default function DashboardHeader({
  firstName,
  subtitle,
  action,
}: {
  firstName: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  const now = useNow();
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="h-4 text-xs font-semibold uppercase tracking-wide text-brand-strong">{now ? longDate.format(now) : ""}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {now ? greetingFor(now.getHours()) : "Welcome"}, {firstName}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
      </div>
      {action && <div className="hidden shrink-0 md:block">{action}</div>}
    </div>
  );
}
