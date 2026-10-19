export type LocationSetting = "indoor" | "outdoor" | "both";
export type AdminRole = "super_admin" | "admin";

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface City {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  created_at: string;
}

export interface Location {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  category_id: string | null;
  city_id: string | null;
  capacity: number | null;
  setting: LocationSetting;
  price_per_day: number;
  facts_ar: string[];
  facts_en: string[];
  fact_icons: string[];
  cover_image_url: string;
  cover_focal_x: number;
  cover_focal_y: number;
  gallery_urls: string[];
  whatsapp_number: string;
  whatsapp_contact_name: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  city?: City | null;
}

export interface Admin {
  id: string;
  email: string;
  role: AdminRole;
  invited_by: string | null;
  created_at: string;
}


export type LocationRequestStatus = "new" | "approved" | "edited" | "rejected";
export type RequestDecision = Exclude<LocationRequestStatus, "new">;

export interface LocationRequest {
  id: string;
  status: LocationRequestStatus;
  owner_name: string;
  owner_phone: string;
  owner_email: string | null;
  name_ar: string;
  name_en: string | null;
  category_id: string | null;
  category_other: string | null;
  city_id: string | null;
  city_other: string | null;
  district: string | null;
  maps_url: string | null;
  setting: LocationSetting;
  price_per_day: number | null;
  capacity: number | null;
  description: string | null;
  features: string[];
  image_urls: string[];
  location_id: string | null;
  admin_note: string | null;
  decided_at: string | null;
  created_at: string;
  category?: Category | null;
  city?: City | null;
  location?: Pick<Location, "slug"> | null;
}

export interface WhatsAppTemplate {
  key: RequestDecision;
  body: string;
  updated_at: string;
}
