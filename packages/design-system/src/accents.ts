export const ACCENTS = [
  "inmobiliarias",
  "branding",
  "architecture",
  "audiovisual",
  "web-design",
  "cinnalove",
  "kumelen",
  "nexa",
  "equifax",
  "reebok"
] as const;

export type AccentName = (typeof ACCENTS)[number];
