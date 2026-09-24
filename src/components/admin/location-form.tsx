"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { CoverUploader, GalleryUploader } from "@/components/admin/image-uploader";
import { QuickAddCategory } from "@/components/admin/quick-add-category";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Category, City, Location } from "@/lib/types";

export function LocationForm({
  action,
  categories,
  cities,
  location,
}: {
  action: (formData: FormData) => void;
  categories: Category[];
  cities: City[];
  location?: Location;
}) {
  const { locale, t } = useLocale();
  const [cats, setCats] = useState(categories);
  const [categoryId, setCategoryId] = useState<string | undefined>(location?.category_id ?? undefined);

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name_ar">الاسم (عربي)</Label>
          <Input id="name_ar" name="name_ar" required defaultValue={location?.name_ar} dir="rtl" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name_en">Name (English)</Label>
          <Input id="name_en" name="name_en" required defaultValue={location?.name_en} dir="ltr" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label>{t.browse.category}</Label>
          <Select
            name="category_id"
            value={categoryId}
            onValueChange={(v) => setCategoryId(v ?? undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="—">
                {(v: string | null) => {
                  const match = v ? cats.find((c) => c.id === v) : null;
                  return match ? (locale === "ar" ? match.name_ar : match.name_en) : "—";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cats.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {locale === "ar" ? c.name_ar : c.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <QuickAddCategory
            onCreated={(c) => {
              setCats((prev) => [...prev, c]);
              setCategoryId(c.id);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t.browse.city}</Label>
          <Select name="city_id" defaultValue={location?.city_id ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="—">
                {(v: string | null) =>
                  (v && cities.find((c) => c.id === v)
                    ? locale === "ar"
                      ? cities.find((c) => c.id === v)!.name_ar
                      : cities.find((c) => c.id === v)!.name_en
                    : null) || "—"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {locale === "ar" ? c.name_ar : c.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>{t.browse.setting}</Label>
          <Select name="setting" defaultValue={location?.setting ?? "both"}>
            <SelectTrigger>
              <SelectValue>
                {(v: string) =>
                  ({
                    indoor: t.browse.settingIndoor,
                    outdoor: t.browse.settingOutdoor,
                    both: t.browse.settingBoth,
                  })[v] ?? v
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indoor">{t.browse.settingIndoor}</SelectItem>
              <SelectItem value="outdoor">{t.browse.settingOutdoor}</SelectItem>
              <SelectItem value="both">{t.browse.settingBoth}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price_per_day">{t.location.pricePerDay}</Label>
          <Input
            id="price_per_day"
            name="price_per_day"
            type="number"
            min={0}
            required
            defaultValue={location?.price_per_day}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="capacity">{t.location.capacity}</Label>
          <Input id="capacity" name="capacity" type="number" min={0} defaultValue={location?.capacity ?? ""} />
        </div>
      </div>

      <CoverUploader
        initialUrl={location?.cover_image_url}
        initialFocal={
          location ? { x: location.cover_focal_x, y: location.cover_focal_y } : undefined
        }
      />

      <GalleryUploader initialUrls={location?.gallery_urls} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="facts_ar">حقائق قصيرة (سطر لكل حقيقة، عربي)</Label>
          <Textarea
            id="facts_ar"
            name="facts_ar"
            rows={5}
            dir="rtl"
            placeholder={"داخلي وخارجي\nحتى 30 شخص\nباركينج متاح"}
            defaultValue={location?.facts_ar.join("\n")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="facts_en">Short facts (one per line, English)</Label>
          <Textarea
            id="facts_en"
            name="facts_en"
            rows={5}
            dir="ltr"
            placeholder={"Indoor & outdoor\nUp to 30 people\nParking available"}
            defaultValue={location?.facts_en.join("\n")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="whatsapp_number">WhatsApp number (with country code)</Label>
          <Input
            id="whatsapp_number"
            name="whatsapp_number"
            required
            dir="ltr"
            placeholder="9665XXXXXXXX"
            defaultValue={location?.whatsapp_number}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="whatsapp_contact_name">Contact name (optional)</Label>
          <Input
            id="whatsapp_contact_name"
            name="whatsapp_contact_name"
            defaultValue={location?.whatsapp_contact_name ?? ""}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="is_published" name="is_published" defaultChecked={location?.is_published} />
        <Label htmlFor="is_published">{t.admin.published}</Label>
      </div>

      <Button type="submit" size="lg" className="w-fit">
        {location ? t.admin.edit : t.admin.addLocation}
      </Button>
    </form>
  );
}
