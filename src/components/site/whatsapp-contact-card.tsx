"use client";

import { useState } from "react";
import { CalendarIcon, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLocale } from "@/lib/i18n/locale-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Location } from "@/lib/types";

export function WhatsAppContactCard({ location }: { location: Location }) {
  const { locale, t } = useLocale();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const name = locale === "ar" ? location.name_ar : location.name_en;

  const whatsappUrl = buildWhatsAppUrl({
    phone: location.whatsapp_number,
    locationName: name,
    date,
    locale,
  });

  return (
    <div className="sticky top-24 flex flex-col gap-4 rounded-2xl border border-border/60 p-6 shadow-sm">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold">
          {location.price_per_day.toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {t.location.currency} / {t.browse.perDay}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.location.selectDate}</span>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                <CalendarIcon className="h-4 w-4" />
                {date
                  ? format(date, "PPP", { locale: locale === "ar" ? ar : enUS })
                  : t.location.pickADate}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: new Date() }}
              locale={locale === "ar" ? ar : enUS}
              dir={locale === "ar" ? "rtl" : "ltr"}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        size="lg"
        nativeButton={false}
        className="gap-2 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
        render={
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            {t.location.contactWhatsapp}
          </a>
        }
      />
    </div>
  );
}
