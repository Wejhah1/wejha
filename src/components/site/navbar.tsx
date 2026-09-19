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

    function onScroll() {
      setRevealed(window.scrollY > window.innerHeight * 0.6);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentUntilScroll]);

  return (
    <motion.header
      initial={false}
      animate={{ y: revealed ? 0 : -24, opacity: revealed ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={
        transparentUntilScroll
          ? "fixed inset-x-0 top-4 z-40 flex justify-center px-4"
          : "sticky top-4 z-40 mb-4 flex justify-center px-4"
      }
      style={!revealed ? { pointerEvents: "none" } : undefined}
    >
      <div className="flex h-14 w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border/60 bg-background/90 px-3 shadow-lg shadow-black/5 backdrop-blur-md sm:px-4">
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
          <LocaleToggle />
        </div>
      </div>
    </motion.header>
  );
}
