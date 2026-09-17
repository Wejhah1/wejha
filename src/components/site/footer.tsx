"use client";

import { useLocale } from "@/lib/i18n/locale-context";

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <span className="font-bold text-foreground">{t.brand}</span>
        <span>
          © {year} {t.brand} — {t.footer.rights}
        </span>
      </div>
    </footer>
  );
}
