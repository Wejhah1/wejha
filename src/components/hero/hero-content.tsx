"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import { EASE_OUT } from "@/lib/motion";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

export function HeroContent({ ready }: { ready: boolean }) {
  const { t, dir } = useLocale();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={containerVariants}
      className="relative mx-auto flex max-w-5xl flex-col items-center px-4 text-center"
    >
      <motion.div variants={itemVariants} className="mb-5 flex items-center gap-3">
        <span className="h-px w-8 bg-white/50" />
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
          {t.hero.kicker}
        </span>
        <span className="h-px w-8 bg-white/50" />
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white text-balance sm:text-5xl sm:leading-[1.1] lg:text-[3.4rem]"
      >
        {t.hero.title}
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg"
      >
        {t.hero.subtitle}
      </motion.p>

      <motion.div variants={itemVariants} className="mt-9">
        <Button
          size="lg"
          nativeButton={false}
          className="gap-2 text-base"
          render={
            <Link href="/locations">
              {t.hero.cta}
              <Arrow className="h-4 w-4" />
            </Link>
          }
        />
      </motion.div>
    </motion.div>
  );
}
