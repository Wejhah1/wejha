import { CheckCircle2 } from "lucide-react";

export function FactChips({ facts }: { facts: string[] }) {
  if (facts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {facts.map((fact, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 rounded-full border border-border/60 bg-accent/50 px-3 py-1.5 text-sm font-medium"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-brand-foreground/70" />
          {fact}
        </span>
      ))}
    </div>
  );
}
