import type { StudioAreaSlug } from "./area-meta";

/**
 * Contenido de /nosotros. Estructura inspirada en páginas "about" de estudios
 * (declaración, fundamento, ubicaciones, áreas, método, equipo y CTA).
 *
 * Regla editorial: sin testimonios, clientes ni cifras que no estén
 * confirmados por el estudio.
 */

export interface AboutImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface StudioLocation {
  city: string;
  country: string;
  /** Zona horaria IANA para la hora local en vivo. */
  timeZone: string;
}

export interface AboutPillar {
  title: string;
  text: string;
}

export interface MethodStep {
  title: string;
  text: string;
}

export const ABOUT = {
  hero: {
    eyebrow: "Nosotros",
    title: "Creative Movement",
    statement:
      "Somos un estudio creativo que une estrategia, diseño, espacio y tecnología para que las ideas se conviertan en marcas, lugares y experiencias con movimiento propio.",
    image: {
      src: "/areas/audiovisual/equipo-creative-movement.webp",
      alt: "Polera negra con el logotipo Studio Nomade Creative Movement.",
      width: 1600,
      height: 900
    }
  },
  foundation: {
    title: "Fundamento",
    lead: "Creemos en la comunicación asertiva y en la creatividad como método de trabajo. Cada proyecto parte por entender a las personas y termina en algo que se puede ver, recorrer y usar.",
    pack: {
      title: "Nos movemos en manada",
      text: "Somos un equipo multidisciplinario que trabaja en conjunto desde el primer día: estrategia, diseño, arquitectura, producción audiovisual y desarrollo web en una misma conversación, junto a cada cliente."
    },
    pillars: [
      {
        title: "Estrategia",
        text: "Ordenamos objetivos, audiencias y mensajes antes de diseñar."
      },
      {
        title: "Diseño",
        text: "Construimos identidades y piezas coherentes, pensadas para sostenerse en el tiempo."
      },
      {
        title: "Espacio",
        text: "Llevamos las marcas a lugares físicos: interiores, stands y experiencias."
      },
      {
        title: "Tecnología",
        text: "Diseñamos y desarrollamos sitios y herramientas digitales que funcionan."
      }
    ] satisfies AboutPillar[],
    images: [
      {
        src: "/areas/audiovisual/rodaje-festival.webp",
        alt: "Integrante del equipo grabando con un estabilizador frente a un mural de madera en un festival.",
        width: 1600,
        height: 900
      },
      {
        src: "/areas/audiovisual/produccion-en-terreno.webp",
        alt: "Productora del estudio coordinando por radio durante una producción en terreno.",
        width: 1600,
        height: 900
      }
    ] satisfies AboutImage[]
  },
  locations: {
    title: "Dónde estamos",
    lead: "Trabajamos entre Chile y Europa. Esta es la hora en cada una de nuestras bases.",
    items: [
      { city: "Santiago", country: "Chile", timeZone: "America/Santiago" },
      { city: "Algarrobo", country: "Chile", timeZone: "America/Santiago" },
      { city: "Madrid", country: "España", timeZone: "Europe/Madrid" },
      { city: "Lisboa", country: "Portugal", timeZone: "Europe/Lisbon" }
    ] satisfies StudioLocation[]
  },
  areas: {
    title: "Nuestras áreas",
    lead: "Cuatro áreas especializadas que se combinan según lo que cada proyecto necesita.",
    descriptions: {
      branding: "Identidad, estrategia de marca y piezas gráficas.",
      architecture: "Interiores, stands y experiencias en el espacio.",
      audiovisual: "Producción audiovisual, animación y contenido.",
      "web-design": "Sitios web, interfaces y desarrollo."
    } satisfies Record<StudioAreaSlug, string>
  },
  method: {
    title: "Método",
    lead: "Un proceso claro para avanzar con confianza, de la primera conversación al lanzamiento.",
    steps: [
      {
        title: "Descubrir",
        text: "Escuchamos e investigamos para entender tu negocio, tus audiencias y lo que necesitas lograr."
      },
      {
        title: "Estrategia",
        text: "Definimos objetivos, mensajes y el camino creativo. Acordamos alcance, plazos y entregables."
      },
      {
        title: "Diseño y desarrollo",
        text: "Creamos, prototipamos y producimos con revisiones en cada etapa, sumando las áreas que el proyecto requiere."
      },
      {
        title: "Implementación y acompañamiento",
        text: "Lanzamos contigo y seguimos a tu lado para medir, ajustar y hacer crecer lo construido."
      }
    ] satisfies MethodStep[]
  },
  team: {
    title: "Conoce al equipo",
    lead: "Las personas detrás de cada proyecto."
  },
  cta: {
    /** Una línea por renglón (el CTA se revela por líneas). */
    titleLines: ["¿Tienes un proyecto", "en mente?"],
    text: "Cuéntanos qué necesitas o agenda una videollamada con el equipo.",
    primary: { label: "Escríbenos", href: "/contacto" },
    secondary: { label: "Agendar videollamada", href: "/contacto#agenda" }
  }
};
