"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";
import { LocationCard } from "@/components/site/location-card";
import type { Location } from "@/lib/types";

export function FeaturedGrid({ locations }: { locations: Location[] }) {
  const { t } = useLocale();

  if (locations.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.home.featuredTitle}</h2>
        <Link href="/locations" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          {t.home.viewAll}
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </section>
  );
}
