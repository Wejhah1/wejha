"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className={`rounded-full font-medium ${className ?? ""}`}
    >
      {locale === "ar" ? "EN" : "عربي"}
    </Button>
  );
}
