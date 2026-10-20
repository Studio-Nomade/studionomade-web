# Medición de campañas y píxel de Meta

Cómo se mide la campaña `/campanas/inmobiliarias` (y cualquier campaña futura del registry): qué se guarda en cada lead, qué eventos salen al navegador, cómo se activa el píxel de Meta y cómo se verifica.

## Variables de entorno (apps/web)

| Variable                             | Tipo    | Valor por defecto | Efecto                                                                                                                                                              |
| ------------------------------------ | ------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_META_PIXEL_ID`          | Pública | vacío             | ID numérico del píxel. Vacío o inválido: no se carga nada de Meta y el CSP no se abre a Meta.                                                                       |
| `NEXT_PUBLIC_ANALYTICS_CONSENT_MODE` | Pública | `implicit`        | `implicit`: mide salvo Do Not Track / Global Privacy Control o rechazo explícito. `explicit`: no mide hasta que un banner llame a `setAnalyticsConsent("granted")`. |

Ambas se resuelven **en build** (van al bundle y al CSP de `next.config.ts`): tras cambiarlas en Vercel hay que redeployar. Son públicas por diseño; el ID de píxel no es un secreto. No se agregó ninguna variable privada.

## Datos que se guardan en `leads`

Migración `supabase/migrations/202610200001_lead_click_ids.sql` (rollback en `supabase/rollbacks/202610200001_lead_click_ids.down.sql`):

| Columna         | Origen                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `gclid`         | Parámetro `gclid` del primer contacto de la sesión (Google Ads, conversiones offline).                                     |
| `fbclid`        | Parámetro `fbclid` del primer contacto de la sesión.                                                                       |
| `fbp`           | Cookie `_fbp` que deja el píxel; se lee en el servidor al enviar.                                                          |
| `fbc`           | Cookie `_fbc`; si no existe y hay `fbclid`, se deriva como `fb.1.{ms}.{fbclid}`.                                           |
| `landing_url`   | URL completa de llegada (primer contacto con JS; la que vio el servidor sin JS).                                           |
| `project_stage` | Etapa declarada: `idea` · `en_desarrollo` · `en_venta` (check en BD + enum Zod).                                           |
| `referrer`      | Ya existía. Ahora, en campañas, es el `document.referrer` del primer contacto (antes era la propia página del formulario). |

`gclid`, `fbclid`, `fbp`, `fbc` y `landing_url` se validan de forma tolerante: un valor malformado se descarta sin bloquear el lead. La migración también rescata la etapa de leads antiguos que la tenían pegada al inicio de `message` ("Etapa: …"), sin modificar el mensaje.

`fbp`, `fbc`, `gclid` y el `id` del lead (que es el `eventID` del evento `Lead`) dejan todo listo para una Conversions API / Enhanced Conversions desde el servidor, con deduplicación contra el píxel.

### Aplicar en Supabase

1. Abrir el SQL Editor del proyecto (o `supabase db push` contra el proyecto enlazado).
2. Ejecutar el contenido completo de `supabase/migrations/202610200001_lead_click_ids.sql`. Es aditiva: no borra columnas ni datos.
3. Verificar: `select gclid, fbclid, fbp, fbc, landing_url, project_stage from public.leads limit 1;`
4. Desplegar la app **después** de la migración: la versión nueva de `submit-lead` envía los campos nuevos a `capture_lead`.

En local: `pnpm db:reset` aplica todo; `pnpm test:db` cubre las columnas y el check de `project_stage`.

## Eventos

Todo pasa por `track()` (`apps/web/lib/analytics/track.ts`) y `@studionomade/analytics`, que elimina propiedades con apariencia de PII. `combineAdapters` reparte cada evento a:

- **Meta Pixel** (`lib/analytics/meta-pixel.ts`), si hay ID.
- **`window.dataLayer`** (`lib/analytics/data-layer.ts`), siempre que haya consentimiento. Sin GTM no sale nada del navegador; el día que se instale GTM/GA4 los eventos ya están.

| Evento genérico                   | Disparador                                                                       | Meta                                      |
| --------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| `page_view`                       | Carga inicial y cada navegación del App Router (`usePathname`).                  | `PageView`                                |
| `cta_click`                       | Click en un enlace/botón dentro de un contenedor con `data-cta="<id>"`.          | Personalizado `cta_click` (`cta`, `path`) |
| `contact_click`                   | Click en `mailto:`, `tel:` o WhatsApp. Solo se envía el canal, nunca el destino. | `Contact` (`channel`)                     |
| `form_submit` (`status: success`) | Envío exitoso con `leadId` (el honeypot no cuenta).                              | `Lead` con `{ eventID: <id del lead> }`   |
| `form_submit` (`status: error`)   | Envío rechazado.                                                                 | — (solo dataLayer)                        |

CTAs marcados hoy: `agendar-conversacion` y `diferenciar-proyecto`. Los componentes de `@studionomade/ui` no aceptan props extra, por eso `data-cta` va en el contenedor.

El píxel se inicializa con `autoConfig` desactivado (no rastrea botones ni metadatos por su cuenta) y `disablePushState` (los PageView los emite el sitio; así no se duplican). No se usa el `<noscript>` del snippet oficial: sin JavaScript no se puede respetar Do Not Track.

## Decisión de consentimiento

Chile (Ley 19.628) no exige hoy un banner de cookies. Se optó por un criterio conservador, fácil de endurecer:

- Por defecto (`implicit`) se mide, **salvo** que el navegador envíe Do Not Track o Global Privacy Control, o que la persona haya rechazado (`setAnalyticsConsent("denied")`).
- Con `explicit` no se carga nada hasta `setAnalyticsConsent("granted")`.
- Una decisión explícita siempre gana sobre la señal del navegador. Revocar en caliente llama a `fbq("consent", "revoke")` y desactiva `track()`.

Para conectar un banner: importar `setAnalyticsConsent` de `apps/web/lib/analytics/consent.ts` y llamarlo con `"granted"`/`"denied"`. La decisión se guarda en `localStorage` (`sn:analytics-consent`) y `SiteAnalytics` reacciona al evento `sn:analytics-consent-change`. Si se exige consentimiento previo (p. ej. por la Ley 21.719), basta con poner `NEXT_PUBLIC_ANALYTICS_CONSENT_MODE=explicit`.

La política de privacidad (`/privacidad`) declara el píxel y los identificadores; su contenido está **pendiente de revisión legal**.

## Consentimiento del formulario

El texto visible del checkbox sale del mismo registro que se guarda (`apps/web/content/legal/consentimientos.ts`) a través de `ConsentLabel`. La campaña usa la versión `2026-10-v1`, que enlaza a `/privacidad`. Las versiones publicadas no se editan: un cambio de redacción es una versión nueva.

## CSP

`buildStaticContentSecurityPolicy(origin, { metaPixel: true })` (`packages/config/src/security.ts`) agrega solo:

- `script-src https://connect.facebook.net`
- `connect-src https://www.facebook.com https://connect.facebook.net`
- `img-src` ya admitía `https:`, que cubre el beacon `https://www.facebook.com/tr`.

