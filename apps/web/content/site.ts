import type { FooterColumn } from "@studionomade/ui";
import { STUDIO_AREAS } from "./area-meta";

/** Entrada de la navegación principal (el submenú Áreas se arma en PublicHeader). */
export interface SiteNavItem {
  label: string;
  href?: string;
  /** `areas`: despliega las cuatro áreas del Studio a la derecha. */
  submenu?: "areas";
}

/** Navegación principal del sitio público (menú a pantalla completa). */
export const SITE_NAV: SiteNavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Áreas", submenu: "areas" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" }
];

export const SITE_AREA_LINKS = STUDIO_AREAS.map((area) => ({
  label: area.name,
  href: area.href,
  code: area.code,
  symbol: area.symbol
}));

export const SITE_CITIES = ["Santiago", "Algarrobo", "Madrid", "Lisboa"] as const;

export const SITE_CONTACT = {
  email: "contact@studionomade.cl",
  phones: ["+569 34045111", "+569 34045134"],
  cities: SITE_CITIES.join(" | ")
} as const;

/** Oficinas con dirección física: alimentan el footer y sus mapas. */
export const SITE_OFFICES = [
  {
    city: "Santiago",
    lines: ["Avenida Providencia 1208, Oficina 207", "Providencia, Santiago"],
    mapQuery: "Avenida Providencia 1208, Providencia, Santiago, Chile"
  },
  {
    city: "Algarrobo",
    lines: ["Lomas de San Gerónimo, Parcela 06", "Algarrobo, Valparaíso"],
    mapQuery: "Lomas de San Gerónimo, Algarrobo, Valparaíso, Chile"
  }
] as const;

const tel = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;

/** Columnas del footer: Studio (oficinas), Contacto y Explorar. Las redes van abajo. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Studio",
    items: SITE_OFFICES.flatMap((office) => office.lines.map((line) => ({ label: line })))
  },
  {
    title: "Contacto",
    items: [
      { label: SITE_CONTACT.email, href: `mailto:${SITE_CONTACT.email}` },
      ...SITE_CONTACT.phones.map((phone) => ({ label: phone, href: tel(phone) }))
    ]
  },
  {
    title: "Explorar",
    items: [
      { label: "Proyectos", href: "/proyectos" },
      { label: "Nosotros", href: "/nosotros" },
      { label: "Contacto", href: "/contacto" },
      { label: "Agendar videollamada", href: "/contacto#agenda" }
    ]
  }
];
