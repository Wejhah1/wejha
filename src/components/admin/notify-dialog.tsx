"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/lib/i18n/locale-context";
import { renderTemplate, templateValues } from "@/lib/location-requests";
import { buildWhatsAppMessageUrl, toWhatsAppNumber } from "@/lib/whatsapp";
import type { LocationRequest, RequestDecision, WhatsAppTemplate } from "@/lib/types";

const DECISION_STYLE: Record<RequestDecision, { icon: typeof CheckCircle2; className: string }> = {
  approved: { icon: CheckCircle2, className: "bg-brand text-brand-foreground" },
  edited: { icon: Pencil, className: "bg-brand text-brand-foreground" },
  rejected: { icon: XCircle, className: "bg-destructive text-white" },
};

function NotifyBody({
  request,
  templates,
  onClose,
}: {
  request: LocationRequest;
  templates: WhatsAppTemplate[];
  onClose: () => void;
}) {
  const { t } = useLocale();
  const decision = request.status as RequestDecision;
  const template = templates.find((tpl) => tpl.key === decision)?.body ?? "";
  const [message, setMessage] = useState(() =>
    renderTemplate(template, templateValues(request, window.location.origin)),
  );
  const { icon: Icon, className } = DECISION_STYLE[decision];

  return (
    <>
      <div className="flex items-center gap-3">
        <motion.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${className}`}
        >
          <Icon className="h-5 w-5" />
        </motion.span>
        <div className="min-w-0">
          <DialogTitle className="text-base font-semibold">{t.admin.notifyTitle}</DialogTitle>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {t.admin.requestStatus[decision]} · {request.owner_name} ·{" "}
            <span dir="ltr">+{toWhatsAppNumber(request.owner_phone)}</span>
          </p>
        </div>
      </div>
      <DialogDescription>{t.admin.notifyHint}</DialogDescription>

      <div className="rounded-2xl bg-[#e7ddd3] p-3 dark:bg-muted">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={9}
          className="max-h-80 rounded-xl rounded-tr-sm border-0 bg-[#dcf8c6] text-sm leading-relaxed text-[#111] shadow-sm focus-visible:ring-2 dark:bg-[#005c4b] dark:text-white"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          size="lg"
          nativeButton={false}
          className="h-10 gap-2 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
          render={
            <a
              href={buildWhatsAppMessageUrl(request.owner_phone, message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
            >
              <MessageCircle className="h-4 w-4" />
              {t.admin.notifyOpen}
            </a>
          }
        />
        <Button variant="ghost" className="h-10" onClick={onClose}>
          {t.admin.notifyLater}
        </Button>
        <Link
          href="/admin/requests/messages"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:ms-auto"
        >
          {t.admin.notifyTemplates}
        </Link>
      </div>
    </>
  );
}

export function NotifyDialog({
  request,
  templates,
  onClose,
}: {
  request: LocationRequest | null;
  templates: WhatsAppTemplate[];
  onClose: () => void;
}) {
  const open = !!request && request.status !== "new";
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="gap-4 p-5 sm:max-w-lg">
        {open && <NotifyBody key={request.id} request={request} templates={templates} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
