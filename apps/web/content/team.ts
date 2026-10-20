import type { AreaSlug } from "./areas";

/**
 * Equipo por área (Figma "SERVICIOS": Branding `8:397`, Architecture `2:156`).
 *
 * TODO-contenido: Figma no trae fotos (rectángulos de placeholder). Cuando
 * lleguen, exportarlas a 928 × 1170 (4:5), WebP q≈80, en
 * `apps/web/public/team/<id>.webp` y completar `photo`. Sin foto, la tarjeta
 * muestra un retrato neutro con las iniciales.
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: { src: string; width: number; height: number };
}

const PEOPLE = {
  anna: { id: "anna-sanhueza", name: "Anna Sanhueza", role: "Directora Creativa" },
  // TODO-contenido: Figma escribe "Sebastian" sin tilde; confirmar con la persona.
  sebastian: { id: "sebastian-robles", name: "Sebastian Robles", role: "Dirección Arquitectura" },
  javiera: { id: "javiera-diaz", name: "Javiera Díaz", role: "Directora de Arte" },
  catalina: { id: "catalina-torres", name: "Catalina Torres", role: "Planner & Art" },
  fa: { id: "fa-casol", name: "Fa Casol", role: "Branding" },
  ernesto: { id: "ernesto-ojeda", name: "Ernesto Ojeda", role: "Arquitecto" },
  nicolas: { id: "nicolas-rebolledo", name: "Nicolás Rebolledo", role: "Arquitecto" }
} satisfies Record<string, TeamMember>;

/** Orden de Figma: por filas, de izquierda a derecha. */
export const AREA_TEAMS: Record<AreaSlug, TeamMember[]> = {
  branding: [PEOPLE.anna, PEOPLE.sebastian, PEOPLE.javiera, PEOPLE.catalina, PEOPLE.fa],
  architecture: [
    PEOPLE.anna,
    PEOPLE.sebastian,
    PEOPLE.javiera,
    PEOPLE.catalina,
    PEOPLE.ernesto,
    PEOPLE.nicolas
  ]
};

/** Iniciales para el retrato de reemplazo: primera letra de nombre y apellido. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words.at(-1)!] : words;
  return letters.map((word) => word.charAt(0).toLocaleUpperCase("es")).join("");
}
