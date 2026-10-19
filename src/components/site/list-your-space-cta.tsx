"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { useLocale } from "@/lib/i18n/locale-context";

// Invitation for location owners, shown above the footer on public pages.
export function ListYourSpaceCta() {
  const { t, dir } = useLocale();
  const c = t.listCta;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#1a1310] text-white">
          {/* Static glows: plain gradients, no blur filter or animation. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -start-20 -top-24 h-80 w-80 bg-[radial-gradient(closest-side,oklch(0.56_0.15_35),transparent)] opacity-40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -end-16 -bottom-28 h-72 w-72 bg-[radial-gradient(closest-side,oklch(0.58_0.09_120),transparent)] opacity-30"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />

          <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:px-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.75_0.15_55)]" />
                {t.request.eyebrow}
              </span>
              <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-tight sm:text-4xl">{c.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">{c.body}</p>
              <Button
                size="lg"
                nativeButton={false}
                className="mt-7 h-12 gap-2 rounded-full px-7 text-base"
                render={
                  <Link href="/request-location">
                    {c.button}
                    <Arrow className="h-4 w-4" />
                  </Link>
                }
              />
            </div>

            <ol className="flex flex-col gap-3">
              {c.steps.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                    {i === c.steps.length - 1 ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
