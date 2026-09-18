"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/i18n/locale-context";

const SESSION_KEY = "wejha-intro-seen";

export function IntroReveal({ onDone }: { onDone?: () => void }) {
  const { t, dir } = useLocale();
  const [phase, setPhase] = useState<"hidden" | "in" | "out">("hidden");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (prefersReducedMotion || alreadySeen) {
      onDone?.();
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "1");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time kickoff of the intro animation on mount
    setPhase("in");
    const toOut = setTimeout(() => setPhase("out"), 950);
    const toHidden = setTimeout(() => {
      setPhase("hidden");
      onDone?.();
    }, 1600);
    return () => {
      clearTimeout(toOut);
      clearTimeout(toHidden);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  return (
    <AnimatePresence>
      {phase !== "hidden" && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: phase === "out" ? "-100%" : 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950"
        >
          <motion.span
            initial={{ clipPath: dir === "rtl" ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0%)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            {t.brand}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
