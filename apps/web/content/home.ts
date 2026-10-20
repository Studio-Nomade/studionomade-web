/**
 * Contenido de la home pública.
 *
 * Vive aparte de `projects.ts` y `areas.ts` a propósito: la home solo necesita
 * portada, código de área y año de cada caso destacado, y así no se acopla al
 * modelo completo de proyecto. Los enlaces apuntan a `/proyectos/<slug>`.
 *
 * Origen: home del sitio legado (estructura y textos) y rediseño 2026 (códigos
 * de área B&D / A&D y acentos). Lo marcado `TODO-contenido` espera validación.
 */
import { SOCIAL_LINKS } from "./social";

/** Códigos de área del rediseño: Branding & Design y Architecture & Design. */
export type HomeAreaCode = "B&D" | "A&D";

export interface HomeImage {
  src: string;
  alt: string;
  /** Punto de interés para el recorte con `object-fit: cover` (por defecto, centro). */
  focus?: "left" | "center" | "right";
}

export interface HomeFeaturedProject {
  slug: string;
  title: string;
  code: HomeAreaCode;
  /** Área de negocio: activa el acento (`data-accent`). */
  area: "branding" | "architecture";
  year: string;
  /** Disciplinas del caso, en el orden del diseño. */
  disciplines: string[];
  image: HomeImage;
}

export const AREA_LABELS: Record<HomeAreaCode, string> = {
  "B&D": "Branding & Design",
  "A&D": "Architecture & Design"
};

/** Slider del hero: los 5 casos del rediseño, en el orden del ciclo de casos. */
export const HOME_FEATURED: HomeFeaturedProject[] = [
  {
    slug: "cinnalove",
    title: "CinnaLove",
    code: "B&D",
    area: "branding",
    year: "2025",
    disciplines: ["Research", "Branding", "Packaging"],
    image: {
      src: "/home/legado/cinnalove.webp",
      alt: "Bolsas de CinnaLove con el isotipo en espiral sobre fondo gris",
      focus: "left"
    }
  },
  {
    slug: "kumelen",
    title: "Kumelen",
    code: "B&D",
    area: "branding",
    year: "2025",
    disciplines: ["Research", "Branding", "Diseño Web"],
    image: {
      src: "/home/legado/kumelen.webp",
      alt: "Afiches de Kumelen en un muro urbano mientras pasa un peatón",
      focus: "center"
    }
  },
  {
    slug: "equifax",
    title: "Equifax",
    code: "A&D",
    area: "architecture",
    year: "2024",
    disciplines: ["Experiencia", "Branding", "Render"],
    image: {
      src: "/home/legado/equifax.webp",
      alt: "Render nocturno del stand Equifax Fast Track con autos y pantallas",
      focus: "center"
    }
  },
  {
    slug: "reebok-x-lollapalooza",
    title: "Reebok x Lollapalooza",
    code: "A&D",
    area: "architecture",
    year: "2025",
    disciplines: ["Stand", "Activación", "Render"],
    image: {
      src: "/home/legado/reebok-x-lollapalooza.webp",
      alt: "Stand circular de Reebok en Lollapalooza al atardecer, con público",
      focus: "center"
    }
  },
  {
    slug: "nexa",
    title: "Nexa",
    code: "B&D",
    area: "branding",
    year: "2024",
    disciplines: ["Branding", "Identidad", "Arte"],
    image: {
      src: "/home/legado/nexa.webp",
      alt: "Tarjetas de presentación de Nexa Energía en tono coral",
      focus: "center"
    }
  }
];

/** Bloque "Creative Movement": texto de la home actual. */
export const HOME_MANIFESTO = {
  eyebrow: "Creative",
  title: "Movement",
  lead: "Somos un estudio enfocado en la comunicación asertiva y la creatividad.",
  body: "Buscamos trabajar en conjunto con personas que desean llevar sus ideas y expresiones a resoluciones, respuestas e identidades auténticas.",
  /** Cifras aprobadas en las páginas de área (decisión del cliente). */
  stats: [
    { value: 100, prefix: "+", label: "Marcas desarrolladas" },
    { value: 50, prefix: "+", label: "Experiencias diseñadas" }
  ]
} as const;

export interface HomeService {
  name: string;
  code: string;
  description: string;
  /** Sin página propia: la tarjeta lleva al formulario de contacto. */
  href: string;
  /** Solo las áreas con página tienen acento propio. */
  accent?: "branding" | "architecture";
  image: HomeImage;
}

// TODO-contenido: bajada de la sección Servicios, por validar con el equipo.
export const HOME_SERVICES_NOTE =
  "Cuatro áreas que trabajan juntas, de la marca al espacio y la pantalla.";

