export const ACCENTS = ["inmobiliarias", "cinnalove", "kumelen", "nexa"] as const;

export type AccentName = (typeof ACCENTS)[number];
