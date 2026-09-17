"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import { ParallaxImage } from "@/components/motion/parallax-image";

const Hero3DGallery = dynamic(
  () => import("@/components/motion/hero-3d-gallery").then((m) => m.Hero3DGallery),
  { ssr: false },
);

function use3DEligible() {
  // Starts false to match the server-rendered (flat image) markup, then
  // upgrades to the 3D canvas after mount once we can read matchMedia —
  // reading it during the initial client render would desync from SSR.
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isWideEnough = window.matchMedia("(min-width: 768px)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from matchMedia on mount, not a derived-state loop
    setEligible(!prefersReducedMotion && isWideEnough);
  }, []);

  return eligible;
}

export function HomeHero({ locations }: { locations: { slug: string; cover_image_url: string }[] }) {
  const { t, dir } = useLocale();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const show3D = use3DEligible();
  const fallbackImage = locations[0]?.cover_image_url;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[560px] overflow-hidden bg-neutral-950">
      <motion.div style={{ opacity: contentOpacity, y: contentY }} className="absolute inset-0">
        <div className="absolute inset-0">
          {!show3D && fallbackImage && (
            <ParallaxImage src={fallbackImage} alt="" className="h-full w-full opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/20" />
        </div>

        {show3D && (
          <div className="absolute inset-0">
            <Hero3DGallery
              images={locations.map((l) => ({ slug: l.slug, url: l.cover_image_url }))}
            />
          </div>
        )}

        <div className="pointer-events-none relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-24 pt-32 sm:px-6 lg:px-8">
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
            className="pointer-events-auto mt-8 w-fit"
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-1 text-white/70"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
