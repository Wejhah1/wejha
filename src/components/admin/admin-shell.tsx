"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, MapPinned, Users, LogOut } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { Admin } from "@/lib/types";

export function AdminShell({ admin, children }: { admin: Admin; children: React.ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/admin", label: t.admin.dashboard, icon: LayoutGrid, exact: true },
    { href: "/admin/locations/new", label: t.admin.addLocation, icon: MapPinned, exact: false },
    ...(admin.role === "super_admin"
      ? [{ href: "/admin/admins", label: t.admin.admins, icon: Users, exact: false }]
      : []),
  ];

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <aside className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-foreground text-background" : "hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        <Button variant="ghost" onClick={logout} className="mt-auto justify-start gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          {t.admin.logout}
        </Button>
      </aside>

      <div>{children}</div>
    </div>
  );
}
