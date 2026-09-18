"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLocationDetail = /^\/locations\/[^/]+$/.test(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar transparentUntilScroll={isHome || isLocationDetail} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
