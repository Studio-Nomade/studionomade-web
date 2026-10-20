import type { AnalyticsAdapter } from "@studionomade/analytics";

type DataLayerWindow = Window & { dataLayer?: Array<Record<string, unknown>> };

/**
 * Adapter genérico: deja cada evento en `window.dataLayer`. Sin GTM cargado no
 * sale nada del navegador; el día que se instale GTM/GA4 los eventos ya están.
 */
export function createDataLayerAdapter(getWindow: () => Window | undefined): AnalyticsAdapter {
  return {
    track(event, properties) {
      const target = getWindow() as DataLayerWindow | undefined;
      if (!target) return;
      target.dataLayer = target.dataLayer ?? [];
      target.dataLayer.push({ event, ...properties });
    }
  };
}
