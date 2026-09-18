"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";

const INTRO_KEY = "wejha-intro-seen";

function useIntro() {
  const [showLoader, setShowLoader] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    let seen = true;
    let reduced = true;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      // storage/matchMedia unavailable — skip the loader
    }

    if (seen || reduced) {
      setContentReady(true);
      return;
    }

    setShowLoader(true);
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  return { showLoader, contentReady, onLoaderDone: () => setContentReady(true) };
}

function IntroLoader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    let raf = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(progress * 100));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setVisible(false), 200);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#1a1310]"
        >
          <span className="font-heading text-lg tracking-[0.2em] text-white/70">وجهة</span>
          <span className="font-heading text-4xl font-semibold text-white tabular-nums">
            {count}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

function StaggeredTitle({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.07 }}
      className="max-w-2xl text-4xl font-semibold leading-[1.2] tracking-tight text-white sm:text-5xl lg:text-6xl"
    >
      {words.map((word, i) => (
        <span key={i}>
          <motion.span variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.h1>
  );
}

export function HomeHero() {
  const { t, dir } = useLocale();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const sectionRef = useRef<HTMLElement>(null);
  const { showLoader, contentReady, onLoaderDone } = useIntro();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const panelScale = useTransform(scrollYProgress, [0.35, 1], [1, 0.88]);
  const panelRadius = useTransform(scrollYProgress, [0.35, 1], [0, 48]);
  const contentOpacity = useTransform(scrollYProgress, [0.3, 0.75], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <>
      {showLoader && <IntroLoader onDone={onLoaderDone} />}

      <section ref={sectionRef} className="relative h-[170vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            style={{ scale: panelScale, borderRadius: panelRadius }}
            className="absolute inset-0 overflow-hidden bg-[#1a1310]"
          >
            <div className="absolute inset-0">
              <motion.div
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -start-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-[oklch(0.56_0.15_35)] opacity-25 blur-[110px]"
              />
              <motion.div
                animate={{ x: [0, -24, 0], y: [0, 26, 0] }}
                transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -end-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.58_0.09_120)] opacity-20 blur-[110px]"
              />
              <motion.div
                animate={{ x: [0, 18, 0], y: [0, -16, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-10rem] start-1/4 h-[26rem] w-[26rem] rounded-full bg-[oklch(0.7_0.1_75)] opacity-15 blur-[100px]"
              />
            </div>

            <motion.div
              style={{ opacity: contentOpacity }}
              className="pointer-events-none relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8"
            >
              {contentReady && <StaggeredTitle text={t.hero.title} />}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={contentReady ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 max-w-xl text-lg text-white/75"
              >
                {t.hero.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={contentReady ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto mt-8"
              >
                <Button
                  size="lg"
                  nativeButton={false}
                  className="gap-2 rounded-full text-base"
                  render={
                    <Link href="/locations">
                      {t.hero.cta}
                      <Arrow className="h-4 w-4" />
                    </Link>
                  }
                />
              </motion.div>
            </motion.div>

            <motion.div
              style={{ opacity: hintOpacity }}
              className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-1 text-white/60"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
