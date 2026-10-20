/**
 * Enlace `wa.me` con mensaje prellenado. Solo dígitos en el número: wa.me no
 * acepta `+`, espacios ni guiones.
 *
 * El clasificador de clicks (`lib/analytics/clicks.ts`) lo reconoce como canal
 * `whatsapp` y lo envía como `Contact` a Meta, siempre que el enlace NO esté
 * dentro de un contenedor `data-cta` (ahí contaría como `cta_click`).
 */
export function whatsappHref(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) throw new Error("whatsappHref requiere un número");
  const text = message?.trim();
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
