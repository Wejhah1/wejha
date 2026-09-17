"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Users, Building2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { GalleryLightbox } from "@/components/site/gallery-lightbox";
import { WhatsAppContactCard } from "@/components/site/whatsapp-contact-card";
import { FactChips } from "@/components/site/fact-chips";
import { Reveal } from "@/components/motion/reveal";
import type { Location } from "@/lib/types";

export function LocationDetail({ location }: { location: Location }) {
  const { locale, t, dir } = useLocale();
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const name = locale === "ar" ? location.name_ar : location.name_en;
  const cityName = locale === "ar" ? location.city?.name_ar : location.city?.name_en;
  const categoryName = locale === "ar" ? location.category?.name_ar : location.category?.name_en;
  const facts = locale === "ar" ? location.facts_ar : location.facts_en;

  const settingLabel = {
    indoor: t.browse.settingIndoor,
    outdoor: t.browse.settingOutdoor,
    both: t.browse.settingBoth,
  }[location.setting];

  const allImages = [location.cover_image_url, ...location.gallery_urls];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/locations"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <BackArrow className="h-4 w-4" />
        {t.location.backToBrowse}
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={location.cover_image_url} alt={name} className="h-full w-full object-cover" />
      </motion.div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <Reveal>
            {categoryName && (
              <span className="text-sm font-semibold text-brand-foreground/70">
                {categoryName}
              </span>
            )}
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {cityName && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {cityName}
                </span>
              )}
              {location.capacity && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {location.capacity} {t.location.people}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {settingLabel}
              </span>
            </div>
          </Reveal>

          {facts.length > 0 && (
            <Reveal delay={0.1}>
              <h2 className="mb-3 text-xl font-bold">{t.location.about}</h2>
              <FactChips facts={facts} />
            </Reveal>
          )}

          <Reveal delay={0.15}>
            <GalleryLightbox images={allImages} alt={name} />
          </Reveal>
        </div>

        <div>
          <WhatsAppContactCard location={location} />
        </div>
      </div>
    </div>
  );
}
