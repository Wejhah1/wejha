"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole, Category, LocationSetting } from "@/lib/types";

function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

function clampPercent(value: FormDataEntryValue | null) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 50;
}

function parseLocationForm(formData: FormData) {
  let factRows: { ar?: unknown; en?: unknown; icon?: unknown }[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("facts_json") ?? "[]"));
    if (Array.isArray(parsed)) factRows = parsed;
  } catch {}
  const facts = factRows
    .map((r) => ({
      ar: String(r.ar ?? "").trim(),
      en: String(r.en ?? "").trim(),
      icon: String(r.icon ?? "check"),
    }))
    .filter((r) => r.ar || r.en);
  const facts_ar = facts.map((f) => f.ar);
  const facts_en = facts.map((f) => f.en);
  const fact_icons = facts.map((f) => f.icon);
  const gallery_urls = String(formData.get("gallery_urls") ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  return {
    name_ar: String(formData.get("name_ar") ?? ""),
    name_en: String(formData.get("name_en") ?? ""),
    category_id: String(formData.get("category_id") ?? "") || null,
    city_id: String(formData.get("city_id") ?? "") || null,
    capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
    setting: String(formData.get("setting") ?? "both") as LocationSetting,
    price_per_day: Number(formData.get("price_per_day") ?? 0),
    facts_ar,
    facts_en,
    fact_icons,
    cover_image_url: String(formData.get("cover_image_url") ?? ""),
    cover_focal_x: clampPercent(formData.get("cover_focal_x")),
    cover_focal_y: clampPercent(formData.get("cover_focal_y")),
    gallery_urls,
    whatsapp_number: String(formData.get("whatsapp_number") ?? ""),
    whatsapp_contact_name: String(formData.get("whatsapp_contact_name") ?? "") || null,
    is_published: formData.get("is_published") === "on",
  };
}

export async function createLocation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fields = parseLocationForm(formData);
  const baseSlug = slugify(fields.name_en || fields.name_ar);
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("locations").insert({
    ...fields,
    slug,
    created_by: user?.id ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/locations");
  redirect("/admin");
}

export async function updateLocation(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = parseLocationForm(formData);

  const { error } = await supabase.from("locations").update(fields).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/locations");
  redirect("/admin");
}

export async function deleteLocation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/locations");
}

export async function togglePublish(id: string, isPublished: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/locations");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name_ar = String(formData.get("name_ar") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim();
  const icon = String(formData.get("icon") ?? "") || null;
  if (!name_ar || !name_en) throw new Error("Both names are required");

  const base = slugify(name_en) || "category";
  const { data: existing } = await supabase.from("categories").select("slug").like("slug", `${base}%`);
  const taken = new Set((existing ?? []).map((c) => c.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;

  const { data, error } = await supabase
    .from("categories")
    .insert({ name_ar, name_en, slug, icon })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/locations");
  return data as Category;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/locations");
}

export async function createAdmin(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "admin") as AdminRole;
  if (!email) throw new Error("Email is required");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const { error } = await supabase.rpc("admin_create_admin", {
    p_email: email,
    p_password: password,
    p_role: role,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/admins");
}

export async function removeAdmin(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("admins").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/admins");
}
