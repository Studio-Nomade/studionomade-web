import type { StudioAreaSlug } from "./area-meta";

/**
 * Contenido de las páginas de servicio por área (Figma "SERVICIOS": Branding
 * `8:327` y Architecture `2:2`). Los textos son literales del diseño, con las
 * correcciones aprobadas: el párrafo de Architecture cierra con punto y el
 * bloque de entregables se titula "¿Qué entregamos?".
 *
 * Audiovisual & Animation y Web Design no tienen página en Figma: reutilizan la
 * misma estructura con textos redactados en el tono de las otras dos áreas
 * (TODO-contenido: validar con dirección).
 *
 * El equipo de cada área vive en `team.ts`.
 */
export type AreaSlug = StudioAreaSlug;

/** Texto con tramos destacados. El peso del destacado lo decide cada sección. */
export type RichText = Array<string | { strong: string }>;

export interface AreaImage {
  src: string;
  alt: string;
  /** Ancho y alto intrínsecos del archivo (export 2× de Figma). */
  width: number;
  height: number;
  /**
   * `contain` muestra la pieza completa (mockups de teléfono con fondo propio);
   * por defecto la imagen cubre el marco.
   */
  fit?: "cover" | "contain";
  /** Punto de anclaje del recorte (`object-position`), p. ej. "0% 50%". */
  focus?: string;
}

/** Imagen de la galería: `wide` ocupa toda la fila. */
export interface AreaGalleryImage extends AreaImage {
  wide?: boolean;
}

export interface AreaStat {
  /** Cifra que anima `Counter`. */
  value: number;
  /** Signo previo ("+"): es lo único que toma el color del acento. */
  prefix?: string;
  label: string;
}

export type AreaHeroMedia =
  | {
      kind: "carousel";
      /** Nombre accesible del carrusel (por defecto, "Mockups de marcas"). */
      label?: string;
      note: RichText;
      slides: AreaImage[];
    }
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
  /**
   * Alcance: cifras animadas o, si el área aún no tiene cifras validadas, una
   * lista de frentes de trabajo (`points`) sin números.
   */
  scope: { image: AreaImage; stats: AreaStat[]; points?: string[] };
  /** Imágenes de a pares; las `wide` ocupan toda la fila. */
  gallery: AreaGalleryImage[];
  method: {
    /** Peso base del cuerpo: Branding en Light, Architecture en Medium. */
    tone: "light" | "medium";
    /** Frase de entrada en Medium, sobre el primer párrafo. */
    lead?: string;
    paragraphs: RichText[];
    /** Pills de Metodología (todas las áreas salvo Branding). */
    pills: string[];
  };
  deliverables: {
    outputs: string;
    /** Dos columnas de tipos de proyecto, como en Figma. */
    types: [string[], string[]];
    results: string;
  };
}

