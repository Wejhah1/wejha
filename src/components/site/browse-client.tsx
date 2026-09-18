"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { LocationCard } from "@/components/site/location-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Category, City, Location } from "@/lib/types";

interface ActiveFilters {
  category?: string;
  city?: string;
  setting?: string;
  minPrice?: string;
  maxPrice?: string;
  minCapacity?: string;
}

export function BrowseClient({
  locations,
  categories,
  cities,
  activeFilters,
}: {
  locations: Location[];
  categories: Category[];
  cities: City[];
  activeFilters: ActiveFilters;
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = useState<ActiveFilters>(activeFilters);
  const [open, setOpen] = useState(false);

  const apply = (next: ActiveFilters) => {
    const query = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    router.push(`${pathname}?${query.toString()}`);
    setOpen(false);
  };

  const clear = () => {
    setDraft({});
    router.push(pathname);
    setOpen(false);
  };

  const categoryLabel = (value: string) => {
    if (value === "all") return t.browse.settingAll;
    const match = categories.find((c) => c.slug === value);
    return match ? (locale === "ar" ? match.name_ar : match.name_en) : value;
  };

  const cityLabel = (value: string) => {
    if (value === "all") return t.browse.settingAll;
    const match = cities.find((c) => c.slug === value);
    return match ? (locale === "ar" ? match.name_ar : match.name_en) : value;
  };

  const settingLabel = (value: string) =>
    ({
      all: t.browse.settingAll,
      indoor: t.browse.settingIndoor,
      outdoor: t.browse.settingOutdoor,
      both: t.browse.settingBoth,
    })[value] ?? value;

  const filterBody = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>{t.browse.category}</Label>
        <Select
          value={draft.category ?? "all"}
          onValueChange={(v) =>
            setDraft((d) => ({ ...d, category: !v || v === "all" ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue>{(v: string) => categoryLabel(v ?? "all")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.browse.settingAll}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {locale === "ar" ? c.name_ar : c.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t.browse.city}</Label>
        <Select
          value={draft.city ?? "all"}
          onValueChange={(v) =>
            setDraft((d) => ({ ...d, city: !v || v === "all" ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue>{(v: string) => cityLabel(v ?? "all")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.browse.settingAll}</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {locale === "ar" ? c.name_ar : c.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t.browse.setting}</Label>
        <Select
          value={draft.setting ?? "all"}
          onValueChange={(v) =>
            setDraft((d) => ({ ...d, setting: !v || v === "all" ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue>{(v: string) => settingLabel(v ?? "all")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.browse.settingAll}</SelectItem>
            <SelectItem value="indoor">{t.browse.settingIndoor}</SelectItem>
            <SelectItem value="outdoor">{t.browse.settingOutdoor}</SelectItem>
            <SelectItem value="both">{t.browse.settingBoth}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t.browse.priceRange}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="0"
            value={draft.minPrice ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value || undefined }))}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="∞"
            value={draft.maxPrice ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value || undefined }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t.browse.capacity}</Label>
        <Input
          type="number"
          placeholder="0"
          value={draft.minCapacity ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, minCapacity: e.target.value || undefined }))}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button className="flex-1" onClick={() => apply(draft)}>
          {t.browse.apply}
        </Button>
        <Button variant="outline" onClick={clear}>
          {t.browse.clear}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-10 flex items-end justify-between border-b border-border/60 pb-6 sm:mb-14">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.browse.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {locations.length} {t.browse.resultsCount}
          </p>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="gap-2 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                {t.browse.filters}
              </Button>
            }
          />
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-6">
            <SheetHeader className="p-0">
              <SheetTitle>{t.browse.filters}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{filterBody}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border/60 p-6">{filterBody}</div>
        </aside>

        <div>
          {locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center text-muted-foreground">
              {t.browse.noResults}
            </div>
          ) : (
            <RevealGroup className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
              {locations.map((location) => (
                <RevealItem key={location.id}>
                  <LocationCard location={location} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </div>
    </div>
  );
}
