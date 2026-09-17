"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { LocaleToggle } from "@/components/site/locale-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
            <Camera className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">{t.brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Button variant="ghost" nativeButton={false} render={<Link href="/">{t.nav.home}</Link>} />
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/locations">{t.nav.browse}</Link>}
          />
        </nav>

        <div className="flex items-center gap-2">
          <LocaleToggle />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="hidden sm:inline-flex"
            render={<Link href="/admin">{t.nav.admin}</Link>}
          />
        </div>
      </div>
    </header>
  );
}
