"use client";

import { cardClass } from "@/components/ui/Card";
import DemoScenarioSettings from "@/components/settings/DemoScenarioSettings";

/**
 * Settings (D-043, D-075): only what works in the demo — the Demo section (the example being explored,
 * switching example and the resets). Nothing is shown that does not work.
 */
export default function SettingsView() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6 lg:pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Settings</h1>
      <section aria-labelledby="demo-heading" className={cardClass({ className: "mt-6 p-5 sm:p-6" })}>
        <DemoScenarioSettings />
      </section>
    </main>
  );
}
