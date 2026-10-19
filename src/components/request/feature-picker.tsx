"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REQUEST_MAX_FEATURES } from "@/lib/location-requests";
import { useLocale } from "@/lib/i18n/locale-context";

export function FeaturePicker() {
  const { t } = useLocale();
  const f = t.request.fields;
  const suggestions = t.request.featureSuggestions;
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const toggle = (feature: string) =>
    setSelected((prev) =>
      prev.includes(feature)
        ? prev.filter((x) => x !== feature)
        : prev.length < REQUEST_MAX_FEATURES
          ? [...prev, feature]
          : prev,
    );

  const addDraft = () => {
    const value = draft.trim();
    if (value && !selected.includes(value)) toggle(value);
    setDraft("");
  };

  const custom = selected.filter((s) => !suggestions.includes(s));

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="features" value={JSON.stringify(selected)} />
      <div className="flex flex-wrap gap-2">
        {suggestions.map((feature) => {
          const active = selected.includes(feature);
          return (
            <button
              key={feature}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(feature)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all active:scale-95 ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 opacity-50" />}
              {feature}
            </button>
          );
        })}
        <AnimatePresence initial={false}>
          {custom.map((feature) => (
            <motion.button
              key={feature}
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => toggle(feature)}
              aria-label={`${f.remove}: ${feature}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              {feature}
              <X className="h-3.5 w-3.5" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          maxLength={80}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder={f.featureAddPh}
          className="h-10 rounded-xl"
        />
        <Button type="button" variant="outline" onClick={addDraft} className="h-10 rounded-xl px-4">
          <Plus className="h-4 w-4" />
          {f.featureAdd}
        </Button>
      </div>
    </div>
  );
}
