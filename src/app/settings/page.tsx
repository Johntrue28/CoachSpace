import Link from "next/link";
import ResetDemoButton from "@/components/ResetDemoButton";
import FeatureSettings from "@/components/settings/FeatureSettings";
import Badge from "@/components/ui/Badge";
import { cardClass } from "@/components/ui/Card";
import { coach } from "@/data/groups";

export const metadata = { title: "Settings · CoachSpace" };

const sections = [
  { id: "general", label: "General" },
  { id: "features", label: "Features" },
  { id: "notifications", label: "Notifications" },
] as const;

type SectionId = (typeof sections)[number]["id"];

/**
 * Settings (D-043), following the Figma Settings screen: General, Features and Notifications.
 * Only Features changes anything (the global attendance switch); the other sections say clearly
 * what is not available in the demo.
 */
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;
  const active: SectionId = sections.some((s) => s.id === section) ? (section as SectionId) : "features";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Settings</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Configure CoachSpace for the way your organisation works.</p>

      <div className="mt-6 grid gap-4 xl:grid-cols-[14rem_minmax(0,42rem)] xl:gap-6">
        <nav aria-label="Settings sections" className={cardClass({ padded: false, className: "h-fit p-1.5" })}>
          <ul className="grid grid-cols-3 gap-1 xl:grid-cols-1">
            {sections.map((s) => {
              const current = s.id === active;
              return (
                <li key={s.id}>
                  <Link
                    href={`/settings?section=${s.id}`}
                    aria-current={current ? "page" : undefined}
                    className={`flex min-h-10 items-center justify-center rounded-control px-3 py-2 text-sm font-semibold transition xl:justify-start ${
                      current ? "bg-brand-soft text-brand-strong" : "text-ink-soft hover:bg-surface hover:text-ink"
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
              <p className="mt-1 text-sm text-ink-soft">Choose which tools are available throughout CoachSpace.</p>
              <FeatureSettings />
            </>
          )}

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

              <div className="mt-6 border-t border-line pt-6">
                <h3 className="text-sm font-semibold text-ink">Demo data</h3>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Restores the fictional demo data and removes everything saved in this browser: exercises, assignments,
                  announcements, attendance, calendar changes, session plans, notes and settings.
                </p>
                <div className="mt-3 w-fit">
                  <ResetDemoButton />
                </div>
              </div>
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
