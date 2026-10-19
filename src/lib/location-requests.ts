import type { LocationRequest } from "@/lib/types";

export const REQUEST_IMAGES_BUCKET = "location-request-images";
export const REQUEST_MIN_PHOTOS = 3;
export const REQUEST_MAX_PHOTOS = 10;
export const REQUEST_MAX_FEATURES = 20;

export const TEMPLATE_VARIABLES = ["name", "location", "link", "note"] as const;
export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

export function renderTemplate(body: string, values: Record<TemplateVariable, string>) {
  return (
    body
      .split("\n")
      // A line holding only an empty variable (e.g. {note} with no note) is dropped entirely.
      .filter((line) => {
        const only = line.trim().match(/^\{(\w+)\}$/);
        return !only || !(only[1] in values) || values[only[1] as TemplateVariable].trim();
      })
      .join("\n")
      .replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? values[key as TemplateVariable] : match,
      )
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export function templateValues(request: LocationRequest, origin: string): Record<TemplateVariable, string> {
  return {
    name: request.owner_name,
    location: request.name_ar,
    link: request.location?.slug ? `${origin}/locations/${request.location.slug}` : "",
    note: request.admin_note ?? "",
  };
}
