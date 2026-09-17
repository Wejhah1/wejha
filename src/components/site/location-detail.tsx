"use client";

import { useLocale } from "@/lib/i18n/locale-context";
import { GalleryLightbox } from "@/components/site/gallery-lightbox";
import { WhatsAppContactCard } from "@/components/site/whatsapp-contact-card";
import { FactChips } from "@/components/site/fact-chips";
import { LocationHero } from "@/components/site/location-hero";
import { Reveal } from "@/components/motion/reveal";
import type { Location } from "@/lib/types";

export function LocationDetail({ location }: { location: Location }) {
  const { locale, t } = useLocale();

  const name = locale === "ar" ? location.name_ar : location.name_en;
  const facts = locale === "ar" ? location.facts_ar : location.facts_en;
  const allImages = [location.cover_image_url, ...location.gallery_urls];

  return (
    <div>
      <LocationHero location={location} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-8">
            {facts.length > 0 && (
              <Reveal>
                <h2 className="mb-3 text-xl font-bold">{t.location.about}</h2>
                <FactChips facts={facts} />
              </Reveal>
            )}

            <Reveal delay={0.1}>
              <GalleryLightbox images={allImages} alt={name} />
            </Reveal>
          </div>

          <div className="lg:-mt-40">
            <WhatsAppContactCard location={location} />
          </div>
        </div>
      </div>
    </div>
  );
}
