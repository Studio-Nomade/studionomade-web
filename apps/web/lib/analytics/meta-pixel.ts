import type { AnalyticsAdapter } from "@studionomade/analytics";

/** Único origen de script que necesita el píxel (ver CSP en packages/config). */
export const META_PIXEL_SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";

/** Los IDs de píxel son numéricos; cualquier otra cosa se ignora. */
export function normalizeMetaPixelId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && /^\d{5,20}$/.test(trimmed) ? trimmed : undefined;
}

export type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
};

type FbqWindow = Window & { fbq?: Fbq; _fbq?: Fbq };

/**
 * Equivalente tipado del snippet oficial de Meta, sin `<script>` en línea: deja
 * `window.fbq` encolando llamadas hasta que `fbevents.js` (next/script) cargue.
 *
 * `disablePushState` evita que el píxel cuente solo cada `history.pushState`:
 * el PageView lo emite `SiteAnalytics` en cada navegación del App Router, así no
 * hay duplicados.
 */
export function installFbqStub(target: FbqWindow): Fbq {
  if (target.fbq) return target.fbq;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  fbq.disablePushState = true;
  target.fbq = fbq;
  if (!target._fbq) target._fbq = fbq;
  return fbq;
}

export function initMetaPixel(fbq: Fbq, pixelId: string): void {
  // Sin configuración automática: no se rastrean botones ni metadatos por cuenta
  // del píxel; solo los eventos que define este sitio.
  fbq("set", "autoConfig", false, pixelId);
  fbq("init", pixelId);
}

/**
 * Traduce los eventos genéricos de `@studionomade/analytics` a eventos de Meta.
 *
 * - `page_view` → `PageView`
 * - `cta_click` → evento personalizado `cta_click`
 * - `contact_click` (mailto/tel/WhatsApp) → `Contact`
 * - `form_submit` con `status: "success"` → `Lead`, con `eventID` = id del lead
 *   para deduplicar con la Conversions API.
 */
export function createMetaPixelAdapter(getFbq: () => Fbq | undefined): AnalyticsAdapter {
  return {
    track(event, properties) {
      const fbq = getFbq();
      if (!fbq) return;
      switch (event) {
        case "page_view":
          fbq("track", "PageView");
          return;
        case "cta_click":
          fbq("trackCustom", "cta_click", {
            cta: properties.cta ?? null,
            path: properties.path ?? null
          });
          return;
        case "contact_click":
          fbq("track", "Contact", { channel: properties.channel ?? null });
          return;
        case "form_submit": {
          if (properties.status !== "success") return;
          const eventId = properties.event_id ? String(properties.event_id) : undefined;
          fbq(
            "track",
            "Lead",
            {
              content_name: properties.form ?? null,
              content_category: properties.origin ?? null
            },
            eventId ? { eventID: eventId } : undefined
          );
          return;
        }
        default:
          return;
      }
    }
  };
}
