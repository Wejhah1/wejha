import { getFactIcon } from "@/lib/fact-icons";

export interface FactItem {
  text: string;
  icon?: string;
}

export function FactChips({ facts }: { facts: FactItem[] }) {
  if (facts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {facts.map((fact, i) => {
        const Icon = getFactIcon(fact.icon);
        return (
          <span
            key={i}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-accent/50 py-1.5 pe-4 ps-2 text-sm font-medium"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {fact.text}
          </span>
        );
      })}
    </div>
  );
}
