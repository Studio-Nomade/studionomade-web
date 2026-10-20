import { campaignContentSchema } from "@studionomade/content-schema";

export const inmobiliariasContent = campaignContentSchema.parse({
  hero: {
    eyebrow: "Branding y comunicación para proyectos inmobiliarios",
    highlight: "INMO",
    title: "BILIARIAS"
  },
  claims: [
    { text: "INDUSTRIA", mark: "circle" },
    { text: "DESTAQUE", mark: "fill" },
    { text: "PUEDE PERDERSE", mark: "fill" },
    { text: "COMO TODOS.", mark: "circle" },
    { text: "Un proyecto.", mark: "none" },
    { text: "Una dirección.", mark: "none" },
    { text: "Una marca difícil de confundir.", mark: "none" }
  ],
  steps: [
    "Definimos su diferencia.",
    "Construimos su identidad.",
    "Conectamos su comunicación.",
    "Acompañamos la venta."
  ],
  footline: ["Estrategia", "Identidad", "Comunicación", "Venta"],
  form: {
    heading: "Cuéntanos tu proyecto y conversemos sobre cómo darle una dirección propia.",
    badge: "CONTACTO",
    submitLabel: "Quiero conversar sobre mi proyecto",
    successMessage: "Gracias. Te contactaremos para coordinar una primera conversación.",
    // El texto de consentimiento no vive aquí: sale del registro versionado
    // (content/legal/consentimientos.ts) según `consentVersion` del registry.
    // Los `value` deben pertenecer a PROJECT_STAGES (@studionomade/validation).
    stages: [
      { value: "idea", label: "Idea" },
      { value: "en_desarrollo", label: "En desarrollo" },
      { value: "en_venta", label: "En venta" }
    ]
  }
});

/** Bloque de texto con título; base de dolores, servicios y FAQ. */
export interface LandingItem {
  title: string;
  body: string;
}

/**
 * Contenido propio de la landing de paid media. Vive fuera del schema de
 * campaña (`@studionomade/content-schema`) para no cambiar ese contrato: solo
 * esta composición lo consume.
 *
 * TODO-contenido: los textos marcados se validan con dirección creativa y el
 * equipo comercial antes de pautar. No se inventan cifras: las de `stats` son
 * las ya publicadas en /areas/branding.
 */
