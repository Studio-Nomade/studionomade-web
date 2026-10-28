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
 * Directivas comunes a las dos políticas. Lo único que cambia entre ellas es
 * `script-src`, que es justo donde está la decisión difícil (ver más abajo).
 */
function sharedDirectives(connectOrigin?: string): string[] {
  const connectSources = ["'self'", connectOrigin].filter(Boolean).join(" ");
  return [
    "default-src 'self'",
    // Los atributos `style` en línea son obligatorios: el sistema de revelado
    // pasa `--sn-reveal-step` por `style`, y es la única vía que deja la regla
    // de adherencia `no-hardcoded-style`.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "frame-src https://player.vimeo.com https://www.behance.net",
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
 */
export function buildStaticContentSecurityPolicy(connectOrigin?: string): string {
  return ["script-src 'self' 'unsafe-inline'", ...sharedDirectives(connectOrigin)].join("; ");
}
