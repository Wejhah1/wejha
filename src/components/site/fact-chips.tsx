import {
  Building2,
  Car,
  CheckCircle2,
  Home,
  Snowflake,
  Sofa,
  TreePine,
  Users,
  Volume2,
  Wifi,
  Zap,
} from "lucide-react";

// No per-fact icon field exists on the data model yet, so we infer a fitting
// icon from common keywords (Arabic + English) instead of showing the same
// generic checkmark for every fact — a lightweight visual upgrade that needs
// no schema change.
const KEYWORD_ICONS: [RegExp, React.ComponentType<{ className?: string }>][] = [
  [/باركينج|parking|سيارات|car/i, Car],
  [/واي فاي|wifi|إنترنت|internet/i, Wifi],
  [/تكييف|مكيف|ac\b|air.?condition/i, Snowflake],
  [/كهرباء|مولد|power|generator|electric/i, Zap],
  [/أثاث|furnish|مفروش|sofa/i, Sofa],
  [/حديقة|طبيعي|outdoor|garden|nature/i, TreePine],
  [/عزل|صوت|sound|quiet|acoustic/i, Volume2],
  [/شخص|أشخاص|capacity|people|guests/i, Users],
  [/غرف|مساحة|villa|studio|room|space/i, Home],
  [/مبنى|طوابق|building|floor/i, Building2],
];

function iconFor(fact: string) {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(fact));
  return match ? match[1] : CheckCircle2;
}

export function FactChips({ facts }: { facts: string[] }) {
  if (facts.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {facts.map((fact, i) => {
        const Icon = iconFor(fact);
        return (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-accent/40 px-3.5 py-3"
          >
            <Icon className="h-4 w-4 shrink-0 text-foreground/70" />
            <span className="text-sm font-medium">{fact}</span>
          </div>
        );
      })}
    </div>
  );
}
