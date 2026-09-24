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

