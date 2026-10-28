import type { Metadata } from "next";

/**
 * Las cuatro áreas del Studio: fuente única para menú, home, proyectos y
 * favicons. Las páginas de cada área (`/areas/<slug>`) viven en `areas.ts`.
 */
export type StudioAreaSlug = "branding" | "architecture" | "audiovisual" | "web-design";

export interface StudioAreaMeta {
  slug: StudioAreaSlug;
  /** Sigla del área (B&D, A&D, A&A, WD). */
  code: "B&D" | "A&D" | "A&A" | "WD";
  /** Nombre completo como lo usa la marca. */
  name: string;
  /** Acento del design system (`data-accent`). */
  accent: StudioAreaSlug;
  href: `/areas/${StudioAreaSlug}`;
  /** Isologo del área a color, fondo transparente (256 px). */
  symbol: string;
}

export const STUDIO_AREAS: StudioAreaMeta[] = [
  {
    slug: "branding",
    code: "B&D",
    name: "Branding & Design",
    accent: "branding",
    href: "/areas/branding",
    symbol: "/brand/areas/branding.png"
  },
  {
    slug: "architecture",
    code: "A&D",
    name: "Architecture & Design",
    accent: "architecture",
    href: "/areas/architecture",
    symbol: "/brand/areas/architecture.png"
  },
  {
    slug: "audiovisual",
    code: "A&A",
    name: "Audiovisual & Animation",
    accent: "audiovisual",
    href: "/areas/audiovisual",
    symbol: "/brand/areas/audiovisual.png"
  },
  {
    slug: "web-design",
    code: "WD",
    name: "Web Design",
    accent: "web-design",
    href: "/areas/web-design",
    symbol: "/brand/areas/web-design.png"
  }
];

export const AREA_BY_SLUG = Object.fromEntries(STUDIO_AREAS.map((a) => [a.slug, a])) as Record<
  StudioAreaSlug,
  StudioAreaMeta
>;

/** Favicons (general o del área): negro con el isologo al centro. */
export function faviconFor(key: "studio" | StudioAreaSlug): Metadata["icons"] {
  return {
    icon: [
      { url: `/icons/${key}-32.png`, sizes: "32x32", type: "image/png" },
      { url: `/icons/${key}-512.png`, sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: `/icons/${key}-180.png`, sizes: "180x180", type: "image/png" }]
  };
}
