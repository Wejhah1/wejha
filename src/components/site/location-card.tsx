"use client";

import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Location } from "@/lib/types";

export function LocationCard({ location }: { location: Location }) {
  const { locale, t } = useLocale();
  const name = locale === "ar" ? location.name_ar : location.name_en;
  const categoryName = locale === "ar" ? location.category?.name_ar : location.category?.name_en;
  const cityName = locale === "ar" ? location.city?.name_ar : location.city?.name_en;

  return (
    <Link
      href={`/locations/${location.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={location.cover_image_url}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {categoryName && (
          <Badge className="absolute start-3 top-3 bg-background/90 text-foreground shadow-sm">
            {categoryName}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-bold leading-snug">{name}</h3>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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

        <div className="mt-auto flex items-baseline gap-1 pt-2">
          <span className="text-xl font-extrabold text-brand-foreground">
            {location.price_per_day.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {t.location.currency} / {t.browse.perDay}
          </span>
        </div>
      </div>
    </Link>
  );
}
