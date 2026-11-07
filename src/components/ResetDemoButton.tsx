"use client";

import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { useChatStore } from "@/data/chat-store";
import { useScenario } from "@/data/scenario-store";
import { scenarioProfile } from "@/data/scenarios";
import { LiveStatus } from "@/components/ui/StatusMessage";
import { t } from "@/i18n";

/** Restores the active scenario's fictional data and removes what was saved for it on this device. */
export default function ResetDemoButton() {
  const { resetDemo } = useDemoStore();
  const { resetChat } = useChatStore();
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
              t("reset.confirm", { name }),
            )
          ) {
            resetDemo();
            resetChat();
            setDone(t("reset.done", { name }));
          }
        }}
        className="inline-flex min-h-11 w-full items-center justify-center text-center text-xs font-semibold text-ink-soft underline"
      >
        {t("reset.button")}
      </button>
      <LiveStatus message={done} className="mt-2" />
    </>
  );
}
