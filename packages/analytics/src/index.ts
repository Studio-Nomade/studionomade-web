export type AnalyticsEvent =
  | "page_view"
  | "cta_click"
  | "contact_click"
  | "form_submit"
  | "video_play"
  | "external_link"
  | "prototype_open"
  | "filter_change";
export type AnalyticsProperties = Record<string, string | number | boolean | null>;
export type AnalyticsAdapter = {
  track(event: AnalyticsEvent, properties: AnalyticsProperties): void | Promise<void>;
};

const DISALLOWED_KEYS = /email|phone|name|message|address|token|cookie|authorization/i;

export function sanitizeAnalyticsProperties(properties: AnalyticsProperties): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([key]) => !DISALLOWED_KEYS.test(key))
  );
}

export async function trackSafely(
  adapter: AnalyticsAdapter | undefined,
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {}
): Promise<void> {
  if (!adapter) return;
  try {
    await adapter.track(event, sanitizeAnalyticsProperties(properties));
  } catch {
    /* La telemetría nunca interrumpe el producto. */
  }
}

/**
 * Reparte cada evento a varios proveedores (p. ej. Meta Pixel + dataLayer para
 * GTM/GA). Un proveedor que falla no impide que los demás reciban el evento.
 */
export function combineAdapters(
  ...adapters: Array<AnalyticsAdapter | undefined | null | false>
): AnalyticsAdapter {
  const active = adapters.filter((adapter): adapter is AnalyticsAdapter => Boolean(adapter));
  return {
    async track(event, properties) {
      await Promise.allSettled(
        active.map(async (adapter) => adapter.track(event, { ...properties }))
      );
    }
  };
}
