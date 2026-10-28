import type {
  LeadArea,
  LeadBudgetRange,
  LeadNeed,
  LeadSourceChannel,
  LeadTimeline
} from "@studionomade/validation";

import type { LeadConsentVersion } from "./legal/consentimientos";

/**
 * Contacto del estudio: canales directos, agenda de videollamadas y opciones
 * del formulario dedicado de /contacto.
 */

export interface DirectContact {
  id: string;
  /** Para qué sirve el canal. */
  label: string;
  /** Lo que se muestra (correo o número). */
  value: string;
  href: string;
  kind: "email" | "whatsapp";
}

/**
 * Canales directos del estudio. Fuente única: otros componentes del sitio
 * (por ejemplo, el footer) pueden reutilizarlos.
 */
export const DIRECT_CONTACTS = [
  {
    id: "general",
    label: "General",
    value: "contact@studionomade.cl",
    href: "mailto:contact@studionomade.cl",
    kind: "email"
  },
  {
    id: "ventas",
    label: "Ventas",
    value: "sales@studionomade.cl",
    href: "mailto:sales@studionomade.cl",
    kind: "email"
  },
  {
    id: "branding",
    label: "Branding y marcas",
    value: "branding@studionomade.cl",
    href: "mailto:branding@studionomade.cl",
    kind: "email"
  },
  {
    id: "legal",
    label: "Legal",
    value: "legal@studionomade.cl",
    href: "mailto:legal@studionomade.cl",
    kind: "email"
  },
  {
    id: "whatsapp",
    label: "WhatsApp comercial",
    value: "+56 9 3404 5111",
    href: "https://wa.me/56934045111",
    kind: "whatsapp"
  }
] as const satisfies readonly DirectContact[];

/**
 * Página de reservas embebida en /contacto#agenda.
 *
 * TODO: el estudio migra a Google Calendar (páginas de citas). Reemplazar por
 * la URL pública de la página de reservas, por ejemplo
 * `https://calendar.google.com/calendar/appointments/schedules/<id>?gv=true`
 * (`gv=true` es la versión pensada para incrustar). Revisar que el CSP
 * (`frame-src`) incluya el origen.
 */
export const BOOKING_URL =
  "https://calendly.com/studionomade_/revision-proyecto?hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=e8c736";

/** Orígenes de reservas que se pueden incrustar (deben estar en `frame-src`). */
const EMBEDDABLE_BOOKING_HOSTS = ["calendly.com", "calendar.google.com"] as const;

/** true si la URL es https y de un proveedor de reservas conocido. */
export function isEmbeddableBookingUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" && EMBEDDABLE_BOOKING_HOSTS.some((host) => url.hostname === host)
    );
  } catch {
    return false;
  }
}

/** Formulario de captura existente (`forms.slug`). */
export const CONTACT_FORM_SLUG = "contacto-general";
/** Consentimiento vigente, con enlace a la política de privacidad. */
export const CONTACT_CONSENT_VERSION: LeadConsentVersion = "2026-10-v1";

export interface ChoiceOption<Value extends string> {
  value: Value;
  label: string;
}

export const AREA_OPTIONS: ChoiceOption<LeadArea>[] = [
  { value: "branding", label: "Branding & Design" },
  { value: "architecture", label: "Architecture & Design" },
  { value: "audiovisual", label: "Audiovisual & Animation" },
  { value: "web-design", label: "Web Design" }
];

export const NEED_OPTIONS: ChoiceOption<LeadNeed>[] = [
  { value: "imagen_marca", label: "Imagen de marca" },
  { value: "redes_sociales", label: "Redes sociales" },
  { value: "produccion_audiovisual", label: "Producción audiovisual" },
  { value: "estrategia_comunicacional", label: "Estrategia comunicacional" },
  { value: "diseno_web", label: "Diseño web" },
  { value: "interiores_stands", label: "Diseño de interiores / stands" },
  { value: "asesoria_comunicacional", label: "Asesoría comunicacional" },
  { value: "otro", label: "Otro" }
];

export const BUDGET_OPTIONS: ChoiceOption<LeadBudgetRange>[] = [
  { value: "menos_1m", label: "Menos de $1.000.000" },
  { value: "1m_3m", label: "$1.000.000 – $3.000.000" },
  { value: "3m_8m", label: "$3.000.000 – $8.000.000" },
  { value: "8m_20m", label: "$8.000.000 – $20.000.000" },
  { value: "mas_20m", label: "Más de $20.000.000" },
  { value: "sin_definir", label: "Aún no lo sé" }
];

export const TIMELINE_OPTIONS: ChoiceOption<LeadTimeline>[] = [
  { value: "lo_antes_posible", label: "Lo antes posible" },
  { value: "1_3_meses", label: "1–3 meses" },
  { value: "3_6_meses", label: "3–6 meses" },
  { value: "sin_fecha", label: "Sin fecha definida" }
];

export const SOURCE_OPTIONS: ChoiceOption<LeadSourceChannel>[] = [
  { value: "recomendacion", label: "Recomendación" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "behance", label: "Behance" },
  { value: "google", label: "Google" },
  { value: "otro", label: "Otro" }
];

/** Etiqueta visible de un valor (para notificaciones); el valor si no existe. */
export function optionLabel<Value extends string>(
  options: readonly ChoiceOption<Value>[],
  value: string | undefined
): string | undefined {
  if (!value) return undefined;
  return options.find((option) => option.value === value)?.label ?? value;
}
