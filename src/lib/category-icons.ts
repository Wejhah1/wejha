import {
  Building2,
  Camera,
  Coffee,
  Factory,
  Home,
  Landmark,
  Mountain,
  Music,
  Palette,
  Sparkles,
  Store,
  Tent,
  Trees,
  Utensils,
  Waves,
} from "lucide-react";

export type CategoryIcon = React.ComponentType<{ className?: string }>;

export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  camera: Camera,
  home: Home,
  trees: Trees,
  landmark: Landmark,
  coffee: Coffee,
  factory: Factory,
  utensils: Utensils,
  palette: Palette,
  music: Music,
  building: Building2,
  store: Store,
  waves: Waves,
  mountain: Mountain,
  tent: Tent,
  sparkles: Sparkles,
};

export function getCategoryIcon(name: string | null): CategoryIcon {
  return (name && CATEGORY_ICONS[name]) || Sparkles;
}
