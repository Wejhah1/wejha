"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Images, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";

const STEP_ICONS = [UserRound, MapPin, Images];
const ease = [0.16, 1, 0.3, 1] as const;

export function RequestGuide({ open, onClose }: { open: boolean; onClose: (startForm: boolean) => void }) {
  const { t, dir } = useLocale();
  const g = t.request.guide;
  const total = g.steps.length;
  const [[step, direction], setStep] = useState<[number, number]>([0, 1]);

  const go = (next: number) => setStep([next, next > step ? 1 : -1]);
  const isLast = step === total - 1;
  const current = g.steps[step];
  const Icon = STEP_ICONS[step];
  // "Forward" travels toward the reading direction's end: leftward in RTL.
  const offset = (d: number) => d * (dir === "rtl" ? -60 : 60);
  const Next = dir === "rtl" ? ArrowLeft : ArrowRight;
  const Prev = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose(false);
      }}
      onOpenChangeComplete={(next) => {
        if (!next) setStep([0, 1]);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[#1a1310]/60 backdrop-blur-sm duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          dir={dir}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-card text-card-foreground shadow-2xl ring-1 ring-foreground/10 outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90 data-open:slide-in-from-bottom-4 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div className="relative flex h-44 items-center justify-center overflow-hidden bg-[#1a1310]">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-56 w-56 rounded-full bg-[oklch(0.56_0.15_35)] blur-[70px]"
            />
            {[0, 1].map((ring) => (
              <motion.span
                key={ring}
                aria-hidden
                initial={{ scale: 0.6, opacity: 0.5 }}
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 2.4, repeat: Infinity, delay: ring * 1.2, ease: "easeOut" }}
                className="absolute h-20 w-20 rounded-full border border-white/40"
              />
            ))}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={step}
                initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.4, rotate: 25, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-black/40"
              >
                <Icon className="h-9 w-9" />
              </motion.span>
            </AnimatePresence>
            <DialogPrimitive.Close
              render={
                <button
                  type="button"
                  className="absolute end-4 top-4 rounded-full px-3 py-1 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                />
              }
            >
              {g.skip}
            </DialogPrimitive.Close>
          </div>

          <div className="px-6 pt-6 pb-5 sm:px-8">
            <div className="mb-4 flex items-center gap-1.5" aria-hidden>
              {g.steps.map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ width: i === step ? 28 : 8 }}
                  transition={{ duration: 0.4, ease }}
                  className={`h-2 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
              <span className="ms-auto text-xs font-medium text-muted-foreground">
                {g.stepOf.replace("{n}", String(step + 1)).replace("{total}", String(total))}
              </span>
            </div>

            <div className="relative min-h-[13.5rem]">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ x: offset(d), opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: offset(-d), opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease }}
                >
                  <DialogPrimitive.Title className="font-heading text-xl font-semibold">
                    {current.title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {current.body}
                  </DialogPrimitive.Description>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {current.points.map((point, i) => (
                      <motion.li
                        key={point}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease }}
                        className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5 text-sm font-medium"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => go(step - 1)}
                className={`h-10 gap-1.5 rounded-full px-4 ${step === 0 ? "invisible" : ""}`}
              >
                <Prev className="h-4 w-4" />
                {g.back}
              </Button>
              <Button
                onClick={() => (isLast ? onClose(true) : go(step + 1))}
                className="h-10 gap-1.5 rounded-full px-5"
              >
                {isLast ? g.done : g.next}
                {isLast ? <Check className="h-4 w-4" /> : <Next className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
