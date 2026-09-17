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

      <div className="overflow-x-auto rounded-2xl border border-border/60">
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
