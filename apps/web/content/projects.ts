/**
 * Casos de estudio del sitio público.
 *
 * Fuente de verdad: Figma "WEB NOMADE 2026" (layout, textos y orden de bloques)
 * y el sitio legado (imágenes y "Siguiente proyecto"). Cada caso es una lista de
 * bloques que renderiza `components/projects/case-blocks.tsx`; los bloques son
 * reutilizables entre casos.
 */

/** Texto con tramos de distinto peso, tal como los dibuja Figma. */
export type RichText = string | Array<{ text: string; weight?: 400 | 600 | 700 }>;

export type CaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Fondo de un bloque: blanco, gris banda (#EEE), negro o gris tinta (#525252). */
export type CaseTone = "light" | "mist" | "dark" | "ink";

export type CaseBlock =
  | {
      type: "hero";
      /** `inset`: imagen centrada sobre banda gris · `inset-wide`: idem más ancha · `full`: a sangre. */
      variant: "inset" | "inset-wide" | "full";
      /** `long`: titular en mayúsculas de 64px para nombres largos. */
      titleSize?: "xl" | "long";
      image: CaseImage;
      tags?: string[];
      quote?: RichText;
      /** Ancho de la cita: `wide` 1053px (Kumelen) · `narrow` 811px (Equifax). */
      quoteWidth?: "wide" | "narrow";
      /** Claim bajo la imagen `full`, precedido de la regla corta. */
      claim?: RichText;
      /** Muestra el botón "Ver en Behance" si el caso tiene `behanceUrl`. */
      behance?: boolean;
    }
  | {
      type: "statement";
      tone: "light" | "dark";
      size: "md" | "lg";
      text: RichText;
      attribution?: string;
      behance?: boolean;
    }
  | { type: "objectives"; title: string; items: string[] }
  | {
      type: "challenge";
      tone: "dark" | "mist";
      challenge: RichText;
      solution: RichText;
      result: RichText;
    }
  | {
      type: "media";
      /** `full`: a sangre · `full-ruled`: a sangre con filete blanco · `framed`: con márgenes · `bleed-right`. */
      variant: "full" | "full-ruled" | "framed" | "bleed-right";
      tone: CaseTone;
      image: CaseImage;
    }
  | { type: "grid"; tone: CaseTone; items: Array<{ image: CaseImage; caption?: string }> }
  | { type: "bento"; items: [CaseImage, CaseImage, CaseImage] }
  | { type: "narrative"; title: string; lead: string; body: string[] }
  | { type: "strip"; title: string; items: CaseImage[] }
  | { type: "phones"; text: RichText; items: CaseImage[] }
  | { type: "slider"; label: string; slides: Array<{ image: CaseImage; label: string }> }
  | {
      type: "zones";
      /** `bleed-left`: imagen pegada a la izquierda sobre negro · `map`: plano centrado sobre gris tinta. */
      variant: "bleed-left" | "map";
      image: CaseImage;
      intro?: RichText;
      items: string[];
    }
  | { type: "credits"; items: Array<{ role: string; name: string }> };

export type ProjectArea = "branding" | "architecture";

export type PublicProject = {
  slug: string;
  title: string;
  client: string;
  year: string;
  area: ProjectArea;
  /** Código de área de la página de Figma: B&D Branding & Design · A&D Architecture & Design. */
  areaCode: "B&D" | "A&D";
  /** Nombre del acento en `accents.css` (`data-accent`). Sin él, el del área. */
  accent?: string;
  /** Plantilla del sitio legado, solo para trazabilidad. */
  template?: "anagrama" | "arte" | "fashion" | "mnimalex" | "cassio";
  /** Descripción para metadatos y para la tarjeta del listado. */
  summary: string;
  /** Imagen de portada: tarjeta del listado, Open Graph y "Siguiente proyecto". */
  cover: CaseImage;
  /** TODO-contenido: URLs de Behance sin confirmar. Sin URL el botón no se muestra. */
  behanceUrl?: string;
  blocks: CaseBlock[];
};

export const AREA_LABELS: Record<PublicProject["areaCode"], string> = {
  "B&D": "Branding & Design",
  "A&D": "Architecture & Design"
};

const image = (
  slug: string,
  name: string,
  width: number,
  height: number,
  alt: string
): CaseImage => ({ src: `/proyectos/${slug}/${name}.webp`, alt, width, height });

const DEFAULT_CREDITS = (client: string) => [
  { role: "Cliente", name: client },
  { role: "Director Creativo", name: "Anna Sanhueza" },
  { role: "Diseñadores", name: "Studio Nomade" }
];

const cinnalove: PublicProject = {
  slug: "cinnalove",
  title: "CinnaLove",
  client: "CinnaLove",
  year: "2025",
  area: "branding",
  areaCode: "B&D",
  accent: "cinnalove",
  template: "anagrama",
  summary:
    "Identidad, packaging y sistema visual para CinnaLove, construidos desde el trazo vivo del rollo de canela.",
  cover: image(
    "cinnalove",
    "portada",
    1280,
    1920,
    "Caja de CinnaLove con el trazo de canela sobre fondo tostado"
  ),
  blocks: [
    {
      type: "hero",
      variant: "inset-wide",
      image: image(
        "cinnalove",
        "hero",
        2444,
        2458,
        "Dos bolsas de CinnaLove con rollos de canela, una con el trazo terracota y otra con el trazo oliva"
      ),
      tags: ["Research", "Branding", "Packaging"]
    },
    {
      type: "statement",
      tone: "light",
      size: "md",
      text: "Abordamos este proyecto con una sensibilidad especial, enfocándonos en capturar la esencia del rollo de canela como punto de partida conceptual. Tomamos su forma y movimiento, entendiéndolo como un trazo vivo que se desplaza, se dobla y se transforma, permitiendo un juego gráfico visible y expresivo. Este trazo móvil se convirtió en el elemento principal y en el sustento de todo el sistema visual, trasladándose de manera coherente a la tipografía, el packaging y las distintas aplicaciones de la marca.",
      behance: true
    },
    {
      type: "media",
      variant: "framed",
      tone: "light",
      image: image(
        "cinnalove",
        "keyvisual-a",
        1262,
        708,
        "Key visual de CinnaLove: rollo de canela con crema y el claim «Buenos días, buenos rollos»"
      )
    },
    {
      type: "media",
      variant: "framed",
      tone: "light",
      image: image(
        "cinnalove",
        "board-marca",
        2524,
        1416,
        "Lámina de marca de CinnaLove: logotipo, tipografía Helony y paleta de cinco colores"
      )
    },
    {
      type: "media",
      variant: "framed",
      tone: "light",
      image: image(
        "cinnalove",
        "posts-sociales",
        2524,
        1416,
        "Tres publicaciones de CinnaLove para redes sociales sobre fondo tostado"
      )
    },
    {
      type: "strip",
      title: "Package Design",
      items: [
        image("cinnalove", "vaso", 818, 900, "Vaso de café CinnaLove con tapa oliva"),
        image("cinnalove", "caja", 908, 900, "Caja de CinnaLove con el trazo terracota"),
        image("cinnalove", "stand", 908, 900, "Pizarra de pie de CinnaLove en terracota")
      ]
    },
    { type: "credits", items: DEFAULT_CREDITS("CinnaLove") }
  ]
};

const nexa: PublicProject = {
  slug: "nexa",
  title: "NEXA",
  client: "Nexa",
  year: "2024",
  area: "branding",
  areaCode: "B&D",
  accent: "nexa",
  template: "arte",
  summary:
    "Identidad visual cálida y contemporánea para NEXA, energía renovable que conecta comunidades y entorno.",
  cover: image("nexa", "hero", 1920, 1200, "Tarjetas de presentación de NEXA"),
  blocks: [
    {
      type: "hero",
      variant: "full",
      image: image("nexa", "hero", 1920, 1200, "Tarjetas de presentación de NEXA"),
      claim: [{ text: "Energía que" }, { text: " conecta y transforma.", weight: 600 }],
      behance: true
    },
    {
      type: "slider",
      label: "Mockups de NEXA",
      // TODO-contenido: falta la imagen de "Mockup 02" (no existe en Figma). Con
      // una sola diapositiva el slider no muestra controles.
      slides: [
        {
          label: "Mockup 01",
          image: image(
            "nexa",
            "mockup-01",
            1680,
            1005,
            "Teléfono y publicaciones de NEXA sobre un cielo despejado"
          )
        }
      ]
    },
    {
      type: "media",
      variant: "full-ruled",
      tone: "light",
      image: image("nexa", "keyvisual", 1920, 1194, "Key visual de NEXA")
    },
    {
      type: "narrative",
      title: "Diseñamos identidades que conectan con propósito.",
      lead: "NEXA impulsa soluciones de energía renovable que protegen el entorno, fortalecen comunidades y crean valor compartido para un futuro más sostenible.",
      body: [
        "NEXA nace para impulsar energía renovable desde una mirada responsable y colaborativa. Su propósito es generar soluciones limpias que protejan el entorno y fortalezcan la relación entre comunidades, empresas y propietarios de tierras.",
        "Con una identidad visual cálida y contemporánea, la marca refleja innovación, cercanía y un compromiso real con un futuro más sostenible y conectado."
      ]
    },
    {
      type: "grid",
      tone: "light",
      items: [
        {
          image: image(
            "nexa",
            "grid-01",
            881,
            1062,
            "Lámina del proyecto de identidad visual de NEXA"
          )
        },
        { image: image("nexa", "grid-02", 881, 1062, "Paleta de color de NEXA") },
        { image: image("nexa", "grid-03", 881, 1062, "Tipografías de NEXA") },
        {
          image: image(
            "nexa",
            "grid-04",
            881,
            1062,
            "Retícula de construcción del logotipo de NEXA"
          )
        }
      ]
    },
    { type: "credits", items: DEFAULT_CREDITS("Nexa") }
  ]
};

const kumelen: PublicProject = {
  slug: "kumelen",
  title: "Kumelen",
  client: "Kumelen Endémico",
  year: "2025",
  area: "branding",
  areaCode: "B&D",
  accent: "kumelen",
  template: "fashion",
  summary:
    "Marca, narrativa y diseño web para Kumelen Endémico, turismo consciente que conecta con la naturaleza y la cultura chilena.",
  cover: image("kumelen", "hero", 1920, 1280, "Afiches de Kumelen Endémico en un muro urbano"),
  blocks: [
    {
      type: "hero",
      variant: "inset",
      image: image("kumelen", "hero", 1920, 1280, "Afiches de Kumelen Endémico en un muro urbano"),
      tags: ["Research", "Branding", "Diseño Web"],
      quote:
        "“Transformamos cada viaje en una experiencia educativa y emocional, conectando a los viajeros con lo mejor de la naturaleza y la cultura chilena. Más que destinos, creamos recuerdos que inspiran cuidado, aprendizaje y reflexión”",
      behance: true
    },
    {
      type: "objectives",
      title: "Objetivos del Proyecto",
      items: [
        "Crear una marca que refleje los valores de Kumelen Endémico: respeto por la naturaleza, conexión cultural y turismo responsable.",
        "Diseñar una estética y narrativa que inspiren a los viajeros a aprender, valorar y proteger los entornos naturales y culturales que visitan.",
        "Construir una identidad visual que ponga en valor el territorio y promueva experiencias que generen un impacto positivo mutuo.",
        "Desarrollar una marca coherente, moderna y diferenciada que comunique su compromiso con un turismo consciente y transformador."
      ]
    },
    {
      type: "phones",
      text: [
        { text: "Branding que impulsa " },
        { text: "conexiones auténticas y conscientes.", weight: 600 }
      ],
      items: [
        image(
          "kumelen",
          "mobile-01",
          1080,
          1920,
          "Sitio de Kumelen Endémico en un teléfono: portada"
        ),
        image(
          "kumelen",
          "mobile-02",
          1080,
          1920,
          "Sitio de Kumelen Endémico en un teléfono: experiencias"
        ),
        image(
          "kumelen",
          "mobile-03",
          1080,
          1920,
          "Sitio de Kumelen Endémico en un teléfono: destinos"
        )
      ]
    },
    {
      type: "narrative",
      title: "Viajar con propósito, conectar con lo esencial.",
      lead: "Kumelen Endémico impulsa experiencias de turismo consciente que celebran la naturaleza, la cultura y el aprendizaje significativo en cada recorrido.",
      body: [
        "Kumelen Endémico nace desde la convicción de que el turismo puede transformar, educar y proteger los entornos naturales y culturales de Chile. La marca promueve un viajar responsable, donde cada experiencia inspira a conectar, aprender y cuidar lo que se descubre.",
        "Con una identidad cercana y auténtica, Kumelen busca generar impacto positivo tanto en los viajeros como en las comunidades locales, fomentando un turismo más consciente, respetuoso y enriquecedor para todos."
      ]
    },
    {
      type: "bento",
      items: [
        image("kumelen", "keyvisual", 695, 726, "Libros editoriales de Kumelen Endémico"),
        image(
          "kumelen",
          "galeria-01",
          1620,
          1080,
          "Teléfono con publicaciones de Kumelen sobre un bosque"
        ),
        image(
          "kumelen",
          "galeria-02",
          1920,
          1080,
          "Pieza de Kumelen con el mensaje «explora consciente!»"
        )
      ]
    },
    { type: "credits", items: DEFAULT_CREDITS("Kumelen Endémico") }
  ]
};

const reebok: PublicProject = {
  slug: "reebok-x-lollapalooza",
  title: "Reebok x Lollapalooza",
  client: "Reebok",
  year: "2025",
  area: "architecture",
  areaCode: "A&D",
  accent: "reebok",
  template: "mnimalex",
  summary:
    "Eternal Trend: un stand experiencial y circular para Reebok en Lollapalooza Chile, entre legado, juego y sostenibilidad.",
  cover: image(
    "reebok-x-lollapalooza",
    "hero",
    1920,
    1080,
    "Stand de Reebok en Lollapalooza al atardecer"
  ),
  blocks: [
    {
      type: "hero",
      variant: "inset",
      titleSize: "long",
      image: image(
        "reebok-x-lollapalooza",
        "hero",
        1920,
        1080,
        "Stand de Reebok en Lollapalooza al atardecer"
      )
    },
    {
      type: "objectives",
      title: "Objetivos del Proyecto",
      items: [
        "Reforzar el posicionamiento de Reebok como una marca clásica, vigente y culturalmente relevante.",
        "Generar interacción real y contenido compartible a través de experiencias lúdicas y memorables.",
        "Conectar el legado histórico de la marca con nuevas generaciones dentro de un contexto festival.",
        "Integrar sostenibilidad y comunidad como parte activa de la experiencia de marca."
      ]
    },
    {
      type: "media",
      variant: "full",
      tone: "dark",
      image: image(
        "reebok-x-lollapalooza",
        "presentacion",
        1440,
        790,
        "Presentación del concepto Eternal Trend en Lollapalooza Chile"
      )
    },
    {
      type: "challenge",
      tone: "dark",
      challenge:
        "Crear un stand experiencial en Lollapalooza que conectara el legado de Reebok con una audiencia joven, auténtica y culturalmente activa.",
      solution: [
        {
          text: "Desarrollamos el concepto “Eternal Trend”, un espacio circular e inmersivo con activaciones lúdicas, virales y de impacto social que reinterpretan los clásicos de Reebok.",
          weight: 600
        }
      ],
      result:
        "Un stand altamente participativo y memorable que posiciona a Reebok como una marca atemporal, cercana y culturalmente relevante dentro del festival."
    },
    {
      type: "media",
      variant: "bleed-right",
      tone: "dark",
      image: image(
        "reebok-x-lollapalooza",
        "render-desafio",
        1920,
        1080,
        "Render del interior del stand de Reebok de noche"
      )
    },
    {
      type: "grid",
      tone: "dark",
      items: [
        {
          image: image("reebok-x-lollapalooza", "grid-01", 881, 1062, "Activación Giant Jenga"),
          caption: "Giant Jenga"
        },
        {
          image: image(
            "reebok-x-lollapalooza",
            "grid-02",
            881,
            1062,
            "Activación Recycling Basquet"
          ),
          caption: "Recycling Basquet"
        },
        {
          image: image(
            "reebok-x-lollapalooza",
            "grid-03",
            881,
            1062,
            "Activación Circular Ping Pong"
          ),
          caption: "Circular Ping Pong"
        },
        {
          image: image("reebok-x-lollapalooza", "grid-04", 881, 1062, "Activación Puff Zone"),
          caption: "Puff Zone"
        }
      ]
    },
    {
      type: "zones",
      variant: "bleed-left",
      image: image(
        "reebok-x-lollapalooza",
        "render-zonas",
        1920,
        1098,
        "Planta numerada del stand con sus nueve zonas"
      ),
      items: [
        "Monumento Huellas que Trascienden",
        "Eternal Match",
        "Recharge Zone",
        "Puff Zone",
        "Circular Ping Pong",
        "Giant Jenga",
        "Counter Merch",
        "Recycling Basquet",
        "Bodega"
      ]
    },
    {
      type: "statement",
      tone: "dark",
      size: "lg",
      text: "Una Brand Experience icónica, donde lo clásico se vive como algo vigente, interactivo y compartible, integrando marca, comunidad y sostenibilidad.",
      attribution: "Studio Nomade",
      behance: true
    },
    { type: "credits", items: DEFAULT_CREDITS("Reebok") }
  ]
};

const equifax: PublicProject = {
  slug: "equifax",
  title: "Equifax",
  client: "EQUIFAX",
  year: "2024",
  area: "architecture",
  areaCode: "A&D",
  accent: "equifax",
  template: "cassio",
  summary:
    "FAST TRACK: una Brand Experience inmersiva para Equifax, inspirada en la velocidad, la precisión y la toma de decisiones.",
  cover: image("equifax", "hero", 1920, 1080, "Evento FAST TRACK de Equifax"),
  blocks: [
    {
      type: "hero",
      variant: "inset",
      image: image("equifax", "hero", 1920, 1080, "Evento FAST TRACK de Equifax"),
      tags: ["Experiencia", "Branding", "Render"],
      quote:
        "Una Brand Experience inmersiva, con una narrativa clara y potente, inspirada en la velocidad, precisión y toma de decisiones estratégicas.",
      quoteWidth: "narrow",
      behance: true
    },
    {
      type: "media",
      variant: "full",
      tone: "dark",
      image: image(
        "equifax",
        "vista-general",
        1920,
        1053,
        "Vista general nocturna del evento con el Mini rojo"
      )
    },
    {
      type: "challenge",
      tone: "mist",
      challenge:
        "Diseñar una experiencia de marca que reforzara la confianza, innovación y liderazgo tecnológico de Equifax, tras un contexto desafiante, mediante un evento de alto impacto.",
      solution: [
        { text: "Creamos el concepto “FAST TRACK: ", weight: 600 },
        {
          text: "Acelera tus decisiones”, integrando diseño espacial, tecnología, contenido y experiencia sensorial en un recorrido coherente y memorable."
        }
      ],
      result:
        "Un evento de alto estándar que reposicionó a Equifax como un socio confiable, innovador y preparado para liderar en la era digital, fortaleciendo el vínculo con sus clientes."
    },
    {
      type: "grid",
      tone: "mist",
      items: [
        { image: image("equifax", "grid-01", 705, 850, "Zona DJ Mini"), caption: "DJ Mini" },
        {
          image: image("equifax", "grid-02", 705, 850, "Experiencia de simuladores"),
          caption: "Experiencia simuladores"
        },
        {
          image: image("equifax", "grid-03", 705, 850, "Acceso por el Infinite Tunnel"),
          caption: "Acceso Infinite Tunnel"
        },
        {
          image: image("equifax", "grid-04", 705, 850, "Zona Temática del evento"),
          caption: "Zona Temática"
        }
      ]
    },
    {
      type: "zones",
      variant: "map",
      image: image(
        "equifax",
        "mapa",
        1920,
        1208,
        "Plano del recorrido del evento con sus diez zonas"
      ),
      intro: [
        { text: "Construimos experiencias como un recorrido: " },
        { text: "coherente, inmersivo y alineado a la visión de marca.", weight: 700 }
      ],
      items: [
        "Zona Estacionamientos",
        "Zona Acreditación",
        "Acceso Infinite Tunnel",
        "Zona Simuladores",
        "DJ Mini",
        "Zona Temática",
        "Photo Opportunity",
        "Acceso Hangar",
        "Zona espera Test Drive",
        "Pista Test Drive"
      ]
    },
    {
      type: "media",
      variant: "full",
      tone: "dark",
      // Figma repite la imagen del bloque 2; se usa el render del legado que no
      // aparecía en ninguna parte (pendiente de confirmar con diseño).
      image: image("equifax", "render-02", 1920, 1080, "Render del evento FAST TRACK de Equifax")
    },
    { type: "credits", items: DEFAULT_CREDITS("EQUIFAX") }
  ]
};

/** Caso previo al rediseño: se mantiene con los bloques genéricos. */
const jaecoo: PublicProject = {
  slug: "jaecoo-7",
  title: "Jaecoo 7",
  client: "Jaecoo",
  year: "2025",
  area: "architecture",
  areaCode: "A&D",
  summary:
    "Una experiencia espacial inmersiva para presentar un nuevo modelo en un contexto de alta exposición.",
  cover: {
    src: "/home/arch-gallery-1.webp",
    alt: "Lanzamiento del Jaecoo 7",
    width: 1400,
    height: 788
  },
  blocks: [
    {
      type: "hero",
      variant: "inset",
      image: {
        src: "/home/arch-gallery-1.webp",
        alt: "Lanzamiento del Jaecoo 7",
        width: 1400,
        height: 788
      },
      quote:
        "Una experiencia espacial inmersiva para presentar un nuevo modelo en un contexto de alta exposición."
    },
    {
      type: "challenge",
      tone: "mist",
      challenge:
        "Transformar atributos técnicos y de marca en una experiencia clara, atractiva y recorrible.",
      solution:
        "Diseño espacial, iluminación y soportes audiovisuales integrados en un único lenguaje.",
      result:
        "Un lanzamiento consistente con la marca y capaz de conectar el producto con sus audiencias."
    },
    {
      type: "bento",
      items: [
        { src: "/home/arch-1.webp", alt: "Espacio del lanzamiento", width: 1081, height: 1351 },
        { src: "/home/arch-gallery-2.webp", alt: "Detalle del montaje", width: 1081, height: 1351 },
        {
          src: "/home/arch-gallery-3.webp",
          alt: "Detalle de iluminación",
          width: 1081,
          height: 1351
        }
      ]
    },
    {
      type: "credits",
      items: [
        { role: "Cliente", name: "Jaecoo" },
        { role: "Diseñadores", name: "Studio Nomade" }
      ]
    }
  ]
};

export const publicProjects: PublicProject[] = [cinnalove, kumelen, equifax, reebok, nexa, jaecoo];

/** Ciclo de "Siguiente proyecto" del sitio legado. */
export const CASE_CYCLE = ["cinnalove", "kumelen", "equifax", "reebok-x-lollapalooza", "nexa"];

export function getPublicProject(slug: string) {
  return publicProjects.find((project) => project.slug === slug);
}

/** Siguiente caso del ciclo; los casos fuera del ciclo continúan en el primero. */
export function getNextProject(slug: string): PublicProject {
  const position = CASE_CYCLE.indexOf(slug);
  const nextSlug = CASE_CYCLE[(position + 1) % CASE_CYCLE.length];
  return getPublicProject(nextSlug) ?? publicProjects[0];
}
