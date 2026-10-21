"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader, type SiteHeaderLink, type SiteHeaderProps } from "@studionomade/ui";
import { SITE_AREA_LINKS, SITE_CONTACT, SITE_NAV } from "../../content/site";
import { ContactDock } from "./contact-dock";
import { LanguageSwitch } from "./language-switch";

type PublicHeaderProps = Pick<SiteHeaderProps, "tone" | "position">;

/** Menú principal: "Áreas" despliega las cuatro áreas con su isologo. */
const LINKS: SiteHeaderLink[] = SITE_NAV.map((item) =>
  item.submenu === "areas"
    ? {
        label: item.label,
        children: SITE_AREA_LINKS.map((area) => ({
          label: area.label,
          href: area.href,
          code: area.code,
          media: <Image src={area.symbol} alt="" width={96} height={96} />
        }))
      }
    : { label: item.label, href: item.href }
);

/**
 * Cabecera pública con la navegación del sitio y `next/link`. Acompaña a cada
 * página el botón flotante de contacto directo.
 */
export function PublicHeader({ tone = "dark", position = "sticky" }: PublicHeaderProps) {
  const pathname = usePathname();
  return (
    <>
      <SiteHeader
        links={LINKS}
        tone={tone}
        position={position}
        currentPath={pathname}
        linkComponent={Link}
        actions={<LanguageSwitch tone={tone} />}
        aside={
          <>
            <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
            <span>{SITE_CONTACT.cities}</span>
          </>
        }
      />
      <ContactDock />
    </>
  );
}
