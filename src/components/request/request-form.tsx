"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Home,
  Lightbulb,
  Loader2,
  Send,
  Sun,
  SunMoon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/reveal";
import { FeaturePicker } from "@/components/request/feature-picker";
import { RequestPhotos } from "@/components/request/request-photos";
import { getCategoryIcon } from "@/lib/category-icons";
import { REQUEST_MIN_PHOTOS } from "@/lib/location-requests";
import { useLocale } from "@/lib/i18n/locale-context";
import { submitLocationRequest } from "@/app/request-location/actions";
import { saveRequest } from "@/lib/my-requests";
import type { Category, City } from "@/lib/types";

type SectionKey = "contact" | "place" | "details" | "photos";

const ease = [0.16, 1, 0.3, 1] as const;
const fieldClass = "h-11 rounded-xl bg-background px-3.5";

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { t } = useLocale();
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-sm font-semibold">
        {label}
        {required ? (
          <span className="text-primary" aria-label={t.request.required}>
            *
          </span>
        ) : (
          <span className="text-xs font-normal text-muted-foreground">({t.request.optional})</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({
  index,
  title,
  hint,
  done,
  children,
}: {
  index: number;
  title: string;
  hint: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-8">
        <header className="mb-6 flex items-start gap-4">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition-colors duration-500 ${
              done ? "bg-brand text-brand-foreground" : "bg-foreground text-background"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={done ? "done" : "n"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : index}
              </motion.span>
            </AnimatePresence>
          </span>
          <div>
            <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          </div>
        </header>
        {children}
      </section>
    </Reveal>
  );
}

function ChoiceChip({
  name,
  value,
  label,
  icon: Icon,
  required,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  required?: boolean;
  defaultChecked?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        required={required}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 hover:border-primary/50 active:scale-[0.97]">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
    </label>
  );
}

export function RequestForm({ categories, cities }: { categories: Category[]; cities: City[] }) {
  const { locale, t } = useLocale();
  const r = t.request;
  const f = r.fields;
  const formRef = useRef<HTMLFormElement>(null);
  const [photos, setPhotos] = useState<{ urls: string[]; busy: boolean }>({ urls: [], busy: false });
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const recompute = () => {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const has = (key: string) => String(data.get(key) ?? "").trim().length > 0;
    setFilled({
      owner_name: has("owner_name"),
      owner_phone: has("owner_phone"),
      name_ar: has("name_ar"),
      category_id: has("category_id"),
      city_id: has("city_id"),
      price_per_day: has("price_per_day"),
    });
  };

  const done: Record<SectionKey, boolean> = {
    contact: !!(filled.owner_name && filled.owner_phone),
    place: !!(filled.name_ar && filled.category_id && filled.city_id),
    details: !!filled.price_per_day,
    photos: photos.urls.length >= REQUEST_MIN_PHOTOS && !photos.busy,
  };
  const doneCount = Object.values(done).filter(Boolean).length;
  const sectionKeys: SectionKey[] = ["contact", "place", "details", "photos"];

  // onSubmit (not a form action) so a failed submit doesn't reset what the user typed.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    if (photos.urls.length < REQUEST_MIN_PHOTOS || photos.busy) {
      setError(r.errors.photosMin);
      document.getElementById("section-photos")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    startTransition(async () => {
      try {
        const result = await submitLocationRequest(formData);
        if (result.ok) {
          if (result.id) {
            saveRequest({
              id: result.id,
              name: String(formData.get("name_ar") ?? ""),
              createdAt: new Date().toISOString(),
            });
          }
          setSubmitted(true);
          document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          setError(result.error === "photos" ? r.errors.photosMin : result.error === "required" ? r.errors.required : r.errors.generic);
        }
      } catch {
        setError(r.errors.generic);
      }
    });
  };

  const reset = () => {
    setSubmitted(false);
    setFilled({});
    setPhotos({ urls: [], busy: false });
    setFormKey((k) => k + 1);
  };

  return (
    <div id="request-form" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{r.formTitle}</h2>
        <p className="mt-3 text-muted-foreground">{r.formSubtitle}</p>
      </Reveal>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-border/60 bg-card px-6 py-12 text-center shadow-sm"
          >
            <div className="relative flex h-24 w-24 items-center justify-center">
              <motion.span
                initial={{ scale: 0.5, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-brand/30"
              />
              <motion.span
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand text-brand-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <motion.path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                  />
                </svg>
              </motion.span>
            </div>
            <h3 className="mt-6 text-2xl font-semibold">{r.success.title}</h3>
            <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{r.success.body}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                className="h-11 gap-2 rounded-full px-6"
                render={
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    {r.success.home}
                  </Link>
                }
              />
              <Button size="lg" variant="outline" onClick={reset} className="h-11 rounded-full px-6">
                {r.success.another}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`form-${formKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start"
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              onChange={recompute}
              className="flex min-w-0 flex-col gap-6"
            >
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute h-0 w-0 opacity-0"
              />

              <Section index={1} title={r.sections.contact.title} hint={r.sections.contact.hint} done={done.contact}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label={f.ownerName} htmlFor="owner_name" required>
                    <Input
                      id="owner_name"
                      name="owner_name"
                      required
                      minLength={2}
                      maxLength={120}
                      autoComplete="name"
                      placeholder={f.ownerNamePh}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={f.ownerPhone} htmlFor="owner_phone" required hint={f.ownerPhoneHint}>
                    <Input
                      id="owner_phone"
                      name="owner_phone"
                      type="tel"
                      inputMode="tel"
                      required
                      pattern="[+0-9 ]{8,20}"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder={f.ownerPhonePh}
                      className={`${fieldClass} text-start`}
                    />
                  </Field>
                  <Field label={f.ownerEmail} htmlFor="owner_email" className="sm:col-span-2">
                    <Input
                      id="owner_email"
                      name="owner_email"
                      type="email"
                      autoComplete="email"
                      dir="ltr"
                      placeholder={f.ownerEmailPh}
                      className={`${fieldClass} text-start`}
                    />
                  </Field>
                </div>
              </Section>

              <Section index={2} title={r.sections.place.title} hint={r.sections.place.hint} done={done.place}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label={f.nameAr} htmlFor="name_ar" required>
                    <Input
                      id="name_ar"
                      name="name_ar"
                      required
                      minLength={2}
                      maxLength={150}
                      placeholder={f.nameArPh}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={f.nameEn} htmlFor="name_en">
                    <Input
                      id="name_en"
                      name="name_en"
                      maxLength={150}
                      dir="ltr"
                      placeholder={f.nameEnPh}
                      className={`${fieldClass} text-start`}
                    />
                  </Field>

                  <Field label={f.category} required className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={f.category}>
                      {categories.map((c, i) => (
                        <ChoiceChip
                          key={c.id}
                          name="category_id"
                          value={c.id}
                          required={i === 0}
                          icon={getCategoryIcon(c.icon)}
                          label={locale === "ar" ? c.name_ar : c.name_en}
                        />
                      ))}
                    </div>
                  </Field>

                  <Field label={f.city} required className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={f.city}>
                      {cities.map((c, i) => (
                        <ChoiceChip
                          key={c.id}
                          name="city_id"
                          value={c.id}
                          required={i === 0}
                          label={locale === "ar" ? c.name_ar : c.name_en}
                        />
                      ))}
                    </div>
                  </Field>

                  <Field label={f.district} htmlFor="district">
                    <Input
                      id="district"
                      name="district"
                      maxLength={150}
                      placeholder={f.districtPh}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={f.mapsUrl} htmlFor="maps_url" hint={f.mapsUrlHint}>
                    <Input
                      id="maps_url"
                      name="maps_url"
                      type="url"
                      maxLength={500}
                      dir="ltr"
                      placeholder={f.mapsUrlPh}
                      className={`${fieldClass} text-start`}
                    />
                  </Field>
                </div>
              </Section>

              <Section index={3} title={r.sections.details.title} hint={r.sections.details.hint} done={done.details}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label={f.setting} required className="sm:col-span-2">
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={f.setting}>
                      <ChoiceChip name="setting" value="indoor" icon={Home} label={t.browse.settingIndoor} />
                      <ChoiceChip name="setting" value="outdoor" icon={Sun} label={t.browse.settingOutdoor} />
                      <ChoiceChip
                        name="setting"
                        value="both"
                        icon={SunMoon}
                        label={t.browse.settingBoth}
                        defaultChecked
                      />
                    </div>
                  </Field>

                  <Field label={f.price} htmlFor="price_per_day" required hint={f.priceHint}>
                    <div className="relative">
                      <Input
                        id="price_per_day"
                        name="price_per_day"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        required
                        placeholder={f.pricePh}
                        className={`${fieldClass} pe-24`}
                      />
                      <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-sm text-muted-foreground">
                        {t.location.currency} / {t.browse.perDay}
                      </span>
                    </div>
                  </Field>
                  <Field label={f.capacity} htmlFor="capacity" hint={f.capacityHint}>
                    <div className="relative">
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder={f.capacityPh}
                        className={`${fieldClass} pe-16`}
                      />
                      <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-sm text-muted-foreground">
                        {t.location.people}
                      </span>
                    </div>
                  </Field>

                  <Field label={f.description} htmlFor="description" className="sm:col-span-2">
                    <Textarea
                      id="description"
                      name="description"
                      maxLength={2000}
                      rows={4}
                      placeholder={f.descriptionPh}
                      className="min-h-28 rounded-xl bg-background px-3.5 py-3 leading-relaxed"
                    />
                  </Field>

                  <Field label={f.features} hint={f.featuresHint} className="sm:col-span-2">
                    <FeaturePicker />
                  </Field>
                </div>
              </Section>

              <div id="section-photos" className="scroll-mt-24">
                <Section index={4} title={r.sections.photos.title} hint={r.sections.photos.hint} done={done.photos}>
                  <RequestPhotos onChange={(urls, busy) => setPhotos({ urls, busy })} />
                  <div className="mt-5 rounded-2xl bg-accent/50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      {r.photoTips.title}
                    </p>
                    <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      {r.photoTips.items.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Section>
              </div>

              <Reveal>
                <div className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-8">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                    <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                    {f.consent}
                  </label>
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        role="alert"
                        className="text-sm font-medium text-destructive"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending || photos.busy}
                    onClick={() => {
                      if (formRef.current && !formRef.current.checkValidity()) setError(r.errors.required);
                    }}
                    className="h-12 w-full gap-2 rounded-full text-base sm:w-fit sm:px-10"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isPending ? r.submitting : r.submit}
                  </Button>
                </div>
              </Reveal>
            </form>

            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{r.progress}</p>
                  <span className="text-sm tabular-nums text-muted-foreground">{doneCount} / 4</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${(doneCount / 4) * 100}%` }}
                    transition={{ duration: 0.6, ease }}
                  />
                </div>
                <ul className="mt-5 flex flex-col gap-3">
                  {sectionKeys.map((key) => (
                    <li key={key} className="flex items-center gap-3 text-sm">
                      {done[key] ? (
                        <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="h-5 w-5 text-brand" />
                        </motion.span>
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                      <span className={done[key] ? "font-medium" : "text-muted-foreground"}>
                        {r.sections[key].title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
