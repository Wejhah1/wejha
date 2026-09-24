import {
  Accessibility,
  ArrowUpDown,
  Bath,
  Camera,
  Car,
  Check,
  Clock,
  Coffee,
  Home,
  Layers,
  Lightbulb,
  Mic,
  Music,
  ShieldCheck,
  Snowflake,
  Sofa,
  Sparkles,
  Star,
  Sun,
  Trees,
  Tv,
  Users,
  Utensils,
  Waves,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";

export type FactIcon = React.ComponentType<{ className?: string }>;

export const DEFAULT_FACT_ICON = "check";

export const FACT_ICONS: Record<string, FactIcon> = {
  check: Check,
  home: Home,
  users: Users,
  car: Car,
  wifi: Wifi,
  snowflake: Snowflake,
  sun: Sun,
  wind: Wind,
  lightbulb: Lightbulb,
  zap: Zap,
  camera: Camera,
  layers: Layers,
  sofa: Sofa,
  tv: Tv,
  mic: Mic,
  music: Music,
  coffee: Coffee,
  utensils: Utensils,
  trees: Trees,
  waves: Waves,
  bath: Bath,
  elevator: ArrowUpDown,
  accessibility: Accessibility,
  shield: ShieldCheck,
  clock: Clock,
  star: Star,
  sparkles: Sparkles,
};

export function getFactIcon(name: string | undefined | null): FactIcon {
  return (name && FACT_ICONS[name]) || Check;
}
