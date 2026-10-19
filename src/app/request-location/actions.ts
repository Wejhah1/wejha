"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  REQUEST_IMAGES_BUCKET,
  REQUEST_MAX_FEATURES,
  REQUEST_MAX_PHOTOS,
  REQUEST_MIN_PHOTOS,
} from "@/lib/location-requests";
import type { LocationSetting } from "@/lib/types";

export type SubmitRequestResult = { ok: true } | { ok: false; error: "required" | "photos" | "generic" };

const SETTINGS: LocationSetting[] = ["indoor", "outdoor", "both"];

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function optionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

function parseList(formData: FormData, key: string) {
  try {
    const parsed = JSON.parse(String(formData.get(key) ?? "[]"));
    return Array.isArray(parsed) ? parsed.map((v) => String(v).trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

// Only accept photos uploaded to our own request bucket. Compared by host and
// path so a trailing slash in the configured Supabase URL can't reject them all.
function isRequestImageUrl(value: string) {
  try {
    const url = new URL(value);
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
    return (
      url.protocol === "https:" &&
      url.host === host &&
      url.pathname.startsWith(`/storage/v1/object/public/${REQUEST_IMAGES_BUCKET}/`)
    );
  } catch {
    return false;
  }
}

export async function submitLocationRequest(formData: FormData): Promise<SubmitRequestResult> {
  // Honeypot: real users never see or fill this field.
  if (String(formData.get("website") ?? "")) return { ok: true };

  const owner_name = text(formData, "owner_name", 120);
  const owner_phone = String(formData.get("owner_phone") ?? "").replace(/[^\d+]/g, "").slice(0, 20);
  const name_ar = text(formData, "name_ar", 150);
  if (owner_name.length < 2 || owner_phone.replace(/\D/g, "").length < 8 || name_ar.length < 2) {
    return { ok: false, error: "required" };
  }

  const image_urls = parseList(formData, "image_urls").filter(isRequestImageUrl).slice(0, REQUEST_MAX_PHOTOS);
  if (image_urls.length < REQUEST_MIN_PHOTOS) return { ok: false, error: "photos" };

  const settingRaw = String(formData.get("setting") ?? "both") as LocationSetting;
  const mapsUrl = text(formData, "maps_url", 500);

  const supabase = await createClient();
  const { error } = await supabase.from("location_requests").insert({
    owner_name,
    owner_phone,
    owner_email: text(formData, "owner_email", 200) || null,
    name_ar,
    name_en: text(formData, "name_en", 150) || null,
    category_id: text(formData, "category_id", 64) || null,
    city_id: text(formData, "city_id", 64) || null,
    district: text(formData, "district", 150) || null,
    maps_url: /^https?:\/\//.test(mapsUrl) ? mapsUrl : null,
    setting: SETTINGS.includes(settingRaw) ? settingRaw : "both",
    price_per_day: optionalNumber(formData, "price_per_day"),
    capacity: optionalNumber(formData, "capacity"),
    description: text(formData, "description", 2000) || null,
    features: parseList(formData, "features")
      .map((f) => f.slice(0, 80))
      .slice(0, REQUEST_MAX_FEATURES),
    image_urls,
  });

  if (error) {
    console.error("submitLocationRequest", error.message);
    return { ok: false, error: "generic" };
  }

  revalidatePath("/admin/requests");
  return { ok: true };
}
