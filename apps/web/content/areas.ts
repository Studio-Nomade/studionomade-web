/**
 * Contenido de las páginas de servicio por área (Figma "SERVICIOS": Branding
 * `8:327` y Architecture `2:2`). Los textos son literales del diseño, con las
 * correcciones aprobadas: el párrafo de Architecture cierra con punto y el
 * bloque de entregables se titula "¿Qué entregamos?".
 *
 * El equipo de cada área vive en `team.ts`.
 */
export type AreaSlug = "branding" | "architecture";

/** Texto con tramos destacados. El peso del destacado lo decide cada sección. */
export type RichText = Array<string | { strong: string }>;

export interface AreaImage {
  src: string;
  alt: string;
  /** Ancho y alto intrínsecos del archivo (export 2× de Figma). */
  width: number;
  height: number;
}

export interface AreaStat {
  /** Cifra que anima `Counter`. */
  value: number;
  /** Signo previo ("+"): es lo único que toma el color del acento. */
  prefix?: string;
  label: string;
}

export type AreaHeroMedia =
  | { kind: "carousel"; note: RichText; slides: AreaImage[] }
  | { kind: "banded"; image: AreaImage };

export interface AreaContent {
  slug: AreaSlug;
  accent: AreaSlug;
  /** Nombre del área para metadatos y navegación. */
  name: string;
  /** Título del hero tal como lo escribe Figma (Branding en mayúsculas, Architecture no). */
  title: string;
  /** Descripción para metadatos. */
  description: string;
  services: string[];
  quote: RichText;
  quoteBy: string;
  hero: AreaHeroMedia;
  what: RichText;
  values: { image: AreaImage; items: Array<{ title: string; body: string }> };
  scope: { image: AreaImage; stats: AreaStat[] };
  gallery: [AreaImage, AreaImage, AreaImage];
  method: {
    /** Peso base del cuerpo: Branding en Light, Architecture en Medium. */
    tone: "light" | "medium";
    /** Frase de entrada en Medium, sobre el primer párrafo. */
    lead?: string;
    paragraphs: RichText[];
    /** Pills de Metodología (solo Architecture). */
    pills: string[];
  };
  deliverables: {
    outputs: string;
    /** Dos columnas de tipos de proyecto, como en Figma. */
    types: [string[], string[]];
    results: string;
  };
}

const image = (src: string, alt: string, width: number, height: number): AreaImage => ({
  src,
  alt,
  width,
  height
});

