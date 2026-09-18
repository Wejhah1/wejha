"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { LocaleToggle } from "@/components/site/locale-toggle";
import { Button } from "@/components/ui/button";

export function Navbar({ transparentUntilScroll = false }: { transparentUntilScroll?: boolean }) {
  const { t } = useLocale();
  const [revealed, setRevealed] = useState(!transparentUntilScroll);

  useEffect(() => {
    if (!transparentUntilScroll) return;

    // Reveal once the current page's hero has scrolled past, whatever its
    // height happens to be — a fixed viewport-height fraction doesn't work
    // across heroes of very different heights (full-screen home hero vs. the
    // shorter location-detail hero).
    const sentinel = document.getElementById("hero-reveal-sentinel");
    if (!sentinel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fallback so the navbar isn't stuck hidden if a route passes transparentUntilScroll without rendering a hero sentinel
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setRevealed(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [transparentUntilScroll]);

  return (
    <motion.header
      initial={false}
      animate={{ y: revealed ? 0 : -16, opacity: revealed ? 1 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={
        transparentUntilScroll
          ? "fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md"
          : "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md"
      }
      style={!revealed ? { pointerEvents: "none" } : undefined}
    >
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
        </div>
      </div>
    </motion.header>
  );
}
