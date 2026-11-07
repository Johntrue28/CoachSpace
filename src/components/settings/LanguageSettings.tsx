"use client";

import { LOCALES, t, type Locale } from "@/i18n";
import { useLanguage } from "@/i18n/LanguageProvider";

const names: Record<Locale, () => string> = { en: () => t("settings.english"), es: () => t("settings.spanish") };

/** Settings → Language (D-083): English or Español, saved in this browser. The whole app switches at once. */
export default function LanguageSettings() {
  const { language, setLanguage } = useLanguage();
  return (
    <>
      <h2 id="language-heading" className="text-lg font-bold text-ink">
        {t("settings.language")}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{t("settings.languageHint")}</p>
      <div role="group" aria-labelledby="language-heading" className="mt-3 grid grid-cols-2 gap-2">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            lang={l === "es" ? "es-ES" : "en-GB"}
            aria-pressed={language === l}
            onClick={() => setLanguage(l)}
            className={`min-h-12 rounded-control px-3 text-sm font-semibold ring-1 transition ${
              language === l ? "bg-brand-strong text-on-brand ring-brand-strong" : "bg-card text-ink ring-line hover:bg-surface"
            }`}
          >
            {names[l]()}
          </button>
        ))}
      </div>
    </>
  );
}
