import type { Locale } from "@/lib/i18n/dictionary";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function formatDate(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function buildWhatsAppUrl({
  phone,
  locationName,
  date,
  locale,
}: {
  phone: string;
  locationName: string;
  date: Date | undefined;
  locale: Locale;
}) {
  const formattedDate = date ? formatDate(date, locale) : undefined;

  const message =
    locale === "ar"
      ? [
          `مرحباً، أنا مهتم بحجز موقع "${locationName}" على منصة وجهة.`,
          formattedDate ? `التاريخ المطلوب: ${formattedDate}.` : null,
          "هل هو متاح؟",
        ]
          .filter(Boolean)
          .join("\n")
      : [
          `Hi, I'm interested in booking "${locationName}" via Wejha.`,
          formattedDate ? `Requested date: ${formattedDate}.` : null,
          "Is it available?",
        ]
          .filter(Boolean)
          .join("\n");

  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
