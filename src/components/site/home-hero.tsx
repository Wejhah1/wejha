"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { IntroReveal } from "@/components/motion/intro-reveal";
import { HeroContent } from "@/components/hero/hero-content";

export function HomeHero({ images = [] }: { images?: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden bg-neutral-950"
    >
      <IntroReveal onDone={() => setReady(true)} />

      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="absolute inset-0">
        {images[0] && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={images[0]}
              alt=""
              initial={{ scale: 1.04 }}
              animate={prefersReducedMotion ? undefined : { scale: 1.14 }}
              transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
            <div className="absolute inset-0 bg-neutral-950/25" />
          </>
        )}

        <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-center px-5 sm:px-8">
          <HeroContent ready={ready} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-1 text-white/50"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>

      <div id="hero-reveal-sentinel" className="pointer-events-none absolute inset-x-0 bottom-0 h-px" />
    </section>
  );
}
