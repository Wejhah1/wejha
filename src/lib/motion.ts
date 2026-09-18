// Shared motion tokens so every animated surface (hero, cards, reveals,
// filters) moves with the same cinematic cadence instead of ad-hoc values.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

export const DURATION = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  cinematic: 1.4,
} as const;
