"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/lib/i18n/locale-context";
import { TEMPLATE_VARIABLES, renderTemplate, type TemplateVariable } from "@/lib/location-requests";
import { updateWhatsAppTemplate } from "@/app/admin/(protected)/actions";
import type { RequestDecision, WhatsAppTemplate } from "@/lib/types";

const ORDER: RequestDecision[] = ["approved", "edited", "rejected"];
const ICONS = { approved: CheckCircle2, edited: Pencil, rejected: XCircle };

const SAMPLE: Record<TemplateVariable, string> = {
  name: "محمد",
  location: "استوديو الضوء الطبيعي",
  link: "https://wejha.sa/locations/natural-light-studio",
  note: "ملاحظة توضيحية من المشرف",
};

function TemplateCard({ template }: { template: WhatsAppTemplate }) {
  const { t } = useLocale();
  const [body, setBody] = useState(template.body);
  const [saved, setSaved] = useState(template.body);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);
  const Icon = ICONS[template.key];
  const dirty = body.trim() !== saved.trim();

  const insert = (variable: TemplateVariable) => {
    const el = ref.current;
    const token = `{${variable}}`;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    setBody(body.slice(0, start) + token + body.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateWhatsAppTemplate(template.key, body);
        setSaved(body);
        setJustSaved(true);
        window.setTimeout(() => setJustSaved(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className={`h-5 w-5 ${template.key === "rejected" ? "text-destructive" : "text-brand"}`} />
        {t.admin.templateTitle[template.key]}
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Textarea
            ref={ref}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            maxLength={2000}
            className="min-h-56 rounded-xl text-sm leading-relaxed"
          />
          <div>
            <p className="mb-2 text-xs text-muted-foreground">{t.admin.messagesVariablesHint}</p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insert(variable)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <code className="font-mono text-primary" dir="ltr">{`{${variable}}`}</code>
                  {t.admin.templateVar[variable]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">{t.admin.messagesPreview}</p>
          <div className="flex-1 rounded-xl bg-[#e7ddd3] p-3 dark:bg-muted">
            <div className="ms-auto w-fit max-w-full rounded-xl rounded-tr-sm bg-[#dcf8c6] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-[#111] shadow-sm dark:bg-[#005c4b] dark:text-white">
              {renderTemplate(body, SAMPLE)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || isPending} className="gap-1.5">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {t.admin.save}
        </Button>
        <AnimatePresence>
          {justSaved && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-brand"
            >
              {t.admin.messagesSaved}
            </motion.span>
          )}
        </AnimatePresence>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </section>
  );
}

export function TemplatesEditor({ templates }: { templates: WhatsAppTemplate[] }) {
  const { t, dir } = useLocale();
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  const sorted = ORDER.flatMap((key) => templates.filter((tpl) => tpl.key === key));

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <Link
          href="/admin/requests"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Back className="h-4 w-4" />
          {t.admin.requests}
        </Link>
        <h1 className="text-2xl font-extrabold">{t.admin.messages}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.messagesHint}</p>
      </div>
      {sorted.map((template) => (
        <TemplateCard key={template.key} template={template} />
      ))}
    </div>
  );
}
