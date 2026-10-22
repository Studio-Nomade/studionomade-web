import {
  trackSafely,
  type AnalyticsAdapter,
  type AnalyticsEvent,
  type AnalyticsProperties
} from "@studionomade/analytics";

/**
 * Punto único para emitir eventos desde el cliente. `SiteAnalytics` configura el
 * adapter cuando hay consentimiento; sin él, `track` no hace nada.
 */
let activeAdapter: AnalyticsAdapter | undefined;

export function configureAnalytics(adapter: AnalyticsAdapter | undefined): void {
  activeAdapter = adapter;
}

export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  void trackSafely(activeAdapter, event, properties);
}
