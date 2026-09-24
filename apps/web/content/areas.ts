export type AreaSlug = "branding" | "architecture";

export type AreaContent = {
  slug: AreaSlug;
  accent: AreaSlug;
  title: string;
  services: string[];
  quote: string;
  note: string;
  what: string;
  values: { title: string; body: string }[];
  stats: { value: string; label: string }[];
  heroImage: string;
  collateral: [string, string];
  mockups: string[];
  method: string;
  tags: string[];
  outputs: string;
  types: string[];
  results: string;
  projects: { src: string; title: string; meta: string; wide?: boolean }[];
};

export const areas: Record<AreaSlug, AreaContent> = {
  branding: {
    slug: "branding",
    accent: "branding",
    title: "BRANDING",
    services: ["Logo", "Identity", "Illustrations", "Banners", "Print Production"],
    quote:
      "Combinamos estrategia, creatividad y análisis para diseñar marcas que conectan emocionalmente, destacan en el mercado y generan un impacto duradero.",
    note: "Metodología propia que nos permite construir marcas auténticas y memorables.",
    what: "En el área de Branding desarrollamos y renovamos marcas a través de una metodología propia, pensada para construir identidades auténticas, coherentes y memorables.",
    values: [
      {
        title: "Estrategia",
        body: "Diseñamos marcas desde el análisis y la definición clara de objetivos, no desde la intuición aislada."
      },
      {
        title: "Autenticidad",
        body: "Construimos identidades honestas, coherentes con la esencia de cada marca y su contexto real."
      },
      {
        title: "Cocreación",
        body: "Trabajamos junto a nuestros clientes, integrándolos activamente en cada etapa del proceso."
      },
      {
        title: "Coherencia",
        body: "Desarrollamos sistemas visuales y conceptuales consistentes, pensados para crecer y sostenerse en el tiempo."
      }
    ],
    stats: [
      { value: "+100", label: "Marcas desarrolladas" },
      { value: "+50", label: "Marcas creadas desde cero" }
    ],
    heroImage: "/home/branding-project-1.webp",
    collateral: ["/home/branding-collateral-1.webp", "/home/branding-collateral-2.webp"],
    mockups: ["/home/mockup-kumelen.webp", "/home/mockup-nexa.webp", "/home/mockup-humancorp.webp"],
    method:
      "Creemos que las marcas sólidas no nacen solo de la inspiración, sino del análisis, la observación y la búsqueda constante. Trabajamos desde la cocreación para que cada decisión responda a su esencia y objetivos reales.",
    tags: ["Research", "Concepto de marca", "Sistema visual", "Manual de marca"],
    outputs:
      "Entregamos definiciones estratégicas y sistemas visuales ordenados, listos para ser implementados de forma consistente en todos los puntos de contacto de la marca.",
    types: [
      "Estrategia de marca",
      "Creación de marca",
      "Rebranding",
      "Extensiones / Sub marcas",
      "Consultoría y auditoría de marca",
      "Branding para experiencias"
    ],
    results:
      "Marcas alineadas con su propósito, diferenciadas en su mercado y preparadas para crecer, conectar con sus audiencias y sostenerse en el tiempo.",
    projects: [
      { src: "/home/branding-project-1.webp", title: "CinnaLove", meta: "2025" },
      { src: "/home/branding-project-2.webp", title: "OMG Superfood Co.", meta: "2025" },
      { src: "/home/branding-project-3.webp", title: "idea", meta: "2024", wide: true }
    ]
  },
  architecture: {
    slug: "architecture",
    accent: "architecture",
    title: "ARCHITECTURE",
    services: ["Research", "Art Direction", "Render", "Prototipos", "Stand"],
    quote:
      "Diseñamos espacios que van más allá de lo funcional para convertirse en experiencias memorables.",
    note: "Del concepto al montaje en terreno, cuidando cada detalle.",
    what: "Creamos entornos que inspiran, conectan y reflejan la esencia de cada proyecto. Desde la conceptualización inicial hasta la ejecución final.",
    values: [
      {
        title: "Experiencia",
        body: "Diseñamos espacios que se viven y generan una experiencia memorable que conecta emocionalmente con las personas y la marca."
      },
      {
        title: "Estrategia",
        body: "Cada decisión espacial responde a un objetivo claro: comunicar, destacar y posicionar."
      },
      {
        title: "Coherencia",
        body: "Trasladamos la identidad de marca al espacio de manera consistente, cuidando cada detalle."
      },
      {
        title: "Precisión",
        body: "Combinamos creatividad con rigor técnico para asegurar soluciones viables y ejecutadas con alto estándar."
      }
    ],
    stats: [],
    heroImage: "/home/arch-1.webp",
    collateral: ["/home/arch-value-1.webp", "/home/arch-value-2.webp"],
    mockups: [],
    method:
      "Diseñamos espacios donde la creatividad y la estrategia se encuentran, dando vida a una idea potente que transforma lo visual en una experiencia viva.",
    tags: [
      "Investigación estratégica",
      "Concepto creativo",
      "Diseño 3D y visualizaciones",
      "Montaje en terreno"
    ],
    outputs:
      "Entregamos conceptos espaciales definidos, diseños arquitectónicos coherentes y piezas gráficas integradas, acompañadas de planimetrías, renders y lineamientos técnicos.",
    types: [
      "Stands para ferias y exposiciones",
      "Experiencias de marca y activaciones",
      "Espacios corporativos y comerciales",
      "Intervenciones espaciales para eventos",
      "Identidad de marca en espacios físicos"
    ],
    results:
      "Creamos espacios y experiencias que comunican la esencia de la marca, destacan en contextos de alta exposición y generan una conexión real con las personas.",
    projects: [
      { src: "/home/arch-1.webp", title: "Eternal Trend — Reebok", meta: "2025" },
      { src: "/home/arch-gallery-1.webp", title: "Jaecoo 7", meta: "2025" },
      { src: "/home/arch-gallery-2.webp", title: "Retail activation", meta: "2024", wide: true }
    ]
  }
};

export function isAreaSlug(value: string): value is AreaSlug {
  return value === "branding" || value === "architecture";
}
