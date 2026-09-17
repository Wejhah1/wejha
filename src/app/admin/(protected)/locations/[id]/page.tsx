import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocationForm } from "@/components/admin/location-form";
import { updateLocation } from "@/app/admin/(protected)/actions";
import type { Category, City, Location } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: location }, { data: categories }, { data: cities }] = await Promise.all([
    supabase.from("locations").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("name_ar"),
    supabase.from("cities").select("*").order("name_ar"),
  ]);

  if (!location) notFound();

  const boundUpdate = updateLocation.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Edit location</h1>
      <LocationForm
        action={boundUpdate}
        categories={(categories ?? []) as Category[]}
        cities={(cities ?? []) as City[]}
        location={location as Location}
      />
    </div>
  );
}
