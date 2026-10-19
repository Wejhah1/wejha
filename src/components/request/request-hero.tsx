"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowDown, BadgeCheck, Images, LayoutTemplate, MessageCircle, PlayCircle, UserRound, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";

const ease = [0.16, 1, 0.3, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const PERK_ICONS = [LayoutTemplate, MessageCircle, BadgeCheck];
const STEP_ICONS = [UserRound, MapPin, Images];

export function RequestHero({ onStart, onShowGuide }: { onStart: () => void; onShowGuide: () => void }) {
  const { t } = useLocale();
  const r = t.request;

  return (
    <section className="px-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1a1310] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -start-24 -top-24 h-[26rem] w-[26rem] bg-[radial-gradient(closest-side,oklch(0.56_0.15_35),transparent)] opacity-30"
          />
          <motion.div
            animate={{ x: [0, -24, 0], y: [0, 26, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -end-20 bottom-[-6rem] h-[24rem] w-[24rem] bg-[radial-gradient(closest-side,oklch(0.58_0.09_120),transparent)] opacity-25"
          />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative grid gap-12 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-14">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.09 }}
            className="flex flex-col items-start"
          >
            <motion.span
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.75_0.15_55)]" />
              {r.eyebrow}
            </motion.span>
            <motion.h1
              variants={item}
              className="mt-5 max-w-xl text-3xl font-semibold leading-[1.25] tracking-tight sm:text-5xl"
            >
              {r.title}
            </motion.h1>
            <motion.p variants={item} className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
              {r.subtitle}
            </motion.p>
            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onStart} className="h-11 gap-2 rounded-full px-6 text-base">
                {r.start}
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={onShowGuide}
                className="h-11 gap-2 rounded-full px-5 text-base text-white/85 hover:bg-white/10 hover:text-white"
              >
                <PlayCircle className="h-4 w-4" />
                {r.howItWorks}
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative mx-auto w-full max-w-sm">
            {r.guide.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: [-3, 2, -1.5][i] }}
                  transition={{ duration: 0.8, delay: 0.35 + i * 0.15, ease }}
                  className={i === 0 ? "relative" : "relative -mt-3"}
                  style={{ marginInlineStart: `${i * 1.75}rem`, zIndex: 3 - i }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/30 backdrop-blur-md"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-white/50">
                        {r.guide.stepOf.replace("{n}", String(i + 1)).replace("{total}", "3")}
                      </p>
                      <p className="truncate font-semibold">{step.title}</p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.1, delayChildren: 0.6 }}
          className="relative grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3"
        >
          {r.perks.map((perk, i) => {
            const Icon = PERK_ICONS[i];
            return (
              <motion.div key={i} variants={item} className="flex gap-3 bg-[#1a1310] px-6 py-5 sm:px-8">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.75_0.15_55)]" />
                <div>
                  <p className="text-sm font-semibold">{perk.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{perk.body}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
