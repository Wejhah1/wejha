"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LocationSetting } from "@/lib/types";

function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

function parseLocationForm(formData: FormData) {
  const facts_ar = String(formData.get("facts_ar") ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
  const facts_en = String(formData.get("facts_en") ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
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
    cover_image_url: String(formData.get("cover_image_url") ?? ""),
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

export async function createAdmin(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "admin") as "admin" | "super_admin";
  if (!email || !password) throw new Error("Email and password are required");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw new Error(createError.message);

  const { error } = await supabase
    .from("admins")
    .insert({ id: created.user.id, email, role, invited_by: user?.id ?? null });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/admins");
}

export async function removeAdmin(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("admins").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/admins");
}
