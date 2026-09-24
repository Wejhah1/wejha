"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteLocation, togglePublish } from "@/app/admin/(protected)/actions";
import type { Location } from "@/lib/types";

export function AdminLocationsTable({ locations }: { locations: Location[] }) {
  const { locale, t } = useLocale();
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t.admin.locations}</h1>
        <Button
          nativeButton={false}
          render={<Link href="/admin/locations/new">{t.admin.addLocation}</Link>}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
        {locations.map((location) => (
          <div
            key={location.id}
            className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/60"
          >
            <div className="relative aspect-[16/10] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={location.cover_image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: `${location.cover_focal_x}% ${location.cover_focal_y}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span
                className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md ${
                  location.is_published ? "bg-emerald-500/90 text-white" : "bg-black/50 text-white"
                }`}
              >
                {location.is_published ? t.admin.published : t.admin.draft}
              </span>
              <div className="absolute inset-x-3 bottom-3 text-white">
                <p className="truncate text-base font-bold drop-shadow-sm">
                  {locale === "ar" ? location.name_ar : location.name_en}
                </p>
                <p className="truncate text-xs text-white/85">
                  {locale === "ar" ? location.city?.name_ar : location.city?.name_en}
                  {" · "}
                  {location.price_per_day.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}{" "}
                  {t.location.currency}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3">
              <label className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={location.is_published}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    startTransition(() => togglePublish(location.id, checked))
                  }
                />
                {t.admin.published}
              </label>
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link href={`/admin/locations/${location.id}`}>
                    <Pencil className="h-4 w-4" />
                    {t.admin.edit}
                  </Link>
                }
              />
              <Button
                variant="outline"
                size="icon"
                disabled={isPending}
                aria-label={t.admin.delete}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm(locale === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) {
                    startTransition(() => deleteLocation(location.id));
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border/60 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === "ar" ? "الاسم" : "Name"}</TableHead>
              <TableHead>{locale === "ar" ? "المدينة" : "City"}</TableHead>
              <TableHead>{locale === "ar" ? "السعر" : "Price"}</TableHead>
              <TableHead>{t.admin.published}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">
                  {locale === "ar" ? location.name_ar : location.name_en}
                </TableCell>
                <TableCell>{locale === "ar" ? location.city?.name_ar : location.city?.name_en}</TableCell>
                <TableCell>{location.price_per_day}</TableCell>
                <TableCell>
                  <Switch
                    checked={location.is_published}
                    disabled={isPending}
                    onCheckedChange={(checked) =>
                      startTransition(() => togglePublish(location.id, checked))
                    }
                  />
                </TableCell>
                <TableCell className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={
                      <Link href={`/admin/locations/${location.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => {
                      if (confirm(locale === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) {
                        startTransition(() => deleteLocation(location.id));
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
