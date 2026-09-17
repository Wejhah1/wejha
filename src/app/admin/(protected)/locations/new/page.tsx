import { createClient } from "@/lib/supabase/server";
import { LocationForm } from "@/components/admin/location-form";
import { createLocation } from "@/app/admin/(protected)/actions";
import type { Category, City } from "@/lib/types";

export default async function NewLocationPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from("categories").select("*").order("name_ar"),
    supabase.from("cities").select("*").order("name_ar"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Add location</h1>
      <LocationForm
        action={createLocation}
        categories={(categories ?? []) as Category[]}
        cities={(cities ?? []) as City[]}
      />
    </div>
  );
}
