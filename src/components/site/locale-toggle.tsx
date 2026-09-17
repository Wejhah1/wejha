"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="font-medium"
    >
      {locale === "ar" ? "EN" : "عربي"}
    </Button>
  );
}
