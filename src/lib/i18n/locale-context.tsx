"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionary, type Locale, type Dictionary } from "@/lib/i18n/dictionary";

interface LocaleContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "wejha-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Starts "ar" to match the server-rendered HTML (see layout.tsx), then syncs
  // from localStorage after mount — reading storage during the initial client
  // render would desync from SSR output and break hydration.
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ar" || stored === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store (localStorage) on mount, not a derived-state loop
        setLocaleState(stored);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: dictionary[locale],
      setLocale,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
