"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCity } from "@/app/admin/(protected)/actions";
import type { City } from "@/lib/types";

export function QuickAddCity({
  onCreated,
  suggestion,
}: {
  onCreated: (city: City) => void;
  // A city the location owner suggested: opens the form pre-filled with it.
  suggestion?: string | null;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(!!suggestion);
  const [nameAr, setNameAr] = useState(suggestion ?? "");
  const [nameEn, setNameEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        {t.admin.newCity}
      </button>
    );
  }

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        onCreated(await createCity(nameAr, nameEn));
        setNameAr("");
        setNameEn("");
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 p-3">
      <Input placeholder="الاسم (عربي)" dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
      <Input placeholder="Name (English)" dir="ltr" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isPending || !nameAr.trim() || !nameEn.trim()} onClick={submit}>
          {t.admin.addCity}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t.admin.cancel}
        </Button>
      </div>
    </div>
  );
}
