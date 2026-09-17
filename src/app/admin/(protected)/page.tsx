import { createClient } from "@/lib/supabase/server";
import { AdminLocationsTable } from "@/components/admin/admin-locations-table";
import type { Location } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*, category:categories(*), city:cities(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <AdminLocationsTable locations={(data ?? []) as unknown as Location[]} />;
}
