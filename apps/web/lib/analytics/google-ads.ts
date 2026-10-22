import type { AnalyticsAdapter } from "@studionomade/analytics";

/**
 * Google Ads con la etiqueta de Google (gtag.js), sin GTM.
 *
 * - `NEXT_PUBLIC_GOOGLE_ADS_ID`: ID de la etiqueta, `AW-123456789`.
 * - `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL`: etiqueta de la acción de conversión
 *   "Lead – formulario web" (lo que va después de la barra en `send_to`).
 *
 * Ambos son públicos por diseño: van en el HTML de cualquier sitio con gtag.
 */

export function normalizeGoogleAdsId(value: string | undefined): string | undefined {
  const trimmed = value?.trim().toUpperCase();
  return trimmed && /^AW-\d{6,15}$/.test(trimmed) ? trimmed : undefined;
}

export function normalizeConversionLabel(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && /^[A-Za-z0-9_-]{6,40}$/.test(trimmed) ? trimmed : undefined;
}

export function googleTagScriptSrc(id: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
}

export type Gtag = (...args: unknown[]) => void;

type GtagWindow = Window & { gtag?: Gtag; dataLayer?: unknown[] };

/**
 * Equivalente tipado del snippet oficial: `gtag()` deja sus argumentos en
 * `window.dataLayer` hasta que gtag.js carga. gtag.js solo reconoce objetos
 * `arguments` (no arrays), por eso se empuja `arguments` tal cual.
 */
export function installGtagStub(target: GtagWindow): Gtag {
  if (target.gtag) return target.gtag;
  target.dataLayer = target.dataLayer ?? [];
  const layer = target.dataLayer;
  const gtag: Gtag = function () {
    // eslint-disable-next-line prefer-rest-params -- gtag.js exige el objeto `arguments`.
    layer.push(arguments);
  };
  target.gtag = gtag;
  return gtag;
}

/**
 * `send_page_view: false`: las vistas de página las emite `SiteAnalytics` en
 * cada navegación del App Router, igual que con el píxel de Meta.
 */
export function initGoogleAds(gtag: Gtag, id: string): void {
  gtag("js", new Date());
  gtag("config", id, { send_page_view: false });
}

/**
 * - `page_view` → `page_view` (remarketing).
 * - `form_submit` con `status: "success"` → conversión `Lead – formulario web`,
 *   con `transaction_id` = id del lead para que Google cuente cada lead una vez.
 */
export function createGoogleAdsAdapter(
  getGtag: () => Gtag | undefined,
  id: string,
  leadLabel: string | undefined
): AnalyticsAdapter {
  return {
    track(event, properties) {
      const gtag = getGtag();
      if (!gtag) return;
      if (event === "page_view") {
        gtag("event", "page_view", { send_to: id });
        return;
      }
      if (event === "form_submit" && properties.status === "success" && leadLabel) {
        gtag("event", "conversion", {
          send_to: `${id}/${leadLabel}`,
          ...(properties.event_id ? { transaction_id: String(properties.event_id) } : {})
        });
      }
    }
  };
}
