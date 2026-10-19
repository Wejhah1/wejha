"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { MAIN_NAV, isActive } from "@/lib/site-nav";
import { HeaderActions } from "@/components/site/header-actions";

// "dark": white text laid over a dark hero; "light": in the page flow on the
// cream background.
export type HeaderTone = "light" | "dark";

// Part of the page rather than a fixed bar: it sits at the top and scrolls
// away with the content, so nothing ever covers the page.
export function SiteHeader({ tone = "light" }: { tone?: HeaderTone }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const dark = tone === "dark";

  return (
    <header
      className={`${dark ? "absolute inset-x-0 top-0 text-white" : "relative text-foreground"} z-40`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              dark ? "bg-white text-[#1a1310]" : "bg-foreground text-background"
            }`}
          >
            <Camera className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">{t.brand}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label={t.brand} className="flex items-center gap-1">
            {MAIN_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${item.desktopOnly ? "hidden sm:inline-flex" : "inline-flex"} rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    dark
                      ? active
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                      : active
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-foreground/75 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label(t)}
                </Link>
              );
            })}
          </nav>
          <HeaderActions tone={tone} />
        </div>
      </div>
    </header>
  );
}
