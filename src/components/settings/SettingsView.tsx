"use client";

import Link from "next/link";
import FeatureSettings from "@/components/settings/FeatureSettings";
import Badge from "@/components/ui/Badge";
import { cardClass } from "@/components/ui/Card";
import { coach } from "@/data/groups";
import DemoScenarioSettings from "@/components/settings/DemoScenarioSettings";
import { useSearchParams } from "next/navigation";

const sections = [
  { id: "demo", label: "Demo" },
  { id: "features", label: "Features" },
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
] as const;

type SectionId = (typeof sections)[number]["id"];

/**
 * Settings (D-043), following the Figma Settings screen, plus Demo (D-055): the demo scenario
 * switcher and data resets. Features holds the global attendance switch; General and Notifications
 * say clearly what is not available in the demo. The section comes from `?section=`, read in the browser so
 * the page is built in advance (D-054).
 */
export function SettingsScreen({ section }: { section?: string }) {
  const active: SectionId = sections.some((s) => s.id === section) ? (section as SectionId) : "features";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Settings</h1>
      {/* No explanatory subtitles on phones (D-071). */}
      <p className="mt-1.5 hidden text-sm text-ink-soft sm:block">Configure CoachSpace for the way your organisation works.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[14rem_minmax(0,42rem)] xl:gap-6">
        {/* One row of sections on phones and tablets (R8), a list beside the content from 1280 px. */}
        <nav aria-label="Settings sections" className="-mx-4 h-fit overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-1 rounded-control bg-sunken p-1 sm:w-auto xl:flex-col">
            {sections.map((s) => {
              const current = s.id === active;
              return (
                <li key={s.id} className="sm:flex-1">
                  <Link
                    href={`/settings?section=${s.id}`}
                    aria-current={current ? "page" : undefined}
                    className={`flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-ink transition sm:flex-1 xl:justify-start ${
                      current ? "bg-card shadow-card" : "hover:bg-card/60"
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section aria-labelledby={`${active}-heading`} className={cardClass({ className: "p-5 sm:p-6" })}>
          {active === "features" && (
            <>
              <h2 id="features-heading" className="text-lg font-bold text-ink">
                Application features
              </h2>
              <p className="mt-1 hidden text-sm text-ink-soft sm:block">Choose which tools are available throughout CoachSpace.</p>
              <FeatureSettings />
            </>
          )}

          {active === "demo" && <DemoScenarioSettings />}

          {active === "general" && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="general-heading" className="text-lg font-bold text-ink">
                  General
                </h2>
                <Badge tone="attention">Coming soon</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                Organisation details and preferences are not editable in this demo yet. It uses fictional data for{" "}
                {coach.organisation}.
              </p>

            </>
          )}

          {active === "notifications" && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="notifications-heading" className="text-lg font-bold text-ink">
                  Notifications
                </h2>
                <Badge tone="attention">Coming soon</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                This demo does not send notifications: no email, push or text messages. The bell at the top shows activity
                worked out from the demo data in this browser.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function SettingsView() {
  return <SettingsScreen section={useSearchParams().get("section") ?? undefined} />;
}
