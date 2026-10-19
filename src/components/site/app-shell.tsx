"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { Footer } from "@/components/site/footer";
import { ListYourSpaceCta } from "@/components/site/list-your-space-cta";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Owners' invitation on public pages; not on the form itself or in admin.
  const showCta = pathname !== "/request-location" && !pathname.startsWith("/admin");

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader tone={isHome ? "dark" : "light"} />
      <main className="flex-1">{children}</main>
      {showCta && <ListYourSpaceCta />}
      <Footer />
    </div>
  );
}
