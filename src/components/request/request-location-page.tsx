"use client";

import { useEffect, useState } from "react";
import { RequestHero } from "@/components/request/request-hero";
import { RequestGuide } from "@/components/request/request-guide";
import { RequestForm } from "@/components/request/request-form";
import type { Category, City } from "@/lib/types";

const GUIDE_KEY = "wejha-request-guide-seen";

export function scrollToForm() {
  document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function RequestLocationPage({ categories, cities }: { categories: Category[]; cities: City[] }) {
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(GUIDE_KEY) === "1";
    } catch {
      // storage unavailable — show the guide this time
    }
    if (seen) return;
    const timer = window.setTimeout(() => setGuideOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const closeGuide = (startForm: boolean) => {
    setGuideOpen(false);
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      // ignore
    }
    if (startForm) window.setTimeout(scrollToForm, 250);
  };

  return (
    <div className="pb-16">
      <RequestHero onStart={scrollToForm} onShowGuide={() => setGuideOpen(true)} />
      <RequestForm categories={categories} cities={cities} />
      <RequestGuide open={guideOpen} onClose={closeGuide} />
    </div>
  );
}
