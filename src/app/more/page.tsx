import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import RoleSwitcher from "@/components/RoleSwitcher";
import ResetDemoButton from "@/components/ResetDemoButton";
import Card from "@/components/ui/Card";
import NavIcon from "@/components/shell/NavIcon";
import { coachMore } from "@/components/shell/sections";

export const metadata = { title: "More · CoachSpace" };

const descriptions: Record<string, string> = {
  "/library": "Exercises, session plans and templates",
  "/announcements": "Updates for one group or all groups",
  "/attendance": "Take attendance for a group's session",
};

/** Secondary destinations of the coach view on mobile (the desktop sidebar lists them all). */
export default function MorePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">More</h1>
      <p className="mt-1 text-sm text-ink-soft">Everything else in your workspace.</p>

      <Card as="section" padded={false} className="mt-5 overflow-hidden">
        <ul className="divide-y divide-line">
          {coachMore.map((item) => (
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
      </Card>

      <Card as="section" className="mt-4" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="sr-only">
          Demo
        </h2>
        <RoleSwitcher variant="panel" />
        <div className="mt-4 border-t border-line pt-4">
          <ResetDemoButton />
        </div>
      </Card>
    </main>
  );
}