export const inmobiliariasLanding = {
  whatsapp: {
    /** +569 34045111 (columna Contacto del footer y content/site.ts). */
    phone: "+56934045111",
    message: "Hola, Studio Nomade. Quiero cotizar para mi proyecto inmobiliario."
  },
  hero: {
    eyebrow: "Inmobiliarias y desarrolladoras",
    titleLines: ["Tu proyecto,", "imposible de"],
    titleMark: "confundir.",
    lead: "Branding, renders, sala de ventas, web y campañas bajo una sola dirección, para que tu proyecto se reconozca y se venda desde el verde.",
    primaryCta: "Cotizar mi proyecto",
    secondaryCta: "Escríbenos por WhatsApp",
    trust: ["Respuesta en 24 h hábiles", "Sin compromiso"],
    tags: ["Branding", "Renders", "Sala de ventas", "Web", "Campañas"]
  },
  // TODO-contenido: validar redacción de los tres dolores.
  pains: [
    {
      title: "Vender en verde",
      body: "Antes de que exista el edificio, la marca, los renders y la sala de ventas son el producto. Si no convencen, no hay reserva."
    },
    {
      title: "Diferenciarse",
      body: "Misma comuna, plantas parecidas, los mismos adjetivos. Sin una idea propia, el proyecto termina compitiendo solo por precio."
    },
    {
      title: "Velocidad de venta",
      body: "Cuando marca, renders, web y campañas avanzan por separado, cada pieza llega tarde y el mensaje se diluye justo cuando hay que vender."
    }
  ] satisfies LandingItem[],
  // TODO-contenido: validar alcance y redacción de cada servicio.
  services: [
    {
      title: "Branding de proyecto",
      body: "Nombre, concepto e identidad visual para que el edificio sea reconocible antes de existir."
    },
    {
      title: "Renders y arquitectura",
      body: "Visualizaciones 3D de fachadas, interiores y áreas comunes que muestran lo que todavía no se puede visitar."
    },
    {
      title: "Sala de ventas y activaciones",
      body: "Diseño espacial de sala, piloto y eventos: la marca convertida en una experiencia recorrible."
    },
    {
      title: "Web de proyecto",
      body: "Un sitio pensado para captar cotizaciones, con plantas, ubicación y formulario de contacto."
    },
    {
      title: "Campañas",
      body: "Piezas para redes, Google, vía pública y prensa con la misma dirección creativa de principio a fin."
    }
  ] satisfies LandingItem[],
  stats: [
    { value: 100, prefix: "+", label: "Marcas desarrolladas" },
    { value: 50, prefix: "+", label: "Marcas creadas desde cero" }
  ],
  // TODO-contenido: confirmar nombre del proyecto inmobiliario de los renders.
  cases: [
    {
      image: "renders",
      wide: true,
      client: "Proyecto inmobiliario",
      detail: "Renders y aplicaciones de marca",
      alt: "Renders de un edificio residencial con aplicaciones de marca del proyecto"
    },
    {
      image: "reebok",
      client: "Reebok",
      detail: "Eternal Trend · activación y renders · 2025",
      alt: "Render del pabellón circular de Reebok Eternal Trend con público"
    },
    {
      image: "jaecoo",
      client: "Jaecoo 7",
      detail: "Lanzamiento en retail · 2025",
      alt: "Espacio de lanzamiento del Jaecoo 7 con pantalla y mesón de atención"
    },
    {
      image: "equifax",
      wide: true,
      client: "Equifax",
      detail: "Activación y merchandising",
      alt: "Piezas de activación de Equifax: credencial, gorra, chaquetas y gráfica"
    }
  ] as const,
  process: [
    "Revisamos el proyecto, su público y la competencia para encontrar la idea que lo hace distinto.",
    "Diseñamos nombre, identidad y renders a partir de esa idea, listos para el lanzamiento.",
    "Llevamos la marca a sala de ventas, web y campañas con una misma voz.",
    "Ajustamos piezas y mensajes según cómo avanza la venta, de la preventa a la última unidad."
  ],
  // TODO-contenido: preguntas y respuestas pendientes de validación comercial.
  faq: [
    {
      title: "¿Pueden trabajar con un proyecto en blanco o en verde?",
      body: "Sí, y es cuando más pesa la marca. Sin edificio construido, el nombre, los renders, la sala de ventas y la web son lo que el comprador ve y compara."
    },
    {
      title: "¿Cuánto se demora?",
      body: "Depende del alcance y de la etapa del proyecto. En la primera conversación revisamos tus hitos (lanzamiento, piloto, sala de ventas) y armamos un calendario que llegue a tiempo a cada uno."
    },
    {
      title: "¿Qué entregables recibo?",
      body: "Según lo que contrates: manual de marca del proyecto, renders en alta resolución, diseño de sala de ventas o piloto con planimetrías, sitio web y piezas para campañas, en formatos editables y listos para producción."
    },
    {
      title: "¿Puedo contratar solo una parte, por ejemplo los renders?",
      body: "Sí. Puedes partir por un servicio y sumar otros después; mantenemos la misma dirección para que todo se vea como un solo proyecto."
    },
    {
      title: "¿Trabajan fuera de Santiago?",
      body: "Sí. Estamos en Providencia y trabajamos con proyectos de Santiago y regiones: las reuniones pueden ser remotas y coordinamos visitas a terreno cuando el proyecto lo requiere."
    },
    {
      title: "¿Cuánto cuesta?",
      body: "Cada proyecto se cotiza según su alcance. Cuéntanos en qué etapa está y te enviamos una propuesta, sin costo ni compromiso."
    }
  ] satisfies LandingItem[],
  form: {
    trust: [
      "Respondemos en 24 h hábiles.",
      "Sin compromiso: la primera conversación no tiene costo.",
      "Trabajamos con proyectos en idea, en desarrollo o en venta."
    ]
  }
};
