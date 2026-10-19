"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="font-bold text-foreground">{t.brand}</span>
          <Link href="/locations" className="transition-colors hover:text-foreground">
            {t.nav.browse}
          </Link>
          <Link href="/request-location" className="transition-colors hover:text-foreground">
            {t.nav.addLocation}
          </Link>
        </div>
        <span>
          © {year} {t.brand} — {t.footer.rights}
        </span>
      </div>
    </footer>
  );
}
