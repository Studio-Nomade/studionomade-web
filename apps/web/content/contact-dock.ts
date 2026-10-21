/**
 * Canales de contacto directo del botón flotante. TODO: unificar con
 * `DIRECT_CONTACTS` de content/contact.ts cuando exista.
 */
export const DOCK_CONTACTS = [
  {
    kind: "email",
    label: "General",
    value: "contact@studionomade.cl",
    href: "mailto:contact@studionomade.cl"
  },
  {
    kind: "email",
    label: "Ventas",
    value: "sales@studionomade.cl",
    href: "mailto:sales@studionomade.cl"
  },
  {
    kind: "email",
    label: "Branding y marcas",
    value: "branding@studionomade.cl",
    href: "mailto:branding@studionomade.cl"
  },
  {
    kind: "email",
    label: "Área legal",
    value: "legal@studionomade.cl",
    href: "mailto:legal@studionomade.cl"
  },
  {
    kind: "whatsapp",
    label: "WhatsApp comercial",
    value: "+56 9 3404 5111",
    href: "https://wa.me/56934045111"
  }
] as const;
