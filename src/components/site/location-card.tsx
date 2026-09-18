"use client";

import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Location } from "@/lib/types";

export function LocationCard({
  location,
  view = "list",
}: {
  location: Location;
  view?: "list" | "grid";
}) {
  const { locale, t } = useLocale();
  const name = locale === "ar" ? location.name_ar : location.name_en;
  const categoryName = locale === "ar" ? location.category?.name_ar : location.category?.name_en;
  const cityName = locale === "ar" ? location.city?.name_ar : location.city?.name_en;

  const priceValue = location.price_per_day.toLocaleString(locale === "ar" ? "ar-SA" : "en-US");
  const isGrid = view === "grid";

  return (
    <TiltCard className="group h-full">
      <Link
        href={`/locations/${location.slug}`}
        className={`relative flex overflow-hidden transition-shadow duration-300 hover:shadow-md sm:flex-col sm:items-stretch sm:gap-0 sm:aspect-[3/4] sm:justify-end sm:rounded-3xl sm:bg-neutral-900 sm:p-0 sm:shadow-md sm:ring-0 sm:group-hover:shadow-2xl ${
          isGrid
            ? "aspect-[3/4] flex-col justify-end rounded-2xl bg-neutral-900 p-0 shadow-sm"
            : "items-stretch gap-3 rounded-2xl bg-card p-2.5 shadow-sm ring-1 ring-border/60"
        }`}
      >
        <div
          className={`overflow-hidden ${
            isGrid ? "absolute inset-0 h-full w-full rounded-none" : "relative h-24 w-24 shrink-0 rounded-xl"
          } sm:absolute sm:inset-0 sm:h-full sm:w-full sm:rounded-none`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={location.cover_image_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out sm:group-hover:scale-110"
          />
        </div>
        <div
          className={`${isGrid ? "block" : "hidden"} bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 sm:absolute sm:inset-0 sm:block sm:group-hover:from-black/90`}
        />

        {categoryName && (
          <span
            className={`${isGrid ? "block" : "hidden"} absolute start-2 top-2 z-10 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md transition-transform duration-300 sm:start-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs sm:group-hover:-translate-y-0.5`}
            style={{ transform: "translateZ(40px)" }}
          >
            {categoryName}
          </span>
        )}

        <div className={`${isGrid ? "hidden" : "flex"} min-w-0 flex-1 flex-col justify-center gap-1 py-0.5 sm:hidden`}>
          {categoryName && (
            <span className="text-xs font-semibold text-primary">{categoryName}</span>
          )}
          <h3 className="truncate text-base font-bold leading-snug text-foreground">{name}</h3>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
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
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-foreground">{priceValue}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {t.location.currency} / {t.browse.perDay}
            </span>
          </div>
        </div>

        <div
          className={`${isGrid ? "flex" : "hidden"} relative z-10 flex-col gap-0.5 p-3 text-white transition-transform duration-300 sm:hidden`}
        >
          <h3 className="truncate text-sm font-bold leading-snug drop-shadow-sm">{name}</h3>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/80">
            {cityName && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {cityName}
              </span>
            )}
          </div>
          <span className="text-xs font-extrabold">
            {priceValue} <span className="font-medium text-white/75">{t.location.currency}</span>
          </span>
        </div>

        <div
          className="relative z-10 hidden flex-col gap-2 p-5 text-white transition-transform duration-300 sm:flex sm:group-hover:-translate-y-1"
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
            <span className="text-lg font-extrabold">{priceValue}</span>
            <span className="text-sm font-medium text-white/75">
              {t.location.currency} / {t.browse.perDay}
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
