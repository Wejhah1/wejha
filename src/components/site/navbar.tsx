"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Plus } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { LocaleToggle } from "@/components/site/locale-toggle";
import { Button } from "@/components/ui/button";

// Distance from the top within which the bar is always shown.
const TOP_ZONE = 80;
// Ignore scroll jitter smaller than this before flipping direction.
const SCROLL_SLACK = 8;

export function Navbar({ transparentUntilScroll = false }: { transparentUntilScroll?: boolean }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const [visible, setVisible] = useState(!transparentUntilScroll);

  // Re-evaluated on every route change (pathname dep): the bar used to keep the
  // previous page's state, so leaving the home hero left it invisible elsewhere.
  useEffect(() => {
    let lastY = window.scrollY;

    function update() {
      const y = window.scrollY;
      if (transparentUntilScroll && y < window.innerHeight * 0.6) {
        setVisible(false);
      } else if (y < TOP_ZONE || Math.abs(y - lastY) > window.innerHeight) {
        // Near the top, or a jump bigger than a screen (scroll restored on
        // back/forward, anchor link) rather than the user scrolling.
        setVisible(true);
      } else if (Math.abs(y - lastY) >= SCROLL_SLACK) {
        // Hide while scrolling down so it doesn't cover content; show on the way up.
        setVisible(y < lastY);
      } else {
        return;
      }
      lastY = y;
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [transparentUntilScroll, pathname]);

  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : -96, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={
        transparentUntilScroll
          ? "fixed inset-x-0 top-4 z-40 flex justify-center px-4"
          : "sticky top-4 z-40 mb-4 flex justify-center px-4"
      }
      style={visible ? undefined : { pointerEvents: "none" }}
      inert={!visible}
    >
      <div className="flex h-14 w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border/60 bg-background/95 px-3 shadow-lg shadow-black/5 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
            <Camera className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">{t.brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="rounded-full"
            render={<Link href="/">{t.nav.home}</Link>}
          />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="rounded-full"
            render={<Link href="/locations">{t.nav.browse}</Link>}
          />
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            nativeButton={false}
            className="gap-1 rounded-full px-3"
            render={
              <Link href="/request-location">
                <Plus className="h-3.5 w-3.5" />
                {t.nav.addLocation}
              </Link>
            }
          />
          <LocaleToggle />
        </div>
      </div>
    </motion.header>
  );
}
