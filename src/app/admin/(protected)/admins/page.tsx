import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminsManager } from "@/components/admin/admins-manager";
import type { Admin, PendingAdminInvite } from "@/lib/types";

export default async function AdminsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentAdmin } = await supabase
    .from("admins")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  if (currentAdmin?.role !== "super_admin") redirect("/admin");

  const [{ data: admins }, { data: invites }] = await Promise.all([
    supabase.from("admins").select("*").order("created_at"),
    supabase.from("pending_admin_invites").select("*").order("created_at"),
  ]);

  return (
    <AdminsManager
      admins={(admins ?? []) as Admin[]}
      invites={(invites ?? []) as PendingAdminInvite[]}
      currentAdminId={currentAdmin.id}
    />
  );
}
