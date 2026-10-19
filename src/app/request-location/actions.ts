"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import {
  REQUEST_IMAGES_BUCKET,
  REQUEST_MAX_FEATURES,
  REQUEST_MAX_PHOTOS,
  REQUEST_MIN_PHOTOS,
} from "@/lib/location-requests";
import type { LocationRequestStatus, LocationSetting } from "@/lib/types";

export type SubmitRequestResult =
  | { ok: true; id: string | null }
  | { ok: false; error: "required" | "photos" | "generic" };

export interface MyRequestStatus {
  id: string;
  name_ar: string;
  status: LocationRequestStatus;
  admin_note: string | null;
  location_slug: string | null;
  created_at: string;
  decided_at: string | null;
}

const SETTINGS: LocationSetting[] = ["indoor", "outdoor", "both"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

const OTHER = "other";

// A chip from the list (a UUID) or "other" plus a typed name; null when neither is valid.
function pick(formData: FormData, idKey: string, otherKey: string) {
  const value = text(formData, idKey, 64);
  if (value === OTHER) {
    const other = text(formData, otherKey, 60);
    return other.length >= 2 ? { [idKey]: null, [otherKey]: other } : null;
  }
  return UUID.test(value) ? { [idKey]: value, [otherKey]: null } : null;
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
    const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    return (
      url.protocol === supabase.protocol &&
      url.host === supabase.host &&
      url.pathname.startsWith(`/storage/v1/object/public/${REQUEST_IMAGES_BUCKET}/`)
    );
  } catch {
    return false;
  }
}

export async function submitLocationRequest(formData: FormData): Promise<SubmitRequestResult> {
  // Honeypot: real users never see or fill this field.
  if (String(formData.get("website") ?? "")) return { ok: true, id: null };

  const category = pick(formData, "category_id", "category_other");
  const city = pick(formData, "city_id", "city_other");
  if (!category || !city) return { ok: false, error: "required" };

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

  // Generated here because visitors can't read the row back after inserting
  // it; the browser keeps this id to look up the request's status later.
  const id = crypto.randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.from("location_requests").insert({
    id,
    owner_name,
    owner_phone,
    owner_email: text(formData, "owner_email", 200) || null,
    name_ar,
    name_en: text(formData, "name_en", 150) || null,
    ...category,
    ...city,
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
  return { ok: true, id };
}

// Status of requests submitted from this device (ids kept in localStorage).
export async function getMyRequestStatuses(ids: string[]): Promise<MyRequestStatus[]> {
  const valid = ids.filter((id) => UUID.test(id)).slice(0, 20);
  if (!valid.length) return [];

  const { data, error } = await createPublicClient().rpc("get_location_request_statuses", {
    request_ids: valid,
  });
  if (error) {
    console.error("getMyRequestStatuses", error.message);
    return [];
  }
  return (data ?? []) as MyRequestStatus[];
}
