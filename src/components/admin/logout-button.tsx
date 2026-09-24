"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  const { t } = useLocale();
  const router = useRouter();

  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <Button variant="ghost" onClick={logout} className={`gap-2 text-muted-foreground ${className ?? ""}`}>
      <LogOut className="h-4 w-4" />
      {t.admin.logout}
    </Button>
  );
}
