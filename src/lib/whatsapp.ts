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

// Accepts local Saudi formats (05XXXXXXXX, 5XXXXXXXX) and international ones
// (+9665…, 009665…) and returns the digits-only form wa.me expects.
export function toWhatsAppNumber(phone: string) {
  let digits = normalizePhone(phone);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("05")) return `966${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("5")) return `966${digits}`;
  return digits;
}

export function buildWhatsAppMessageUrl(phone: string, message: string) {
  const base = `https://wa.me/${toWhatsAppNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
