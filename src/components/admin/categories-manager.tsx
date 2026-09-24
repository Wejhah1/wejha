"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CATEGORY_ICONS, getCategoryIcon } from "@/lib/category-icons";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, deleteCategory } from "@/app/admin/(protected)/actions";
import type { Category } from "@/lib/types";

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const { locale, t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [icon, setIcon] = useState("sparkles");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleCreate = (formData: FormData) => {
    formData.set("icon", icon);
    setError(null);
    startTransition(async () => {
      try {
        await createCategory(formData);
        formRef.current?.reset();
        setIcon("sparkles");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold">{t.admin.categories}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.categoriesHint}</p>
      </div>

      <form
        ref={formRef}
        action={handleCreate}
        className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4 sm:p-5"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat_name_ar">الاسم (عربي)</Label>
            <Input id="cat_name_ar" name="name_ar" required dir="rtl" placeholder="مثال: مقهى" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat_name_en">Name (English)</Label>
            <Input id="cat_name_en" name="name_en" required dir="ltr" placeholder="e.g. Cafe" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t.admin.icon}</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                aria-label={key}
                aria-pressed={icon === key}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                  icon === key
                    ? "border-transparent bg-foreground text-background"
                    : "border-border/60 hover:bg-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending} className="w-fit">
          <Plus className="h-4 w-4" />
          {t.admin.addCategory}
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          return (
            <div
              key={category.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {locale === "ar" ? category.name_ar : category.name_en}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {locale === "ar" ? category.name_en : category.name_ar}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                aria-label={t.admin.delete}
                onClick={() => {
                  if (confirm(t.admin.deleteCategoryConfirm)) {
                    startTransition(() => deleteCategory(category.id));
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
