"use client";

import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { useScenario } from "@/data/scenario-store";
import { scenarioProfile } from "@/data/scenarios";
import { LiveStatus } from "@/components/ui/StatusMessage";

/** Restores the active scenario's fictional data and removes what was saved for it on this device. */
export default function ResetDemoButton() {
  const { resetDemo } = useDemoStore();
  const { scenario } = useScenario();
  const [done, setDone] = useState("");
  const name = scenarioProfile(scenario).name;
  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (
            window.confirm(
              `Reset ${name}? Everything you saved for this scenario on this device (exercises, assignments, announcements, attendance, calendar changes, session plans, notes and settings) will be removed.`,
            )
          ) {
            resetDemo();
            setDone(`${name} restored to its fictional demo data.`);
          }
        }}
        className="inline-flex min-h-11 w-full items-center justify-center text-center text-xs font-semibold text-ink-soft underline"
      >
        Reset demo data
      </button>
      <LiveStatus message={done} className="mt-2" />
    </>
  );
}
