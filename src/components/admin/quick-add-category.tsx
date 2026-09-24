"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory } from "@/app/admin/(protected)/actions";
import type { Category } from "@/lib/types";

export function QuickAddCategory({ onCreated }: { onCreated: (category: Category) => void }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [icon, setIcon] = useState("sparkles");
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
        {t.admin.newCategory}
      </button>
    );
  }

  const submit = () => {
    setError(null);
    const formData = new FormData();
    formData.set("name_ar", nameAr);
    formData.set("name_en", nameEn);
    formData.set("icon", icon);
    startTransition(async () => {
      try {
        const created = await createCategory(formData);
        onCreated(created);
        setNameAr("");
        setNameEn("");
        setIcon("sparkles");
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
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setIcon(key)}
            aria-label={key}
            aria-pressed={icon === key}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              icon === key ? "border-transparent bg-foreground text-background" : "border-border/60 hover:bg-accent"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isPending || !nameAr.trim() || !nameEn.trim()} onClick={submit}>
          {t.admin.addCategory}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t.admin.cancel}
        </Button>
      </div>
    </div>
  );
}
