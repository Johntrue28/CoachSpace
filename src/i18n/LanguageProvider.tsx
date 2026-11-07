"use client";

// The interface language (D-083). The server and the first render are English; before the first paint the
// language saved in this browser is applied and the app is mounted again (like the demo scenario, D-053), so
// every component and data rule reads the same language and no English flashes.

import { createContext, Fragment, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, intlLocale, isLocale, setLocale, type Locale } from "@/i18n";
import { loadLanguage, saveLanguage } from "@/data/persistence";

type LanguageStore = { language: Locale; setLanguage: (language: Locale) => void };

const LanguageContext = createContext<LanguageStore>({ language: DEFAULT_LOCALE, setLanguage: () => {} });

function apply(language: Locale) {
  setLocale(language);
  document.documentElement.lang = intlLocale(language);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setState] = useState<Locale>(DEFAULT_LOCALE);

  useLayoutEffect(() => {
    const saved = loadLanguage();
    if (isLocale(saved) && saved !== DEFAULT_LOCALE) {
      apply(saved);
      setState(saved);
    }
  }, []);

  const setLanguage = useCallback((next: Locale) => {
    apply(next);
    saveLanguage(next);
    setState(next);
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return (
    <LanguageContext.Provider value={value}>
      <Fragment key={language}>{children}</Fragment>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
