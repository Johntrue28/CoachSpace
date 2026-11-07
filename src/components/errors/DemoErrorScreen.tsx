"use client";

import { useState } from "react";
import { clearEverything, WELCOME_PATH } from "@/data/persistence";
import { t } from "@/i18n";

/**
 * What a visitor sees if a page fails unexpectedly (D-069), instead of the framework's blank error:
 * a plain explanation, "Try again", and a way to start the demo again from scratch. Uses only plain
 * elements and design tokens, so it works even when the rest of the app could not load.
 */
export default function DemoErrorScreen({ retry }: { retry: () => void }) {
  const [resetting, setResetting] = useState(false);
  return (
    <main role="alert" className="mx-auto grid min-h-[60dvh] w-full max-w-lg place-content-center gap-3 px-4 py-10 text-center">
      <h1 className="text-2xl font-bold text-ink">{t("errors.title")}</h1>
      <p className="text-sm text-ink-soft">
        {t("errors.body")}
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={retry}
          className="min-h-11 rounded-control bg-brand-strong px-4 text-sm font-semibold text-on-brand"
        >
          {t("errors.retry")}
        </button>
        <button
          type="button"
          disabled={resetting}
          onClick={() => {
            setResetting(true);
            clearEverything();
            window.location.assign(WELCOME_PATH);
          }}
          className="min-h-11 rounded-control bg-card px-4 text-sm font-semibold text-ink ring-1 ring-line"
        >
          {t("errors.restart")}
        </button>
      </div>
      <p className="text-xs text-ink-soft">{t("errors.restartHint")}</p>
    </main>
  );
}
