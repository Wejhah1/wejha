import { createClient } from "@/lib/supabase/server";
import { RequestsList } from "@/components/admin/requests-list";
import type { LocationRequest, WhatsAppTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ notify?: string }>;
}

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  const { notify } = await searchParams;
  const supabase = await createClient();
  const [{ data, error }, { data: templates, error: templatesError }] = await Promise.all([
    supabase
      .from("location_requests")
      .select("*, category:categories(*), city:cities(*), location:locations(slug)")
      .order("created_at", { ascending: false }),
    supabase.from("whatsapp_templates").select("*"),
  ]);

  if (error) throw new Error(error.message);
  if (templatesError) throw new Error(templatesError.message);

  return (
    <RequestsList
      requests={(data ?? []) as unknown as LocationRequest[]}
      templates={(templates ?? []) as WhatsAppTemplate[]}
      notifyId={notify}
    />
  );
}
