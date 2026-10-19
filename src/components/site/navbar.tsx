"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { LocaleToggle } from "@/components/site/locale-toggle";
import { Button } from "@/components/ui/button";

// Always shown within this distance of the top of the page.
const TOP_ZONE = 80;
// Ignore scroll jitter smaller than this before switching direction.
const SCROLL_SLACK = 8;

// Visible as soon as a page opens (including over the home hero), hides while
// scrolling down so it doesn't cover content, and comes back on any scroll up.
export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Every page starts with the bar shown.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on route change
    setVisible(true);
    let lastY = window.scrollY;

    function update() {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < TOP_ZONE) {
        setVisible(true);
      } else if (Math.abs(delta) < SCROLL_SLACK) {
        return;
      } else {
        setVisible(delta < 0);
      }
      lastY = y;
    }

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  return (
    <header
      className={`${
        overlay ? "fixed inset-x-0" : "sticky mb-4"
      } top-4 z-40 flex justify-center px-4 transition-[translate,opacity] duration-300 ease-out ${
        visible ? "" : "pointer-events-none -translate-y-24 opacity-0"
      }`}
      inert={!visible}
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
