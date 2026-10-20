import type { AnalyticsEvent, AnalyticsProperties } from "@studionomade/analytics";

export interface ClickEvent {
  event: AnalyticsEvent;
  properties: AnalyticsProperties;
}

/**
 * Clasifica un click delegado. Los CTA se marcan con `data-cta="<id>"` en un
 * contenedor (los componentes de @studionomade/ui no aceptan props extra); solo
 * cuenta el click sobre un enlace o botón dentro de él.
 *
 * Nunca se envía el `href` de mailto/tel: contiene datos de contacto.
 */
export function classifyClick(target: EventTarget | null, path: string): ClickEvent | null {
  if (!(target instanceof Element)) return null;
  const control = target.closest("a, button");
  if (!control) return null;

  const cta = control.closest<HTMLElement>("[data-cta]")?.dataset.cta;
  if (cta) return { event: "cta_click", properties: { cta, path } };

  const href = control.getAttribute("href") ?? "";
  const channel = href.startsWith("mailto:")
    ? "email"
    : href.startsWith("tel:")
      ? "phone"
      : /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)
        ? "whatsapp"
        : null;
  return channel ? { event: "contact_click", properties: { channel, path } } : null;
}
