import type { Dictionary } from "@/lib/i18n/dictionary";

// Main site navigation, shared by the header and anything else that lists the
// site's sections. Add pages here (e.g. an account page once sign-in exists).
export interface NavItem {
  href: string;
  label: (t: Dictionary) => string;
  // Hidden on small screens where the logo already links home.
  desktopOnly?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: (t) => t.nav.home, desktopOnly: true },
  { href: "/locations", label: (t) => t.nav.browse },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
