"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Location } from "@/lib/types";

export function LocationCard({ location }: { location: Location }) {
  const { locale } = useLocale();
  const name = locale === "ar" ? location.name_ar : location.name_en;
  const categoryName = locale === "ar" ? location.category?.name_ar : location.category?.name_en;
  const cityName = locale === "ar" ? location.city?.name_ar : location.city?.name_en;

  return (
    <TiltCard className="group h-full">
      <Link
        href={`/locations/${location.slug}`}
        className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-neutral-900 transition-shadow duration-500 group-hover:shadow-2xl sm:rounded-3xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={location.cover_image_url}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/85" />

        <div
          className="relative z-10 flex flex-col gap-1 p-3 text-white transition-transform duration-500 ease-out group-hover:-translate-y-1.5 sm:gap-1.5 sm:p-5"
          style={{ transform: "translateZ(30px)" }}
        >
          {categoryName && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 sm:text-xs">
              {categoryName}
            </span>
          )}
          <h3 className="text-sm font-bold leading-snug drop-shadow-sm sm:text-xl">{name}</h3>

          <div className="mt-0.5 flex items-center justify-between gap-2 sm:mt-1.5">
            {cityName && (
              <span className="flex items-center gap-1 text-xs text-white/70 sm:text-sm">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {cityName}
              </span>
            )}
            <span className="text-xs font-semibold text-white/90 sm:text-sm">
              {location.price_per_day.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
