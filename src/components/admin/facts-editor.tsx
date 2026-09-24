"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { DEFAULT_FACT_ICON, FACT_ICONS, getFactIcon } from "@/lib/fact-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location } from "@/lib/types";

interface FactRow {
  ar: string;
  en: string;
  icon: string;
}

function initialRows(location?: Location): FactRow[] {
  if (!location) return [{ ar: "", en: "", icon: DEFAULT_FACT_ICON }];
  const count = Math.max(location.facts_ar.length, location.facts_en.length);
  return Array.from({ length: count }, (_, i) => ({
    ar: location.facts_ar[i] ?? "",
    en: location.facts_en[i] ?? "",
    icon: location.fact_icons?.[i] || DEFAULT_FACT_ICON,
  }));
}

export function FactsEditor({ location }: { location?: Location }) {
  const [rows, setRows] = useState<FactRow[]>(() => initialRows(location));
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  const update = (index: number, patch: Partial<FactRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div className="flex flex-col gap-3">
      <Label>مميزات الموقع / Location features</Label>
      <input type="hidden" name="facts_json" value={JSON.stringify(rows)} />

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => {
          const Icon = getFactIcon(row.icon);
          return (
            <div key={i} className="rounded-xl border border-border/60 p-3">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => setPickerFor(pickerFor === i ? null : i)}
                  aria-label="Choose icon"
                  aria-expanded={pickerFor === i}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary transition-colors hover:bg-primary/25"
                >
                  <Icon className="h-5 w-5" />
                </button>
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                  <Input
                    dir="rtl"
                    placeholder="مثال: باركينج متاح"
                    value={row.ar}
                    onChange={(e) => update(i, { ar: e.target.value })}
                  />
                  <Input
                    dir="ltr"
                    placeholder="e.g. Parking available"
                    value={row.en}
                    onChange={(e) => update(i, { en: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => {
                    setRows((prev) => prev.filter((_, idx) => idx !== i));
                    setPickerFor(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {pickerFor === i && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                  {Object.entries(FACT_ICONS).map(([key, PickIcon]) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={key}
                      aria-pressed={row.icon === key}
                      onClick={() => {
                        update(i, { icon: key });
                        setPickerFor(null);
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                        row.icon === key
                          ? "border-transparent bg-foreground text-background"
                          : "border-border/60 hover:bg-accent"
                      }`}
                    >
                      <PickIcon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={() => setRows((prev) => [...prev, { ar: "", en: "", icon: DEFAULT_FACT_ICON }])}
      >
        <Plus className="h-4 w-4" />
        إضافة ميزة
      </Button>
    </div>
  );
}
