import type { StudioAreaSlug } from "./area-meta";

/**
 * Equipo del Studio: fuente única para /nosotros (equipo completo) y para el
 * equipo de cada área (Figma "SERVICIOS": Branding `8:397`, Architecture `2:156`).
 *
 * TODO-contenido: Figma no trae fotos (rectángulos de placeholder). Cuando
 * lleguen, exportarlas a 928 × 1170 (4:5), WebP q≈80, en
 * `apps/web/public/team/<id>.webp` y completar `photo`. Sin foto, la tarjeta
 * muestra un retrato neutro con las iniciales.
 *
 * TODO-contenido: faltan las personas de Audiovisual & Animation y Web Design.
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: { src: string; width: number; height: number };
}

export interface StudioTeamMember extends TeamMember {
  /** Áreas en las que participa, en el orden de `STUDIO_AREAS`. */
  areas: StudioAreaSlug[];
}

/** Orden de Figma: por filas, de izquierda a derecha. */
export const TEAM: StudioTeamMember[] = [
  {
    id: "anna-sanhueza",
    name: "Anna Sanhueza",
    role: "Directora Creativa",
    areas: ["branding", "architecture"]
  },
  {
    id: "sebastian-robles",
    // TODO-contenido: Figma escribe "Sebastian" sin tilde; confirmar con la persona.
    name: "Sebastian Robles",
    role: "Dirección Arquitectura",
    areas: ["branding", "architecture"]
  },
  {
    id: "javiera-diaz",
    name: "Javiera Díaz",
    role: "Directora de Arte",
    areas: ["branding", "architecture"]
  },
  {
    id: "catalina-torres",
    name: "Catalina Torres",
    role: "Planner & Art",
    areas: ["branding", "architecture"]
  },
  { id: "fa-casol", name: "Fa Casol", role: "Branding", areas: ["branding"] },
  { id: "ernesto-ojeda", name: "Ernesto Ojeda", role: "Arquitecto", areas: ["architecture"] },
  {
    id: "nicolas-rebolledo",
    name: "Nicolás Rebolledo",
    role: "Arquitecto",
    areas: ["architecture"]
  }
];

const teamFor = (area: StudioAreaSlug): TeamMember[] =>
  TEAM.filter((member) => member.areas.includes(area)).map(({ id, name, role, photo }) =>
    photo ? { id, name, role, photo } : { id, name, role }
  );

/**
 * Equipo por área, derivado de `TEAM` (conserva el orden de Figma). Un área sin
 * personas cargadas queda con la lista vacía.
 */
export const AREA_TEAMS: Record<StudioAreaSlug, TeamMember[]> = {
  branding: teamFor("branding"),
  architecture: teamFor("architecture"),
  audiovisual: teamFor("audiovisual"),
  "web-design": teamFor("web-design")
};

/** Iniciales para el retrato de reemplazo: primera letra de nombre y apellido. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words.at(-1)!] : words;
  return letters.map((word) => word.charAt(0).toLocaleUpperCase("es")).join("");
}
