/**
 * Contenido de la home pública.
 *
 * El hero se arma desde `projects.ts` (`publicProjects`): título, área, año e
 * imagen del caso salen de ahí y aquí solo se ajusta lo propio de la home
 * (recorte, disciplinas que el caso no declara, video futuro). Las áreas salen
 * de `area-meta.ts` (`STUDIO_AREAS`) y aquí se les da su par de imágenes.
 *
 * Origen: home del sitio legado (estructura y textos) y rediseño 2026 (códigos
 * de área y acentos). Lo marcado `TODO-contenido` espera validación.
 */
import { STUDIO_AREAS, AREA_BY_SLUG, type StudioAreaMeta, type StudioAreaSlug } from "./area-meta";
import { publicProjects, type PublicProject } from "./projects";
import { SOCIAL_LINKS } from "./social";

export interface HomeImage {
  src: string;
  alt: string;
  /** Punto de interés para el recorte con `object-fit: cover` (por defecto, centro). */
  focus?: "left" | "center" | "right";
}

/**
 * Video de una diapositiva del hero. Con video, la imagen deja de mostrarse y
 * `poster` es lo que se ve mientras carga (y con movimiento reducido).
 */
export interface HomeHeroVideo {
  src: string;
  poster: string;
  type?: "video/mp4" | "video/webm";
}

export interface HomeHeroSlide {
  slug: string;
  title: string;
  href: `/proyectos/${string}`;
  /** Sigla del área del caso (B&D, A&D…): va en el cuadrado del botón. */
  code: StudioAreaMeta["code"];
  /** Área del caso: activa el acento (`data-accent`). */
  area: StudioAreaSlug;
  areaName: string;
  year: string;
  /** Disciplinas del caso, en el orden del diseño (puede ir vacío). */
  disciplines: string[];
  image: HomeImage;
  video?: HomeHeroVideo;
}

/**
 * Ajustes de la home por caso. La imagen por defecto es la del bloque `hero`
 * del caso (o su portada); se reemplaza solo si no sirve a pantalla completa.
 */
const HERO_OVERRIDES: Record<
  string,
  { image?: HomeImage; focus?: HomeImage["focus"]; disciplines?: string[]; video?: HomeHeroVideo }
> = {
  "reebok-x-lollapalooza": { disciplines: ["Stand", "Activación", "Render"] },
  nexa: { disciplines: ["Branding", "Identidad", "Arte"] },
  // La portada del caso es merchandising de otro proyecto: se usa la del área.
  "jaecoo-7": {
    image: {
      src: "/areas/architecture/galeria-jaecoo.webp",
      alt: "Visitantes frente a la pantalla del lanzamiento del Jaecoo 7 en un centro comercial"
    }
  }
};

/** Diapositiva del hero a partir del caso publicado. */
export function heroSlideFrom(project: PublicProject): HomeHeroSlide {
  const override = HERO_OVERRIDES[project.slug] ?? {};
  const hero = project.blocks.find((block) => block.type === "hero");
  const caseImage = hero?.type === "hero" ? hero.image : project.cover;
  const image = override.image ?? { src: caseImage.src, alt: caseImage.alt };
  return {
    slug: project.slug,
    title: project.title,
    href: `/proyectos/${project.slug}`,
    code: project.areaCode,
    area: project.area,
    areaName: AREA_BY_SLUG[project.area].name,
    year: project.year,
    disciplines: override.disciplines ?? (hero?.type === "hero" ? (hero.tags ?? []) : []),
    image: { ...image, focus: override.focus ?? image.focus },
    ...(override.video ? { video: override.video } : {})
  };
}

/** Hero: los casos publicados, en el orden de `publicProjects`. */
export const HOME_HERO_SLIDES: HomeHeroSlide[] = publicProjects.map(heroSlideFrom);

