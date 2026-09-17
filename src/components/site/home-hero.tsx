"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import { ParallaxImage } from "@/components/motion/parallax-image";

export function HomeHero({ coverImage }: { coverImage?: string }) {
  const { t, dir } = useLocale();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {coverImage ? (
          <ParallaxImage src={coverImage} alt="" className="h-full w-full" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neutral-900 to-neutral-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/40" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-4xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl"
        >
          {t.hero.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-xl text-lg text-white/85"
        >
          {t.hero.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
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
      </div>
    </section>
  );
}
