import { createClient } from "@/lib/supabase/server";
import { RequestsList } from "@/components/admin/requests-list";
import type { LocationRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("location_requests")
    .select("*, category:categories(*), city:cities(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return <RequestsList requests={(data ?? []) as unknown as LocationRequest[]} />;
}
