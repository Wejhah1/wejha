"use client";

import { LocaleToggle } from "@/components/site/locale-toggle";
import type { HeaderTone } from "@/components/site/site-header";

// End-of-header controls. This is where the account entry goes once sign-in
// exists: a "sign in" button for guests, or the user's avatar opening a menu
// (profile, my locations, my reviews, sign out) for signed-in users.
export function HeaderActions({ tone }: { tone: HeaderTone }) {
  return (
    <div className="flex items-center gap-1">
      <LocaleToggle
        className={tone === "dark" ? "text-white/80 hover:bg-white/10 hover:text-white" : undefined}
      />
    </div>
  );
}