const image = (
  src: string,
  alt: string,
  width: number,
  height: number,
  options: Pick<AreaGalleryImage, "fit" | "focus" | "wide"> = {}
): AreaGalleryImage => ({ src, alt, width, height, ...options });

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
        1416,
        { wide: true }
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
        1416,
        { wide: true }
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
  },
  // TODO-contenido: área sin página en Figma. Textos redactados en el tono de
  // Branding/Architecture a partir de los servicios del formulario del estudio;
  // validar con dirección antes de publicar.
  audiovisual: {
    slug: "audiovisual",
    accent: "audiovisual",
    name: "Audiovisual & Animation",
    title: "Audiovisual",
    description:
      "En el área Audiovisual & Animation producimos piezas audiovisuales y animaciones que cuentan la historia de cada marca con ritmo, intención y coherencia.",
    services: [
      "Producción Audiovisual",
      "Animación",
      "Reels y contenido para redes",
      "Cápsulas corporativas",
      "Cobertura de eventos"
    ],
    quote: [
      "“Contamos historias en movimiento que ",
      { strong: "conectan" },
      " con las personas y hacen que cada marca se ",
      { strong: "vea y se sienta" },
      " como es.”"
    ],
    quoteBy: "Studio Nomade",
    hero: {
      kind: "banded",
      image: image(
        "/areas/audiovisual/rodaje-festival.webp",
        "Integrante de Studio Nomade grabando con un estabilizador frente al muro de un festival",
        1600,
        900
      )
    },
    what: [
      "Desarrollamos ",
      { strong: "contenido en movimiento" },
      " para marcas: desde la idea y el guion hasta el rodaje, la animación y la postproducción."
    ],
    values: {
      image: image(
        "/areas/audiovisual/gimbal-movil.webp",
        "Teléfono montado en un estabilizador grabando una activación al aire libre",
        1600,
        900
      ),
      items: [
        {
          title: "Narrativa",
          body: "Cada pieza parte de una idea clara: qué queremos contar, a quién y para qué."
        },
        {
          title: "Ritmo",
          body: "Cuidamos el montaje, el sonido y los tiempos para que cada segundo sume a la historia."
        },
        {
          title: "Coherencia",
          body: "Trasladamos la identidad de la marca al movimiento: color, tipografía, tono y estilo visual."
        },
        {
          title: "Versatilidad",
          body: "Adaptamos cada contenido a su formato y canal, desde una cápsula corporativa hasta un reel."
        }
      ]
    },
    scope: {
      image: image(
        "/areas/audiovisual/produccion-en-terreno.webp",
        "Productora de Studio Nomade coordinando por radio durante un rodaje en terreno",
        1600,
        900
      ),
      // TODO-contenido: sin cifras validadas para el área; se listan frentes de
      // trabajo. Reemplazar por `stats` cuando dirección confirme números.
      stats: [],
      points: [
        "Rodajes en terreno y en estudio",
        "Cobertura de ferias, festivales y activaciones",
        "Animación y motion graphics",
        "Contenido vertical para redes"
      ]
    },
    gallery: [
      image(
        "/areas/audiovisual/natura-retrato.webp",
        "Retrato de una asistente sonriendo durante una activación de Natura",
        1600,
        900
      ),
      image(
        "/areas/audiovisual/natura-detalle.webp",
        "Detalle de manos durante una activación de Natura",
        1600,
        900
      ),
      image(
        "/areas/audiovisual/natura-activacion.webp",
        "Stand de Natura «Hace bien estar bien» con un visitante sonriendo",
        1600,
        900,
        { wide: true }
      ),
      image(
        "/areas/audiovisual/equipo-creative-movement.webp",
        "Polera del equipo con la marca «Studio Nomade Creative Movement»",
        1600,
        900
      ),
      image(
        "/areas/audiovisual/expo-condominios-networking.webp",
        "Asistentes conversando en el networking de una expo de condominios",
        1600,
        900
      ),
      image(
        "/areas/audiovisual/expo-condominios-stand.webp",
        "Visitantes recorriendo un stand en una expo de condominios",
        1600,
        900,
        { wide: true }
      )
    ],
    method: {
      tone: "light",
      lead: "Del guion a la pantalla.",
      paragraphs: [
        [
          "Cada proyecto parte de una ",
          { strong: "idea y un guion claros." },
          " Planificamos el rodaje, filmamos en terreno o en estudio y cerramos con montaje, color, sonido y animación."
        ],
        [
          "Trabajamos junto a nuestros clientes en cada etapa, para que cada pieza responda a sus objetivos y funcione en el canal donde se va a ver."
        ]
      ],
      pills: ["Idea y guion", "Preproducción", "Rodaje y animación", "Postproducción"]
    },
    deliverables: {
      outputs:
        "Entregamos piezas finales en los formatos y proporciones que cada canal necesita (horizontal, vertical y cuadrado), con versiones cortas y subtítulos listos para publicar.",
      types: [
        ["Producción audiovisual", "Animación y motion graphics", "Reels y contenido para redes"],
        ["Cápsulas corporativas", "Cobertura de eventos"]
      ],
      results:
        "Contenido que cuenta la historia de la marca con coherencia, se adapta a cada plataforma y genera una conexión real con sus audiencias."
    }
  },
  // TODO-contenido: área sin página en Figma. Textos redactados en el tono de
  // Branding/Architecture a partir de los servicios del formulario del estudio;
  // validar con dirección antes de publicar.
  "web-design": {
    slug: "web-design",
    accent: "web-design",
    name: "Web Design",
    title: "Web Design",
    description:
      "En el área de Web Design diseñamos y desarrollamos sitios y plataformas digitales que traducen la identidad de cada marca en experiencias claras, rápidas y fáciles de usar.",
    services: ["Diseño UI/UX", "Sitios web", "Landing pages", "E-commerce", "Plataformas a medida"],
    quote: [
      "“Diseñamos experiencias digitales donde ",
      { strong: "la marca y la usabilidad" },
      " trabajan juntas para ",
      { strong: "convertir visitas en relaciones" },
      ".”"
    ],
    quoteBy: "Studio Nomade",
    hero: {
      kind: "carousel",
      label: "Sitios en teléfono",
      note: [
        "Interfaces pensadas desde el contenido y las personas, ",
        { strong: "listas para crecer." }
      ],
      slides: [
        image(
          "/proyectos/kumelen/mobile-01.webp",
          "Sitio de Kumelen Endémico en un teléfono: portada",
          1080,
          1920
        ),
        image(
          "/proyectos/kumelen/mobile-02.webp",
          "Sitio de Kumelen Endémico en un teléfono: «Ve lo esencial, cuida lo que importa»",
          1080,
          1920
        ),
        image(
          "/proyectos/kumelen/mobile-03.webp",
          "Sitio de Kumelen Endémico en un teléfono: destinos",
          1080,
          1920
        )
      ]
    },
    what: [
      "Creamos ",
      { strong: "sitios y plataformas" },
      " que comunican con claridad, cargan rápido y se adaptan a cada pantalla, desde el diseño de la interfaz hasta su puesta en marcha."
    ],
    values: {
      image: image(
        "/proyectos/kumelen/galeria-01.webp",
        "Teléfono con el sitio de Kumelen junto a publicaciones de la marca sobre un bosque",
        1620,
        1080
      ),
      items: [
        {
          title: "Usabilidad",
          body: "Diseñamos recorridos simples, donde cada persona encuentra lo que busca sin esfuerzo."
        },
        {
          title: "Identidad",
          body: "Llevamos la marca a la pantalla con un sistema visual coherente en cada página y componente."
        },
        {
          title: "Rendimiento",
          body: "Cuidamos la velocidad, la accesibilidad y el posicionamiento desde las primeras decisiones de diseño."
        },
        {
          title: "Escalabilidad",
          body: "Construimos sitios ordenados y administrables, pensados para crecer junto a cada negocio."
        }
      ]
    },
    scope: {
      image: image(
        "/proyectos/kumelen/galeria-02.webp",
        "Pieza de Kumelen con el mensaje «explora consciente!» sobre un paisaje de montaña",
        1920,
        1080,
        // Recorte 4:3 que conserva el mensaje (izquierda) y al caminante (derecha).
        { focus: "8% 50%" }
      ),
      // TODO-contenido: sin cifras validadas para el área; se listan frentes de
      // trabajo. Reemplazar por `stats` cuando dirección confirme números.
      stats: [],
      points: [
        "Sitios corporativos e institucionales",
        "Landing pages para campañas",
        "Tiendas online",
        "Plataformas y herramientas a medida"
      ]
    },
    // Mockups con fondo propio: se muestran completos (`contain`), de a pares.
    gallery: [
      image(
        "/home/mockup-nexa.webp",
        "Mockup de teléfono con la marca Nexa Energía: «Conectamos con un futuro sostenible»",
        900,
        1600,
        { fit: "contain" }
      ),
      image(
        "/home/mockup-humancorp.webp",
        "Mockup de teléfono con la marca Human Core",
        900,
        1600,
        { fit: "contain" }
      )
    ],
    method: {
      tone: "light",
      lead: "Diseñar para las personas.",
      paragraphs: [
        [
          "Partimos por entender a quién le hablamos y qué necesita resolver. Desde ahí ",
          { strong: "ordenamos el contenido, prototipamos y probamos" },
          " antes de construir."
        ],
        [
          "Trabajamos por etapas junto a nuestros clientes, validando cada avance para que el sitio final responda a objetivos reales y sea fácil de mantener."
        ]
      ],
      pills: [
        "Arquitectura de información",
        "Prototipo UI/UX",
        "Desarrollo",
        "Lanzamiento y soporte"
      ]
    },
    deliverables: {
      outputs:
        "Entregamos sitios publicados y administrables, junto con el sistema de diseño, los prototipos y la documentación necesaria para mantenerlos y hacerlos crecer.",
      types: [
        ["Diseño UI/UX", "Sitios web", "Landing pages"],
        ["E-commerce", "Plataformas a medida"]
      ],
      results:
        "Sitios claros, rápidos y coherentes con la marca, preparados para atraer, informar y convertir a sus visitantes."
    }
  }
};

/**
 * Perfil de Behance para el botón "Ver más en Behance" del CTA.
 * TODO-contenido: Figma no trae la URL. Mientras esté vacía, el botón no se muestra.
 */
export const BEHANCE_URL = "";

export function isAreaSlug(value: string): value is AreaSlug {
  return Object.hasOwn(areas, value);
}

/** Texto plano de un `RichText`, para metadatos y nombres accesibles. */
export function plainText(rich: RichText): string {
  return rich.map((part) => (typeof part === "string" ? part : part.strong)).join("");
}
