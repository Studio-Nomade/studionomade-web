import type { FooterColumn, SiteHeaderLink } from "@studionomade/ui";

/** Navegación principal del sitio público (menú a pantalla completa). */
export const SITE_NAV: SiteHeaderLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Branding", href: "/areas/branding" },
  { label: "Architecture", href: "/areas/architecture" },
  { label: "Contacto", href: "/contacto" }
];

export const SITE_CONTACT = {
  email: "contact@studionomade.cl",
  phones: ["+569 34045111", "+569 34045134"],
  cities: "Santiago | Madrid"
} as const;

const tel = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;

/** Columnas del footer según Figma: Studio, Contacto y Redes. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Studio",
    items: [{ label: "Santa Beatriz 100, Of. 1101" }, { label: "Providencia, Santiago" }]
  },
  {
    title: "Contacto",
    items: [
      { label: SITE_CONTACT.email, href: `mailto:${SITE_CONTACT.email}` },
      ...SITE_CONTACT.phones.map((phone) => ({ label: phone, href: tel(phone) }))
    ]
  },
  {
    title: "Redes",
    // TODO(contenido): enlazar los perfiles oficiales cuando el estudio confirme las URLs.
    items: [{ label: "Instagram" }, { label: "LinkedIn" }, { label: "Vimeo" }]
  }
];
