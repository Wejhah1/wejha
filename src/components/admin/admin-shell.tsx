"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MapPinned, Users, UserCircle, Tags } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { LogoutButton } from "@/components/admin/logout-button";
import type { Admin } from "@/lib/types";

export function AdminShell({ admin, children }: { admin: Admin; children: React.ReactNode }) {
  const { t } = useLocale();
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: t.admin.dashboard, icon: LayoutGrid, exact: true },
    { href: "/admin/locations/new", label: t.admin.addLocation, icon: MapPinned, exact: false },
    { href: "/admin/categories", label: t.admin.categories, icon: Tags, exact: false },
    ...(admin.role === "super_admin"
      ? [{ href: "/admin/admins", label: t.admin.admins, icon: Users, exact: false }]
      : []),
    { href: "/admin/account", label: t.admin.account, icon: UserCircle, exact: false },
  ];

  const isActive = (link: (typeof links)[number]) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href);

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-7xl grid-cols-1 gap-8 px-4 py-6 pb-28 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8 lg:py-8 lg:pb-8">
      <aside className="hidden lg:flex lg:flex-col lg:gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link) ? "bg-foreground text-background" : "hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        <LogoutButton className="mt-auto justify-start" />
      </aside>

      <div className="min-w-0">{children}</div>

      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link);
            return (
              <li key={link.href} className="min-w-0 flex-1">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      active ? "bg-primary/15" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="max-w-full truncate">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
