"use client";

import Link from "next/link";
import { Camera, Home, Trees, Landmark, Coffee, Factory, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Category } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  camera: Camera,
  home: Home,
  trees: Trees,
  landmark: Landmark,
  coffee: Coffee,
  factory: Factory,
};

export function CategoryRail({ categories }: { categories: Category[] }) {
  const { locale, t } = useLocale();

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold">{t.home.categoriesTitle}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = (category.icon && ICONS[category.icon]) || Sparkles;
          const name = locale === "ar" ? category.name_ar : category.name_en;
          return (
            <Link
              key={category.id}
              href={`/locations?category=${category.slug}`}
              className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-border/60 px-6 py-4 transition-colors hover:border-foreground/30 hover:bg-accent"
            >
              <Icon className="h-6 w-6" />
              <span className="whitespace-nowrap text-sm font-medium">{name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