/** Bloque "Creative Movement": texto de la home actual. */
export const HOME_MANIFESTO = {
  title: "Creative Movement",
  lead: "Somos un estudio enfocado en la comunicación asertiva y la creatividad.",
  body: "Buscamos trabajar en conjunto con personas que desean llevar sus ideas y expresiones a resoluciones, respuestas e identidades auténticas.",
  /** Cifras aprobadas en las páginas de área (decisión del cliente). */
  stats: [
    { value: 100, prefix: "+", label: "Marcas desarrolladas" },
    { value: 50, prefix: "+", label: "Experiencias diseñadas" }
  ],
  /** El equipo vive en /nosotros; la home solo enlaza. */
  cta: { label: "Conoce al equipo", href: "/nosotros" }
} as const;

export interface HomeArea extends StudioAreaMeta {
  description: string;
  /** Imagen en reposo y la que la reemplaza al pasar el cursor (o al hacer scroll en táctil). */
  images: [HomeImage, HomeImage];
}

// TODO-contenido: bajada de la sección Áreas, por validar con el equipo.
export const HOME_AREAS_NOTE =
  "Cuatro áreas que trabajan juntas, de la marca al espacio y la pantalla.";

const AREA_CONTENT: Record<StudioAreaSlug, Pick<HomeArea, "description" | "images">> = {
  branding: {
    description:
      "Desarrollamos y renovamos marcas con una metodología propia, para construir identidades auténticas, coherentes y memorables.",
    images: [
      {
        src: "/areas/branding/galeria-cinnalove.webp",
        alt: "Bolsa de tela de CinnaLove con el trazo de canela"
      },
      { src: "/proyectos/nexa/hero.webp", alt: "Tarjetas de presentación de NEXA en tono coral" }
    ]
  },
  architecture: {
    description:
      "Diseñamos espacios que van más allá de lo funcional para convertirse en experiencias memorables.",
    images: [
      {
        src: "/areas/architecture/hero-reebok-eternal-trend.webp",
        alt: "Stand circular de Reebok Eternal Trend en Lollapalooza"
      },
      {
        src: "/proyectos/equifax/grid-02.webp",
        alt: "Pantallas y simuladores del espacio Fast Track de Equifax"
      }
    ]
  },
  audiovisual: {
    // TODO-contenido: validar la descripción con el equipo.
    description:
      "Fotografía, video y motion para contar cada proyecto, del rodaje en terreno a la animación.",
    images: [
      {
        src: "/areas/audiovisual/rodaje-festival.webp",
        alt: "Integrante del equipo grabando con un gimbal en un festival"
      },
      {
        src: "/areas/audiovisual/gimbal-movil.webp",
        alt: "Teléfono en un gimbal durante una grabación"
      }
    ]
  },
  "web-design": {
    // TODO-contenido: validar la descripción con el equipo.
    description: "Sitios y experiencias digitales a medida, del diseño de interfaz al desarrollo.",
    images: [
      { src: "/home/mockup-kumelen.webp", alt: "Sitio móvil de Kumelen Endémico en un teléfono" },
      { src: "/home/mockup-nexa.webp", alt: "Sitio móvil de NEXA Energía en un teléfono" }
    ]
  }
};

/** Las cuatro áreas del Studio, en el orden de `STUDIO_AREAS`. */
export const HOME_AREAS: HomeArea[] = STUDIO_AREAS.map((area) => ({
  ...area,
  ...AREA_CONTENT[area.slug]
}));

export const HOME_MEETING = {
  kicker: "¿Tienes un proyecto en mente?",
  lines: ["Agendemos", "una reunión"],
  cta: "Agenda una reunión",
  href: "/contacto#agenda",
  image: {
    src: "/home/legado/reunion.webp",
    alt: ""
  }
} as const;

export const HOME_INSTAGRAM = {
  title: "Instagram",
  handle: "@studionomade_",
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

/**
 * Cierre de la home. El formulario vive en /contacto (con su consentimiento);
 * aquí solo se invita a ir allí o a agendar una videollamada.
 */
export const HOME_CONTACT = {
  title: "Contacto",
  lead: "Podemos ayudarte. ¡Conversemos!",
  primary: { label: "Cuéntanos tu proyecto", href: "/contacto" },
  secondary: { label: "Agendar una videollamada", href: "/contacto#agenda" }
} as const;
