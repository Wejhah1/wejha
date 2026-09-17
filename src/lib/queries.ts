import { createClient } from "@/lib/supabase/server";
import type { Location, LocationSetting } from "@/lib/types";

export interface LocationFilters {
  category?: string;
  city?: string;
  setting?: LocationSetting;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
}

const LOCATION_SELECT = "*, category:categories(*), city:cities(*)";

export async function getPublishedLocations(filters: LocationFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("locations")
    .select(LOCATION_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (filters.setting) query = query.eq("setting", filters.setting);
  if (filters.minPrice !== undefined) query = query.gte("price_per_day", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price_per_day", filters.maxPrice);
  if (filters.minCapacity !== undefined) query = query.gte("capacity", filters.minCapacity);

  const { data, error } = await query;
  if (error) throw error;

  let results = (data ?? []) as unknown as Location[];

  // category/city are embedded relations, so slug filters are applied here
  // rather than via PostgREST's eq() on the parent query.
  if (filters.category) {
    results = results.filter((l) => l.category?.slug === filters.category);
  }
  if (filters.city) {
    results = results.filter((l) => l.city?.slug === filters.city);
  }

  return results;
}

export async function getFeaturedLocations(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select(LOCATION_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Location[];
}

export async function getLocationBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select(LOCATION_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Location | null;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name_ar");
  if (error) throw error;
  return data ?? [];
}

export async function getCities() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cities").select("*").order("name_ar");
  if (error) throw error;
  return data ?? [];
}
