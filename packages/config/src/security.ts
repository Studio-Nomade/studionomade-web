export const SECURITY_HEADERS = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
] as const;

/**
 * Orígenes mínimos del píxel de Meta (`fbevents.js` + beacons a `/tr`). Solo se
 * abren si el sitio tiene `NEXT_PUBLIC_META_PIXEL_ID`. `img-src` ya admite
 * cualquier `https:` (imágenes de CMS y Vimeo), así que el beacon de imagen a
 * www.facebook.com no necesita una entrada propia.
 */
export const META_PIXEL_CSP = {
  scriptSrc: ["https://connect.facebook.net"],
  connectSrc: ["https://www.facebook.com", "https://connect.facebook.net"],
  imgSrc: ["https://www.facebook.com"]
} as const;

/**
 * Orígenes de la etiqueta de Google (gtag.js) para conversiones y remarketing de
 * Google Ads, según la guía de CSP de Google. Solo se abren si el sitio tiene
 * `NEXT_PUBLIC_GOOGLE_ADS_ID`. `img-src` ya admite `https:`. Se incluyen los
 * dominios regionales de Google de los mercados del estudio (Chile, España y
 * Portugal), adonde la etiqueta también envía beacons.
 */
export const GOOGLE_ADS_CSP = {
  scriptSrc: [
    "https://www.googletagmanager.com",
    "https://www.googleadservices.com",
    "https://googleads.g.doubleclick.net",
    "https://www.google.com"
  ],
  connectSrc: [
    "https://www.google.com",
    "https://www.google.cl",
    "https://www.google.es",
    "https://www.google.pt",
    "https://googleads.g.doubleclick.net",
    "https://www.googleadservices.com"
  ],
  frameSrc: ["https://td.doubleclick.net", "https://www.googletagmanager.com"]
} as const;

/**
 * Servicios de terceros que el sitio público incrusta o carga a pedido:
 * - Google Maps (embed sin API key) en el footer.
 * - Agenda de videollamadas: Calendly hoy, Google Calendar (citas) después.
 * - Traductor web de Google, que solo se carga si el visitante elige EN o PT.
 */
export const PUBLIC_EMBEDS_CSP = {
  frameSrc: [
    "https://www.google.com",
    "https://calendly.com",
    "https://calendar.google.com",
    "https://translate.google.com",
    "https://translate.googleapis.com"
  ],
  scriptSrc: [
    "https://translate.google.com",
    "https://translate.googleapis.com",
    "https://translate-pa.googleapis.com",
    "https://www.gstatic.com"
  ],
  styleSrc: ["https://www.gstatic.com", "https://translate.googleapis.com"],
  connectSrc: ["https://translate.googleapis.com", "https://translate-pa.googleapis.com"]
} as const;

export interface ContentSecurityPolicyOptions {
  /** Abre los orígenes de `META_PIXEL_CSP`. */
  metaPixel?: boolean;
  /** Abre los orígenes de `GOOGLE_ADS_CSP`. */
  googleAds?: boolean;
  /** Solo `next dev`: React Refresh evalúa código y sin esto no hidrata. */
  allowDevEval?: boolean;
}

/**
 * Directivas comunes a las dos políticas. Lo único que cambia entre ellas es
 * `script-src`, que es justo donde está la decisión difícil (ver más abajo).
 */
