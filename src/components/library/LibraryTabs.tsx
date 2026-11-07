import Link from "next/link";
import { t } from "@/i18n";

/** Switches between the two parts of the library: exercises and plans (D-048, D-076). */
export default function LibraryTabs({ current }: { current: "exercises" | "plans" }) {
  const tabs = [
    { key: "exercises", href: "/library", label: t("library.tabExercises") },
    { key: "plans", href: "/library/plans", label: t("library.tabPlans") },
  ] as const;
  return (
    <nav aria-label={t("library.sections")} className="flex w-fit rounded-control bg-sunken p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={current === t.key ? "page" : undefined}
          className={`inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold text-ink ${
            current === t.key ? "bg-card shadow-card" : "hover:bg-card/60"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
