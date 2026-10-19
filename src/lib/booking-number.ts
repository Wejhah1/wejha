// The admin's booking WhatsApp number is remembered per browser so it only
// has to be typed once; it is a convenience, not a source of truth.
const KEY = "wejha-booking-number";

export function getSavedBookingNumber() {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveBookingNumber(value: string) {
  try {
    if (value.trim()) localStorage.setItem(KEY, value.trim());
  } catch {
    // ignore
  }
}