export const areas: Record<AreaSlug, AreaContent> = {
  branding: {
    slug: "branding",
    accent: "branding",
    name: "Branding",
    title: "BRANDING",
    description:
      "En el área de Branding desarrollamos y renovamos marcas a través de una metodología propia, pensada para construir identidades auténticas, coherentes y memorables.",
    services: ["Logo", "Identity", "Illustrations", "Banners", "Print Production"],
    quote: [
      "“Combinamos ",
      { strong: "estrategia, creatividad y análisis" },
      " para diseñar marcas que ",
      { strong: "conectan" },
      " emocionalmente, ",
      { strong: "destacan" },
      " en el mercado y generan un ",
      { strong: "impacto duradero" },
      ".”"
    ],
    quoteBy: "Studio Nomade",
    hero: {
      kind: "carousel",
      note: [
        "Metodología propia que nos permite ",
        { strong: "construir marcas auténticas y memorables." }
      ],
      slides: [
        image(
          "/areas/branding/hero-mockup-kumelen.webp",
          "Mockup de teléfono con la marca Kumelen «endémico»",
          594,
          1110
        ),
        image(
          "/areas/branding/hero-mockup-nexa.webp",
          "Mockup de teléfono con la marca Nexa Energía: «Conectamos con un futuro sostenible»",
          594,
          1110
        ),
        // El export de Figma viene recortado por el frame: se usa el mockup completo de la home.
        image(
          "/home/mockup-humancorp.webp",
          "Mockup de teléfono con la marca Human Core",
          900,
          1600
        )
      ]
    },
    what: [
      "En el área de Branding desarrollamos y renovamos marcas a través de una metodología propia, pensada para construir identidades auténticas, coherentes y memorables."
    ],
    values: {
      image: image(
        "/areas/branding/valores-boden.webp",
        "Papelería de la marca Boden en verde y negro",
        1440,
        1086
      ),
      items: [
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
      ]
    },
    scope: {
      image: image(
        "/areas/branding/alcance-berose.webp",
        "Piezas impresas de la marca Berose",
        1440,
        1086
      ),
      stats: [
        { value: 100, prefix: "+", label: "Marcas desarrolladas" },
        { value: 50, prefix: "+", label: "Marcas creadas desde cero" }
      ]
    },
    gallery: [
      image(
        "/areas/branding/galeria-cinnalove.webp",
        "Bolsa de tela de CinnaLove: «Soy de rollo fácil»",
        1174,
        1416
      ),
      image(
        "/areas/branding/galeria-omg.webp",
        "Sitio y app de OMG Superfood en tablet y teléfono",
        1174,
        1416
      ),
      image(
        "/areas/branding/galeria-idea.webp",
        "Paletas publicitarias de idea, ingeniería y desarrollo de estudios ambientales",
        2456,
        1416
      )
    ],
    method: {
      tone: "light",
      lead: "Entender antes de crear.",
      paragraphs: [
        [
          "Creemos que las marcas sólidas no nacen solo de la inspiración, sino del ",
          { strong: "análisis, la observación y la búsqueda constante." }
        ],
        [
          "Trabajamos desde la cocreación, construyendo cada proyecto junto a nuestros clientes para que cada decisión responda a su esencia y a sus objetivos reales. Desde una mirada estratégica y creativa, transformamos la información en conceptos claros, identidades coherentes y sistemas visuales con propósito."
        ]
      ],
      pills: []
    },
    deliverables: {
      outputs:
        "Entregamos definiciones estratégicas y sistemas visuales ordenados, listos para ser implementados de forma consistente en todos los puntos de contacto de la marca.",
      types: [
        ["Estrategia de marca", "Creación de marca", "Rebranding"],
        [
          "Extensiones / Sub marcas",
          "Consultoría y auditoría de marca",
          "Branding para Experiencias / eventos"
        ]
      ],
      results:
        "Marcas alineadas con su propósito, diferenciadas en su mercado y preparadas para crecer, conectar con sus audiencias y sostenerse en el tiempo."
    }
  },
  architecture: {
    slug: "architecture",
    accent: "architecture",
    name: "Architecture",
    title: "Architecture",
    description:
      "Creamos entornos que inspiran, conectan y reflejan la esencia de cada proyecto. Desde la conceptualización inicial hasta la ejecución final.",
    services: ["Research", "Art Direction", "Render", "Prototipos", "Stand"],
    quote: [
      "“Diseñamos espacios que van más allá de lo funcional para convertirse en ",
      { strong: "experiencias memorables" },
      ".”"
    ],
    quoteBy: "Studio Nomade",
    hero: {
      kind: "banded",
      image: image(
        "/areas/architecture/hero-reebok-eternal-trend.webp",
        "Stand Eternal Trend de Reebok, con público en terraza",
        1998,
        1546
      )
    },
    // Figma corta el párrafo en una coma; se cierra con punto (decisión del cliente).
    what: [
      "Creamos entornos que ",
      { strong: "inspiran, conectan y reflejan la esencia" },
      " de cada proyecto. Desde la conceptualización inicial hasta la ejecución final."
    ],
    values: {
      image: image(
        "/areas/architecture/valores-bata.webp",
        "Stand de Bata Industrials «The Safety Shoe»",
        1440,
        1086
      ),
      items: [
        {
          title: "Experiencia",
          body: "Diseñamos espacios que se viven. Cada proyecto busca generar una experiencia memorable que conecte emocionalmente con las personas y con la marca."
        },
        {
          title: "Estrategia",
          body: "Cada decisión espacial responde a un objetivo claro: comunicar, destacar y posicionar. El diseño no es solo forma, es intención."
        },
        {
          title: "Coherencia",
          body: "Trasladamos la identidad de marca al espacio de manera consistente, cuidando cada detalle para que el lenguaje visual y conceptual se mantenga íntegro."
        },
        {
          title: "Precisión",
          body: "Combinamos creatividad con rigor técnico, asegurando soluciones bien pensadas, viables y ejecutadas con alto estándar."
        }
      ]
    },
    scope: {
      image: image(
        "/areas/architecture/alcance-hankook.webp",
        "Stand de Hankook con un auto de Fórmula 1 y un robot",
        1440,
        1086
      ),
      // Figma dice "+XX"; la cifra aprobada por el cliente es +50.
      stats: [{ value: 50, prefix: "+", label: "Experiencias diseñadas" }]
    },
    gallery: [
      image(
        "/areas/architecture/galeria-jaecoo.webp",
        "Stand de Jaecoo 7: «Más allá de lo convencional»",
        1174,
        1416
      ),
      image(
        "/areas/architecture/galeria-totems-audio.webp",
        "Tótems de audio con tablets en rojo, lila y durazno",
        1174,
        1416
      ),
      image(
        "/areas/architecture/galeria-equifax-activa-el-turbo.webp",
        "Merchandising de Equifax «Activa el turbo en tus decisiones»: jockey, chaquetas, credencial y pista",
        2456,
        1416
      )
    ],
    method: {
      tone: "medium",
      paragraphs: [
        [
          "Nos importa diseñar espacios donde la creatividad y la estrategia se encuentran, dando vida a una idea potente que transforma lo visual en una experiencia viva."
        ]
      ],
      pills: [
        "Investigación estratégica",
        "Concepto Creativo",
        "Diseño 3D y Visualizaciones",
        "Montaje en terreno"
      ]
    },
    deliverables: {
      outputs:
        "Entregamos conceptos espaciales definidos, diseños arquitectónicos coherentes y piezas gráficas integradas, acompañadas de planimetrías, renders y lineamientos técnicos que permiten una implementación clara, consistente y alineada con la identidad de marca en cada etapa del proyecto.",
      types: [
        ["Stands para ferias y exposiciones", "Diseño de experiencias de marca y activaciones"],
        [
          "Espacios corporativos y comerciales",
          "Intervenciones espaciales para eventos",
          "Adaptación de identidad de marca a espacios físicos"
        ]
      ],
      results:
        "Creamos espacios y experiencias que comunican la esencia de la marca, destacan en contextos de alta exposición y generan una conexión real con las personas, logrando proyectos memorables que combinan impacto visual, funcionalidad y propósito."
    }
  }
};

/**
 * Perfil de Behance para el botón "Ver más en Behance" del CTA.
 * TODO-contenido: Figma no trae la URL. Mientras esté vacía, el botón no se muestra.
 */
export const BEHANCE_URL = "";

export function isAreaSlug(value: string): value is AreaSlug {
  return value === "branding" || value === "architecture";
}

/** Texto plano de un `RichText`, para metadatos y nombres accesibles. */
export function plainText(rich: RichText): string {
  return rich.map((part) => (typeof part === "string" ? part : part.strong)).join("");
}
