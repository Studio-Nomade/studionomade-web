export const ACCENTS = [
  "inmobiliarias",
  "branding",
  "architecture",
  "cinnalove",
  "kumelen",
  "nexa",
  "equifax",
  "reebok"
] as const;

export type AccentName = (typeof ACCENTS)[number];