El píxel se carga como archivo externo con `next/script` (`afterInteractive`) y su stub se instala desde TypeScript, sin snippet en línea, así que no necesita nonce ni hash. La política estricta del admin no cambia.

## Verificación

1. Instalar la extensión **Meta Pixel Helper** en Chrome.
2. Abrir `https://<preview>/campanas/inmobiliarias?fbclid=prueba&utm_source=meta` con Do Not Track desactivado.
3. Pixel Helper debe mostrar el ID configurado con `PageView`.
4. Click en «Agendar conversación»: aparece `cta_click` (evento personalizado).
5. Enviar el formulario: aparece `Lead` con `eventID` = `id` del lead en Supabase.
6. En DevTools → Consola: `window.dataLayer` debe listar `page_view`, `cta_click` y `form_submit`.
7. En Supabase: el lead tiene `fbclid = 'prueba'`, `fbc` (`fb.1.…`), `fbp` (si el píxel cargó), `landing_url` y `project_stage`.
8. En Events Manager → Probar eventos se puede confirmar la recepción en vivo.
9. Con Do Not Track activado, recargar: Pixel Helper no debe detectar el píxel y no debe haber peticiones a `facebook.net`.

No debe haber errores de CSP en la consola. Si los hay, revisar que `NEXT_PUBLIC_META_PIXEL_ID` estuviera definido **en el build**.
