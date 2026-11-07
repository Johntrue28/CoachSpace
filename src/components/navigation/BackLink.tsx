"use client";

import { usePathname } from "next/navigation";
import { useDemoStore } from "@/data/store";
import { groupName } from "@/data/groups";
import { ArrowLeftIcon } from "@/components/Icons";
import { useNavigation } from "./NavigationProvider";
import { labelForUrl } from "./history";
import { t } from "@/i18n";

/**
 * "← Previous page" link. Goes back in the browser history when the user came from another
 * page of the app, and to `fallback` (the logical parent) when the page was opened directly.
 */
export default function BackLink({
  fallback,
  fallbackLabel,
  iconOnly = false,
  className = "",
}: {
  fallback: string;
  fallbackLabel: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const nav = useNavigation();
  const { exercises } = useDemoStore();
  const previous = nav.previousFor(pathname);
  const label = previous
    ? labelForUrl(previous, {
        group: (id) => groupName(id) || undefined,
        exercise: (id) => exercises.find((e) => e.id === id)?.title,
      })
    : fallbackLabel;

  return (
    <a
      href={previous ?? fallback}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        nav.back(fallback);
      }}
      aria-label={iconOnly ? t("common.backTo", { label }) : undefined}
      className={
        iconOnly
          ? `rounded-full p-1 text-brand-strong ${className}`
          : `-my-3 inline-flex items-center gap-1 py-3 text-sm font-semibold text-brand-strong ${className}`
      }
    >
      <ArrowLeftIcon className={iconOnly ? "h-5 w-5" : "h-4 w-4"} />
      {!iconOnly && label}
    </a>
  );
}
