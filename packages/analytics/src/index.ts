export type AnalyticsEvent =
  | "cta_click"
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