export const HOME_SERVICES: HomeService[] = [
  {
    name: "Branding",
    code: "B&D",
    description:
      "Desarrollamos y renovamos marcas con una metodología propia, para construir identidades auténticas, coherentes y memorables.",
    href: "/areas/branding",
    accent: "branding",
    image: {
      src: "/home/branding-collateral-2.webp",
      alt: "Papelería de la marca Boden en verde y negro"
    }
  },
  {
    name: "Architecture",
    code: "A&D",
    description:
      "Diseñamos espacios que van más allá de lo funcional para convertirse en experiencias memorables.",
    href: "/areas/architecture",
    accent: "architecture",
    image: {
      src: "/home/arch-value-2.webp",
      alt: "Render de un stand modular iluminado en azul"
    }
  },
  {
    name: "Audiovisual",
    code: "AV",
    // TODO-contenido: validar la descripción con el equipo.
    description:
      "Fotografía, video y motion para contar cada proyecto desde nuestro estudio fotográfico.",
    href: "#contacto",
    image: {
      src: "/home/cinnalove-banner-1.webp",
      alt: "Fotografía de producto de un rollo de canela de CinnaLove"
    }
  },
  {
    name: "Web Design",
    code: "WD",
    // TODO-contenido: validar la descripción con el equipo.
    description: "Sitios y experiencias digitales a medida, del diseño de interfaz al desarrollo.",
    href: "#contacto",
    image: {
      src: "/home/branding-project-2.webp",
      alt: "Sitio web de OMG Superfood en tablet, notebook y teléfono"
    }
  }
];

export const HOME_MEETING = {
  kicker: "¿Tienes un proyecto en mente?",
  lines: ["Agendemos", "una reunión"],
  cta: "Agenda una reunión",
  href: "#contacto",
  image: {
    src: "/home/legado/reunion.webp",
    alt: ""
  }
} as const;

/**
 * Reel del estudio. El legado lo abría desde Vimeo/YouTube en un lightbox, pero
 * la URL no está en los assets recuperados.
 *
 * TODO-contenido: pegar la URL pública de Vimeo del reel (el CSP solo permite
 * `player.vimeo.com`). Vacío, el botón de reproducir no se muestra.
 */
export const HOME_REEL = {
  title: "Reel",
  reelUrl: "",
  poster: {
    src: "/home/legado/reel.webp",
    alt: "Render del espacio Jaecoo 7 en un centro comercial, portada del reel"
  }
} as const;

/**
 * URL de inserción del reel. Solo acepta Vimeo por HTTPS (único origen de video
 * permitido por el CSP); cualquier otra cosa devuelve `null`.
 */
export function reelEmbedUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  const segments = url.pathname.split("/").filter(Boolean);
  const idIndex = segments.findIndex((segment) => /^\d+$/.test(segment));
  if (idIndex < 0) return null;
  const embed = new URL(`https://player.vimeo.com/video/${segments[idIndex]}`);
  // Videos no listados: el hash va en la ruta (vimeo.com/123/abc) o en `h`.
  const hash = url.searchParams.get("h") ?? segments[idIndex + 1];
  if (hash && /^[\da-f]+$/i.test(hash)) embed.searchParams.set("h", hash);
  embed.searchParams.set("autoplay", "1");
  embed.searchParams.set("dnt", "1");
  return embed.toString();
}

export const HOME_INSTAGRAM = {
  title: "Instagram",
  handle: "@studionomade",
  href: SOCIAL_LINKS.instagram,
  images: [
    { src: "/home/mockup-kumelen.webp", alt: "Mockup móvil de Kumelen" },
    { src: "/home/branding-collateral-1.webp", alt: "Papelería de la marca Berose" },
    { src: "/home/branding-project-3.webp", alt: "Bolsa reutilizable de CinnaLove" },
    { src: "/home/mockup-nexa.webp", alt: "Mockup móvil de Nexa Energía" },
    { src: "/home/arch-gallery-1.webp", alt: "Merchandising de Equifax Activa el turbo" }
  ] satisfies HomeImage[]
} as const;

export interface HomePost {
  title: string;
  date: string;
  /** Fecha legible, ya formateada en español. */
  dateLabel: string;
  tags: string[];
  image: HomeImage;
}

/** "Últimas publicaciones" de la home actual (el blog aún no tiene ruta propia). */
export const HOME_POSTS: HomePost[] = [
  {
    title: "Guía: Paso a paso para crear un sitio web efectivo",
    date: "2025-11-26",
    dateLabel: "26 nov 2025",
    tags: ["Empresas emergentes", "Ecommerce", "Web Design", "Desarrollo web"],
    image: {
      src: "/home/legado/blog-sitio-web.webp",
      alt: "Equipo trabajando sobre un mapa de experiencia con notas adhesivas"
    }
  }
];

/** Consentimiento vigente del formulario de la home (con enlace a /privacidad). */
export const HOME_CONTACT_CONSENT_VERSION = "2026-10-v1" as const;

export interface HomeOffice {
  name: string;
  address: string;
  detail: string;
  commune: string;
  mapsUrl: string;
}

const mapsSearch = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const HOME_OFFICES: HomeOffice[] = [
  {
    name: "Oficina Principal",
    address: "Av. Providencia 1208",
    detail: "Of. 207",
    commune: "Providencia, Santiago",
    mapsUrl: mapsSearch("Avenida Providencia 1208, Providencia, Santiago, Chile")
  },
  {
    name: "Estudio Fotográfico",
    address: "Santa Beatriz 100",
    detail: "Of. 1101",
    commune: "Providencia, Santiago",
    mapsUrl: mapsSearch("Santa Beatriz 100, Providencia, Santiago, Chile")
  }
];
