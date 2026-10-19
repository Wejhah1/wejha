"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { LocaleToggle } from "@/components/site/locale-toggle";
import { Button } from "@/components/ui/button";

// Always visible: it used to hide over the home hero and while scrolling down,
// which left visitors without navigation until they scrolled back up.
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { t } = useLocale();

  return (
    <header
      className={
        overlay
          ? "fixed inset-x-0 top-4 z-40 flex justify-center px-4"
          : "sticky top-4 z-40 mb-4 flex justify-center px-4"
      }
    >
      <div className="flex h-14 w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border/60 bg-background/95 px-3 shadow-lg shadow-black/5 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
            <Camera className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">{t.brand}</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="hidden rounded-full sm:inline-flex"
            render={<Link href="/">{t.nav.home}</Link>}
          />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="rounded-full"
            render={<Link href="/locations">{t.nav.browse}</Link>}
          />
          <LocaleToggle />
        </nav>
      </div>
    </header>
  );
}
