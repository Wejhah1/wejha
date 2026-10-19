import { createClient } from "@/lib/supabase/server";
import { LocationForm } from "@/components/admin/location-form";
import { createLocation } from "@/app/admin/(protected)/actions";
import { DEFAULT_FACT_ICON } from "@/lib/fact-icons";
import { toWhatsAppNumber } from "@/lib/whatsapp";
import type { Category, City, Location, LocationRequest } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

function defaultsFromRequest(request: LocationRequest): Partial<Location> {
  const [cover, ...gallery] = request.image_urls;
  return {
    name_ar: request.name_ar,
    name_en: request.name_en ?? "",
    category_id: request.category_id,
    city_id: request.city_id,
    setting: request.setting,
    price_per_day: request.price_per_day ?? undefined,
    capacity: request.capacity,
    cover_image_url: cover ?? "",
    gallery_urls: gallery,
    facts_ar: request.features,
    facts_en: request.features.map(() => ""),
    fact_icons: request.features.map(() => DEFAULT_FACT_ICON),
    whatsapp_number: toWhatsAppNumber(request.owner_phone),
    whatsapp_contact_name: request.owner_name,
    is_published: true,
  };
}

export default async function NewLocationPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  const supabase = await createClient();
  const [{ data: categories }, { data: cities }, { data: request }] = await Promise.all([
    supabase.from("categories").select("*").order("name_ar"),
    supabase.from("cities").select("*").order("name_ar"),
    from
      ? supabase.from("location_requests").select("*").eq("id", from).eq("status", "new").maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold">Add location</h1>
      {request && (
        <p className="mb-6 max-w-3xl rounded-xl bg-accent px-4 py-3 text-sm">
          تعديل طلب «{(request as LocationRequest).owner_name}» — عدّل المعلومات ثم احفظ، وبعدها تقدر ترسل له
          رسالة واتساب بالنتيجة.
        </p>
      )}
      {!request && <div className="mb-4" />}
      <LocationForm
        action={createLocation}
        categories={(categories ?? []) as Category[]}
        cities={(cities ?? []) as City[]}
        defaults={request ? defaultsFromRequest(request as LocationRequest) : undefined}
        fromRequestId={request ? (request as LocationRequest).id : undefined}
      />
    </div>
  );
}
