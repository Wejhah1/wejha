import { createClient } from "@/lib/supabase/server";
import { TemplatesEditor } from "@/components/admin/templates-editor";
import type { WhatsAppTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WhatsAppTemplatesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("whatsapp_templates").select("*");
  if (error) throw new Error(error.message);

  return <TemplatesEditor templates={(data ?? []) as WhatsAppTemplate[]} />;
}
