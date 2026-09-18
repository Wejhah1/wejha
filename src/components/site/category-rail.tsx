"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n/locale-context";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { EASE_OUT } from "@/lib/motion";
import type { Category, Location } from "@/lib/types";

export function CategoryRail({
  categories,
  locations,
}: {
  categories: Category[];
  locations: Location[];
}) {
  const { locale, t } = useLocale();

  if (categories.length === 0) return null;

  return (
    <section className="bg-neutral-950 py-14 lg:py-20">
      <Reveal className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">{t.home.categoriesTitle}</h2>
      </Reveal>
      <RevealGroup className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:gap-5 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const name = locale === "ar" ? category.name_ar : category.name_en;
          const cover = locations.find((l) => l.category_id === category.id)?.cover_image_url;

          return (
            <RevealItem key={category.id} className="shrink-0 snap-start">
              <Link
                href={`/locations?category=${category.slug}`}
                className="group relative flex h-64 w-48 items-end overflow-hidden rounded-2xl bg-neutral-900 sm:h-80 sm:w-60"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <motion.img
                    src={cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

                <span
                  className="relative z-10 p-4 text-lg font-bold text-white transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:p-5"
                  style={{ transitionTimingFunction: `cubic-bezier(${EASE_OUT.join(",")})` }}
                >
                  {name}
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
