"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, ExternalLink, Inbox, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { MY_REQUESTS_EVENT, forgetRequest, getSavedRequests } from "@/lib/my-requests";
import { getMyRequestStatuses, type MyRequestStatus } from "@/app/request-location/actions";
import type { LocationRequestStatus } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

const PILL: Record<LocationRequestStatus, string> = {
  new: "bg-primary/10 text-primary",
  approved: "bg-brand/15 text-brand",
  edited: "bg-brand/15 text-brand",
  rejected: "bg-destructive/10 text-destructive",
};

function Tracker({ status }: { status: LocationRequestStatus }) {
  const { t, dir } = useLocale();
  const reached = status === "new" ? 2 : 3;
  const resultColor = status === "rejected" ? "bg-destructive" : "bg-brand";

  return (
    <ol className="flex items-center gap-1.5" aria-label={t.request.mine.status[status]}>
      {t.request.mine.steps.map((label, i) => {
        const done = i < reached;
        const last = i === 2;
        return (
          <li key={label} className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="h-1.5 overflow-hidden rounded-full bg-muted">
              {done && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease }}
                  style={{ originX: dir === "rtl" ? 1 : 0 }}
                  className={`block h-full rounded-full ${last ? resultColor : "bg-primary"}`}
                />
              )}
            </span>
            <span className={`truncate text-[11px] ${done ? "font-medium" : "text-muted-foreground"}`}>
              {last && done ? t.request.mine.status[status] : label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function RequestStatusCard({ request, onHide }: { request: MyRequestStatus; onHide: () => void }) {
  const { locale, t } = useLocale();
  const m = t.request.mine;
  const Icon = request.status === "new" ? Clock : request.status === "rejected" ? X : Check;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease }}
      className="relative flex flex-col gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
    >
      <button
        type="button"
        onClick={onHide}
        aria-label={m.hide}
        title={m.hide}
        className="absolute end-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pe-6">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${PILL[request.status]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{request.name_ar}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {m.sentOn}{" "}
            {new Date(request.created_at).toLocaleDateString(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-GB", {
              dateStyle: "medium",
            })}
          </p>
        </div>
      </div>

      <Tracker status={request.status} />

      <p className="text-sm leading-relaxed text-muted-foreground">{m.statusHint[request.status]}</p>

      {request.status === "rejected" && request.admin_note && (
        <p className="rounded-xl bg-destructive/5 px-3 py-2 text-sm">
          <span className="font-medium">{m.reason}: </span>
          {request.admin_note}
        </p>
      )}

      {request.location_slug && (
        <Link
          href={`/locations/${request.location_slug}`}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          {m.view}
        </Link>
      )}
    </motion.article>
  );
}

export function MyRequests() {
  const { t } = useLocale();
  const [requests, setRequests] = useState<MyRequestStatus[]>([]);

  const load = useCallback(async () => {
    const ids = getSavedRequests().map((r) => r.id);
    if (!ids.length) {
      setRequests([]);
      return;
    }
    const statuses = await getMyRequestStatuses(ids);
    // Keep the device's order (newest first).
    setRequests(ids.flatMap((id) => statuses.find((s) => s.id === id) ?? []));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads from localStorage + server after mount
    load();
    window.addEventListener(MY_REQUESTS_EVENT, load);
    return () => window.removeEventListener(MY_REQUESTS_EVENT, load);
  }, [load]);

  return (
    <AnimatePresence>
      {requests.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8"
        >
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <Inbox className="h-6 w-6 text-primary" />
                {t.request.mine.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.request.mine.hint}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {requests.map((request) => (
                <RequestStatusCard
                  key={request.id}
                  request={request}
                  onHide={() => forgetRequest(request.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
