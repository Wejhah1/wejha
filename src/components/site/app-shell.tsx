"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ListYourSpaceCta } from "@/components/site/list-your-space-cta";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Owners' invitation on public pages; not on the form itself or in admin.
  const showCta = pathname !== "/request-location" && !pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar overlay={isHome} />
      <main className="flex-1">{children}</main>
      {showCta && <ListYourSpaceCta />}
      <Footer />
    </div>
  );
}
