"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Users, Building2, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { ParallaxImage } from "@/components/motion/parallax-image";
import type { Location } from "@/lib/types";

export function LocationHero({ location }: { location: Location }) {
  const { locale, t, dir } = useLocale();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;
  const containerRef = useRef<HTMLDivElement>(null);

  const name = locale === "ar" ? location.name_ar : location.name_en;
  const cityName = locale === "ar" ? location.city?.name_ar : location.city?.name_en;
  const categoryName = locale === "ar" ? location.category?.name_ar : location.category?.name_en;
  const facts = locale === "ar" ? location.facts_ar : location.facts_en;

  const settingLabel = {
    indoor: t.browse.settingIndoor,
    outdoor: t.browse.settingOutdoor,
    both: t.browse.settingBoth,
  }[location.setting];

  // A slow mouse-parallax on the floating fact chips, so the header feels like
  // a layered HUD sitting above the photo rather than flat text on an image.
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 60, damping: 20, mass: 0.6 };
  const chipX = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springConfig);
  const chipY = useSpring(useTransform(mouseY, [0, 1], [-6, 6]), springConfig);
  const titleX = useSpring(useTransform(mouseX, [0, 1], [6, -6]), springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative -mt-px h-[62vh] min-h-[420px] w-full overflow-hidden bg-neutral-900"
      style={{ perspective: 1200 }}
    >
      <ParallaxImage src={location.cover_image_url} alt={name} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 z-20 w-full px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <Link
            href="/locations"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <BackArrow className="h-4 w-4" />
            {t.location.backToBrowse}
          </Link>
        </div>
      </motion.div>

      {facts.length > 0 && (
        <motion.div
          style={{ x: chipX, y: chipY, transformStyle: "preserve-3d" }}
          className="absolute end-4 top-24 z-20 hidden max-w-[240px] flex-col items-end gap-2 sm:end-6 sm:flex lg:end-8"
        >
          {facts.slice(0, 4).map((fact, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: dir === "rtl" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md"
              style={{ transform: `translateZ(${20 + i * 10}px)` }}
            >
              <CheckCircle2 className="h-3 w-3 shrink-0 text-white/80" />
              {fact}
            </motion.span>
          ))}
        </motion.div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-8 sm:px-6 lg:px-8">
        <motion.div style={{ x: titleX }} className="mx-auto max-w-6xl">
          {categoryName && (
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md"
            >
              {categoryName}
            </motion.span>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-md sm:text-5xl"
          >
            {name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/85"
          >
            {cityName && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {cityName}
              </span>
            )}
            {location.capacity && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {location.capacity} {t.location.people}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {settingLabel}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