function sharedDirectives(
  connectOrigin?: string,
  extraConnect: readonly string[] = [],
  publicEmbeds = false,
  extraFrame: readonly string[] = []
): string[] {
  const connectSources = [
    "'self'",
    connectOrigin,
    ...extraConnect,
    ...(publicEmbeds ? PUBLIC_EMBEDS_CSP.connectSrc : [])
  ]
    .filter(Boolean)
    .join(" ");
  const styleSources = [
    "'self'",
    "'unsafe-inline'",
    ...(publicEmbeds ? PUBLIC_EMBEDS_CSP.styleSrc : [])
  ];
  const frameSources = [
    "https://player.vimeo.com",
    "https://www.behance.net",
    ...(publicEmbeds ? PUBLIC_EMBEDS_CSP.frameSrc : []),
    ...extraFrame
  ];
  return [
    "default-src 'self'",
    // Los atributos `style` en línea son obligatorios: el sistema de revelado
    // pasa `--sn-reveal-step` por `style`, y es la única vía que deja la regla
    // de adherencia `no-hardcoded-style`.
    `style-src ${styleSources.join(" ")}`,
    // `https:` ya cubre el beacon de imagen del píxel (META_PIXEL_CSP.imgSrc).
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    `frame-src ${frameSources.join(" ")}`,
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
}

/**
 * Política fuerte, para superficies **renderizadas en cada petición**.
 *
 * `'strict-dynamic'` es lo que hace que esto valga la pena: desactiva el
 * permiso por origen y solo deja correr los scripts que traen el nonce, más los
 * que esos scripts carguen. Una inyección de `<script src>` deja de servir.
 *
 * ⚠️ El precio: **exige que el nonce esté en el HTML**. Next lo estampa leyendo
 * la cabecera `Content-Security-Policy` de la *petición*, así que solo puede
 * hacerlo cuando hay una petición que renderice — es decir, en rutas dinámicas.
 * En una ruta prerenderizada el HTML se generó en build, sale sin nonce, y como
 * `'strict-dynamic'` anula `'self'`, el navegador bloquea **todos** los scripts.
 * Por eso esta política es solo para el admin, donde todo es `force-dynamic`.
 */
export function buildStrictContentSecurityPolicy(nonce: string, connectOrigin?: string): string {
  return [
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    ...sharedDirectives(connectOrigin)
  ].join("; ");
}

/**
 * Política para el sitio público, que es **estático a propósito** (D6/D7).
 *
 * Sin nonce, y con `'unsafe-inline'`, porque Next emite scripts en línea con los
 * datos de Flight en cada página prerenderizada y no hay forma de firmarlos: el
 * nonce no existe en build y los hashes cambian por página, mientras que la
 * cabecera es una sola para todo el sitio.
 *
 * **No añadir un nonce aquí.** En cuanto hay un nonce (o un hash) en
 * `script-src`, el navegador ignora `'unsafe-inline'` por especificación, y se
 * vuelve al fallo que esto arregla.
 *
 * Lo que se conserva pese a `'unsafe-inline'`: `object-src 'none'`,
 * `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` y la lista
 * blanca de `frame-src`. Lo que se pierde: la defensa contra XSS reflejada o
 * almacenada que consiga inyectar un `<script>` en línea.
 *
 * Para endurecerlo hay que pasar el sitio público a renderizado dinámico y usar
 * `buildStrictContentSecurityPolicy`. Es una decisión de producto —cuesta el
 * prerender—, no un detalle de implementación.
 *
 * Con `googleAds` se suman los orígenes de `GOOGLE_ADS_CSP` (gtag.js, también
 * como archivo externo con `next/script`).
 *
 * Con `metaPixel` se suma únicamente `https://connect.facebook.net` a
 * `script-src` y los dos orígenes de beacons a `connect-src`. El píxel se carga
 * con `next/script` desde un archivo externo (sin snippet en línea), así que no
 * necesita nonce ni hash.
 */
export function buildStaticContentSecurityPolicy(
  connectOrigin?: string,
  options: ContentSecurityPolicyOptions = {}
): string {
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...(options.allowDevEval ? ["'unsafe-eval'"] : []),
    ...(options.metaPixel ? META_PIXEL_CSP.scriptSrc : []),
    ...(options.googleAds ? GOOGLE_ADS_CSP.scriptSrc : []),
    ...PUBLIC_EMBEDS_CSP.scriptSrc
  ];
  const extraConnect = [
    ...(options.metaPixel ? META_PIXEL_CSP.connectSrc : []),
    ...(options.googleAds ? GOOGLE_ADS_CSP.connectSrc : [])
  ];
  return [
    `script-src ${[...new Set(scriptSources)].join(" ")}`,
    ...sharedDirectives(
      connectOrigin,
      extraConnect,
      true,
      options.googleAds ? GOOGLE_ADS_CSP.frameSrc : []
    )
  ].join("; ");
}
