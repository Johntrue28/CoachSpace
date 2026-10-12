import Link from "next/link";

/** Switches between the two parts of the library: exercises and session plans (D-048). */
export default function LibraryTabs({ current }: { current: "exercises" | "plans" }) {
  const tabs = [
    { key: "exercises", href: "/library", label: "Exercises" },
    { key: "plans", href: "/library/plans", label: "Session plans" },
  ] as const;
  return (
    <nav aria-label="Library sections" className="flex w-fit rounded-control bg-sunken p-1">
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
