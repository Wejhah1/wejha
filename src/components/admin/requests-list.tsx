"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Inbox, MapPin, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { Button } from "@/components/ui/button";
import { deleteRequest, updateRequestStatus } from "@/app/admin/(protected)/actions";
import type { LocationRequest, LocationRequestStatus } from "@/lib/types";

const STATUSES: LocationRequestStatus[] = ["new", "contacted", "added", "rejected"];

const STATUS_STYLES: Record<LocationRequestStatus, string> = {
  new: "bg-primary text-primary-foreground",
  contacted: "bg-chart-2 text-white",
  added: "bg-brand text-brand-foreground",
  rejected: "bg-muted-foreground/20 text-foreground",
};

function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "").replace(/^0(?=5)/, "966")}`;
}

function RequestCard({ request }: { request: LocationRequest }) {
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

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-border/60 bg-card transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
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

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
          <Button
            size="sm"
            nativeButton={false}
            className="gap-1.5"
            render={
              <Link href={`/admin/locations/new?from=${request.id}`}>
                <Plus className="h-3.5 w-3.5" />
                {t.admin.requestCreate}
              </Link>
            }
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            className="gap-1.5"
            render={
              <a href={whatsappHref(request.owner_phone)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-3.5 w-3.5" />
                {t.admin.requestContact}
              </a>
            }
          />
          {request.maps_url && (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              className="gap-1.5"
              render={
                <a href={request.maps_url} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-3.5 w-3.5" />
                  {t.admin.requestMap}
                </a>
              }
            />
          )}

          <div className="ms-auto flex items-center gap-1">
            <select
              aria-label="Status"
              value={request.status}
              disabled={isPending}
              onChange={(e) =>
                startTransition(() => updateRequestStatus(request.id, e.target.value as LocationRequestStatus))
              }
              className="h-7 rounded-lg border border-input bg-background px-2 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t.admin.requestStatus[s]}
                </option>
              ))}
            </select>
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
        <p className="text-xs text-muted-foreground">
          {new Date(request.created_at).toLocaleString(locale === "ar" ? "ar-SA" : "en-GB")}
        </p>
      </div>
    </article>
  );
}

export function RequestsList({ requests }: { requests: LocationRequest[] }) {
  const { t } = useLocale();

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t.admin.requests}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.admin.requestsHint}</p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-muted-foreground">
          <Inbox className="h-8 w-8" />
          <p>{t.admin.requestsEmpty}</p>
        </div>
      ) : (
        requests.map((request) => <RequestCard key={request.id} request={request} />)
      )}
    </div>
  );
}
