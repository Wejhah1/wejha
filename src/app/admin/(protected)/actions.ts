"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_FACT_ICON } from "@/lib/fact-icons";
import { toWhatsAppNumber } from "@/lib/whatsapp";
import type {
  AdminRole,
  Category,
  LocationRequest,
  LocationSetting,
  RequestDecision,
} from "@/lib/types";

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

  const { data: created, error } = await supabase
    .from("locations")
    .insert({
      ...fields,
      slug: locationSlug(fields.name_en, fields.name_ar),
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/locations/[slug]", "page");

  // Created from an owner's request after the admin edited it: mark the request
  // and land on the requests page with the WhatsApp notification ready.
  const fromRequest = String(formData.get("from_request") ?? "");
  if (fromRequest) {
    const { error: requestError } = await supabase
      .from("location_requests")
      .update({ status: "edited", location_id: created.id, decided_at: new Date().toISOString() })
      .eq("id", fromRequest);
    if (requestError) throw new Error(requestError.message);
    revalidatePath("/admin/requests");
    redirect(`/admin/requests?notify=${fromRequest}`);
  }

  redirect("/admin");
}

function locationSlug(nameEn: string, nameAr: string) {
  return `${slugify(nameEn || nameAr)}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function updateLocation(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = parseLocationForm(formData);

  const { error } = await supabase.from("locations").update(fields).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/locations/[slug]", "page");
  redirect("/admin");
}

export async function deleteLocation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/locations/[slug]", "page");
}

export async function togglePublish(id: string, isPublished: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/locations/[slug]", "page");
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
  revalidatePath("/request-location");
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/locations/[slug]", "page");
  return data as Category;
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/request-location");
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/locations/[slug]", "page");
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

const REQUEST_SELECT = "*, category:categories(*), city:cities(*), location:locations(slug)";

async function decideRequest(
  id: string,
  decision: RequestDecision,
  patch: { location_id?: string; admin_note?: string | null } = {},
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("location_requests")
    .update({ status: decision, decided_at: new Date().toISOString(), ...patch })
    .eq("id", id)
    .select(REQUEST_SELECT)
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/requests");
  return data as unknown as LocationRequest;
}

// Publishes the request exactly as the owner submitted it. Bookings go to the
// admin-supplied number; the owner's number is only used to notify them.
export async function approveRequest(id: string, bookingNumber: string) {
  const whatsappNumber = toWhatsAppNumber(bookingNumber);
  if (whatsappNumber.length < 8 || whatsappNumber.length > 15) throw new Error("Invalid booking number");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: request, error: readError } = await supabase
    .from("location_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);
  const r = request as LocationRequest;
  if (r.status !== "new") throw new Error("Request already reviewed");

  const [cover, ...gallery] = r.image_urls;
  const { data: created, error } = await supabase
    .from("locations")
    .insert({
      slug: locationSlug(r.name_en ?? "", r.name_ar),
      name_ar: r.name_ar,
      name_en: r.name_en || r.name_ar,
      category_id: r.category_id,
      city_id: r.city_id,
      setting: r.setting,
      price_per_day: r.price_per_day ?? 0,
      capacity: r.capacity,
      facts_ar: r.features,
      facts_en: r.features,
      fact_icons: r.features.map(() => DEFAULT_FACT_ICON),
      cover_image_url: cover ?? "",
      gallery_urls: gallery,
      whatsapp_number: whatsappNumber,
      whatsapp_contact_name: null,
      is_published: true,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/locations");
  revalidatePath("/locations/[slug]", "page");
  return decideRequest(id, "approved", { location_id: created.id });
}

export async function rejectRequest(id: string, note: string) {
  return decideRequest(id, "rejected", { admin_note: note.trim().slice(0, 1000) || null });
}

export async function updateWhatsAppTemplate(key: RequestDecision, body: string) {
  const text = body.trim();
  if (!text) throw new Error("Message cannot be empty");

  const supabase = await createClient();
  const { error } = await supabase
    .from("whatsapp_templates")
    .update({ body: text.slice(0, 2000), updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/requests");
  revalidatePath("/admin/requests/messages");
}

export async function deleteRequest(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("location_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/requests");
}
