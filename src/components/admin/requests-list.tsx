"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  Inbox,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotifyDialog } from "@/components/admin/notify-dialog";
import { approveRequest, deleteRequest, rejectRequest } from "@/app/admin/(protected)/actions";
import { buildWhatsAppMessageUrl, toWhatsAppNumber } from "@/lib/whatsapp";
import { getSavedBookingNumber, saveBookingNumber } from "@/lib/booking-number";
import type { LocationRequest, LocationRequestStatus, WhatsAppTemplate } from "@/lib/types";

const STATUS_STYLES: Record<LocationRequestStatus, string> = {
  new: "bg-primary text-primary-foreground",
  approved: "bg-brand text-brand-foreground",
  edited: "bg-brand text-brand-foreground",
  rejected: "bg-muted-foreground/20 text-foreground",
};

type Filter = "all" | "new" | "approved" | "rejected";

function matches(filter: Filter, status: LocationRequestStatus) {
  if (filter === "all") return true;
  if (filter === "approved") return status === "approved" || status === "edited";
  return status === filter;
}

function RejectDialog({
  request,
  onClose,
  onRejected,
}: {
  request: LocationRequest | null;
  onClose: () => void;
  onRejected: (updated: LocationRequest) => void;
}) {
  const { t } = useLocale();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog
      open={!!request}
      onOpenChange={(next) => !next && onClose()}
      onOpenChangeComplete={(next) => {
        if (!next) {
          setNote("");
          setError(null);
        }
      }}
    >
      <DialogContent showCloseButton={false} className="gap-4 p-5 sm:max-w-md">
        <DialogTitle className="text-base font-semibold">{t.admin.requestRejectTitle}</DialogTitle>
        <DialogDescription>
          «{request?.name_ar}» — {t.admin.requestRejectHint}
        </DialogDescription>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder={t.admin.requestRejectPh}
          className="rounded-xl"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {t.admin.cancel}
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              request &&
              startTransition(async () => {
                try {
                  onRejected(await rejectRequest(request.id, note));
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Error");
                }
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            {t.admin.requestRejectConfirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApproveDialog({
  request,
  onClose,
  onApproved,
}: {
  request: LocationRequest | null;
  onClose: () => void;
  onApproved: (updated: LocationRequest) => void;
}) {
  const { t } = useLocale();
  const [number, setNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!request) return;
    if (toWhatsAppNumber(number).length < 8) {
      setError(t.admin.bookingNumberInvalid);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const updated = await approveRequest(request.id, number);
        saveBookingNumber(number);
        onApproved(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    });
  };

  return (
    <Dialog
      open={!!request}
      onOpenChange={(next) => !next && onClose()}
      onOpenChangeComplete={(next) => {
        if (next) setNumber(getSavedBookingNumber());
        else setError(null);
      }}
    >
      <DialogContent showCloseButton={false} className="gap-4 p-5 sm:max-w-md">
        <DialogTitle className="text-base font-semibold">{t.admin.requestApproveTitle}</DialogTitle>
        <DialogDescription>
          «{request?.name_ar}» — {t.admin.requestApproveHint}
        </DialogDescription>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-2"
        >
          <Label htmlFor="booking_number">{t.admin.bookingNumber}</Label>
          <Input
            id="booking_number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoFocus
            placeholder="05XXXXXXXX"
            className="h-10 rounded-xl text-start"
          />
          <p className="text-xs text-muted-foreground">{t.admin.bookingNumberHint}</p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {t.admin.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {t.admin.requestApprove}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RequestCard({
  request,
  onApprove,
  onReject,
  onNotify,
}: {
  request: LocationRequest;
  onApprove: () => void;
  onReject: () => void;
  onNotify: () => void;
}) {
  const { locale, t } = useLocale();
  const [isPending, startTransition] = useTransition();
  const lang = locale === "ar" ? "ar" : "en";
  const category = request.category ? request.category[`name_${lang}`] : null;
  const city = request.city ? request.city[`name_${lang}`] : null;
  const settingLabel = {
    indoor: t.browse.settingIndoor,
    outdoor: t.browse.settingOutdoor,
    both: t.browse.settingBoth,
  }[request.setting];
  const isNew = request.status === "new";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden rounded-2xl border bg-card transition-opacity ${
        isNew ? "border-primary/40 shadow-sm" : "border-border/60"
      } ${isPending ? "opacity-60" : ""}`}
    >
      {request.image_urls.length > 0 && (
        <div className="flex gap-1 overflow-x-auto">
          {request.image_urls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-32 w-44 object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">
              {request.name_ar}
              {request.name_en && (
                <span className="ms-2 text-sm font-normal text-muted-foreground">{request.name_en}</span>
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {[category, city, request.district, settingLabel].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}>
            {t.admin.requestStatus[request.status]}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">{t.request.fields.ownerName}</dt>
            <dd className="font-medium">{request.owner_name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t.request.fields.ownerPhone}</dt>
            <dd className="font-medium" dir="ltr">
              {request.owner_phone}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t.location.pricePerDay}</dt>
            <dd className="font-medium">
              {request.price_per_day != null ? `${request.price_per_day} ${t.location.currency}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t.location.capacity}</dt>
            <dd className="font-medium">{request.capacity ?? "—"}</dd>
          </div>
        </dl>

        {request.owner_email && (
          <p className="text-sm" dir="ltr">
            {request.owner_email}
          </p>
        )}
        {request.description && (
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{request.description}</p>
        )}
        {request.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {request.features.map((feature) => (
              <span key={feature} className="rounded-full bg-accent px-2.5 py-1 text-xs">
                {feature}
              </span>
            ))}
          </div>
        )}
        {request.admin_note && (
          <p className="rounded-xl bg-muted px-3 py-2 text-sm">
            <span className="font-medium">{t.admin.templateVar.note}: </span>
            {request.admin_note}
          </p>
        )}

        {isNew ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <Button onClick={onApprove} disabled={isPending} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90">
              <Check className="h-4 w-4" />
              {t.admin.requestApprove}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              className="gap-1.5"
              render={
                <Link href={`/admin/locations/new?from=${request.id}`}>
                  <Pencil className="h-4 w-4" />
                  {t.admin.requestEdit}
                </Link>
              }
            />
            <Button variant="destructive" onClick={onReject} disabled={isPending} className="gap-1.5">
              <X className="h-4 w-4" />
              {t.admin.requestReject}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <Button
              onClick={onNotify}
              className="gap-1.5 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
            >
              <MessageSquareText className="h-4 w-4" />
              {t.admin.requestNotify}
            </Button>
            {request.location?.slug && (
              <Button
                variant="outline"
                nativeButton={false}
                className="gap-1.5"
                render={
                  <Link href={`/locations/${request.location.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    {t.admin.requestViewLocation}
                  </Link>
                }
              />
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <span>
            {new Date(request.created_at).toLocaleString(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-GB", {
              timeZone: "Asia/Riyadh",
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
          <div className="ms-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              className="gap-1"
              render={
                <a href={buildWhatsAppMessageUrl(request.owner_phone, "")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {t.admin.requestContact}
                </a>
              }
            />
            {request.maps_url && (
              <Button
                size="sm"
                variant="ghost"
                nativeButton={false}
                className="gap-1"
                render={
                  <a href={request.maps_url} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-3.5 w-3.5" />
                    {t.admin.requestMap}
                  </a>
                }
              />
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              aria-label={t.admin.delete}
              onClick={() => {
                if (confirm(t.admin.deleteRequestConfirm)) {
                  startTransition(() => deleteRequest(request.id));
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function RequestsList({
  requests: initialRequests,
  templates,
  notifyId,
}: {
  requests: LocationRequest[];
  templates: WhatsAppTemplate[];
  notifyId?: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<Filter>("all");
  const [notifying, setNotifying] = useState<LocationRequest | null>(null);
  const [approving, setApproving] = useState<LocationRequest | null>(null);
  const [rejecting, setRejecting] = useState<LocationRequest | null>(null);

  // Server data wins after a revalidation (e.g. a delete).
  // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from new server props
  useEffect(() => setRequests(initialRequests), [initialRequests]);

  // Arriving from "edit, then publish": open the WhatsApp message for that request.
  // Done after mount because the message needs window.location.origin for the link.
  useEffect(() => {
    const target = notifyId ? initialRequests.find((r) => r.id === notifyId) : undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time open driven by the URL
    if (target) setNotifying(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on arrival
  }, [notifyId]);

  const replace = (updated: LocationRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setNotifying(updated);
  };

  const closeNotify = () => {
    setNotifying(null);
    if (notifyId) router.replace("/admin/requests", { scroll: false });
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.admin.requestFilterAll },
    { key: "new", label: t.admin.requestStatus.new },
    { key: "approved", label: t.admin.requestStatus.approved },
    { key: "rejected", label: t.admin.requestStatus.rejected },
  ];
  const visible = requests.filter((r) => matches(filter, r.status));

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{t.admin.requests}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.admin.requestsHint}</p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          className="gap-1.5"
          render={
            <Link href="/admin/requests/messages">
              <MessageSquareText className="h-4 w-4" />
              {t.admin.messages}
            </Link>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(({ key, label }) => {
          const count = requests.filter((r) => matches(key, r.status)).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                filter === key ? "border-transparent bg-foreground text-background" : "border-border/60 hover:bg-accent"
              }`}
            >
              {label}
              <span className="text-xs tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-muted-foreground">
          <Inbox className="h-8 w-8" />
          <p>{t.admin.requestsEmpty}</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {visible.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={() => setApproving(request)}
              onReject={() => setRejecting(request)}
              onNotify={() => setNotifying(request)}
            />
          ))}
        </AnimatePresence>
      )}

      <ApproveDialog
        request={approving}
        onClose={() => setApproving(null)}
        onApproved={(updated) => {
          setApproving(null);
          replace(updated);
        }}
      />
      <RejectDialog
        request={rejecting}
        onClose={() => setRejecting(null)}
        onRejected={(updated) => {
          setRejecting(null);
          replace(updated);
        }}
      />
      <NotifyDialog request={notifying} templates={templates} onClose={closeNotify} />
    </div>
  );
}
