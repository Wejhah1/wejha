"use client";

import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Location } from "@/lib/types";

export function LocationCard({ location }: { location: Location }) {
  const { locale, t } = useLocale();
  const name = locale === "ar" ? location.name_ar : location.name_en;
  const categoryName = locale === "ar" ? location.category?.name_ar : location.category?.name_en;
  const cityName = locale === "ar" ? location.city?.name_ar : location.city?.name_en;

  return (
    <TiltCard className="group h-full">
      <Link
        href={`/locations/${location.slug}`}
        className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 shadow-md transition-shadow duration-300 group-hover:shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={location.cover_image_url}
          alt={name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

        {categoryName && (
          <span
            className="absolute start-4 top-4 z-10 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-0.5"
            style={{ transform: "translateZ(40px)" }}
          >
            {categoryName}
          </span>
        )}

        <div
          className="relative z-10 flex flex-col gap-2 p-5 text-white transition-transform duration-300 group-hover:-translate-y-1"
          style={{ transform: "translateZ(30px)" }}
        >
          <h3 className="text-xl font-bold leading-snug drop-shadow-sm">{name}</h3>

          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            {cityName && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {cityName}
              </span>
            )}
            {location.capacity && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {location.capacity} {t.location.people}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-extrabold">
              {location.price_per_day.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
            </span>
            <span className="text-sm font-medium text-white/75">
              {t.location.currency} / {t.browse.perDay}
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
