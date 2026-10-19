// Requests submitted from this browser, so owners can follow their status
// without an account. Per-device only; it's fine for this to come back empty.
const KEY = "wejha-my-requests";
export const MY_REQUESTS_EVENT = "wejha-my-requests-changed";

export interface SavedRequest {
  id: string;
  name: string;
  createdAt: string;
}

export function getSavedRequests(): SavedRequest[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((r) => typeof r?.id === "string") : [];
  } catch {
    return [];
  }
}

function write(list: SavedRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
    window.dispatchEvent(new Event(MY_REQUESTS_EVENT));
  } catch {
    // storage unavailable — the list just won't persist
  }
}

export function saveRequest(request: SavedRequest) {
  write([request, ...getSavedRequests().filter((r) => r.id !== request.id)]);
}

export function forgetRequest(id: string) {
  write(getSavedRequests().filter((r) => r.id !== id));
}
