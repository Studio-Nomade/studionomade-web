"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader, type SiteHeaderProps } from "@studionomade/ui";
import { SITE_CONTACT, SITE_NAV } from "../../content/site";

type PublicHeaderProps = Pick<SiteHeaderProps, "tone" | "position">;

/** Cabecera pública con la navegación del sitio y `next/link`. */
export function PublicHeader({ tone = "dark", position = "sticky" }: PublicHeaderProps) {
  const pathname = usePathname();
  return (
    <SiteHeader
      links={SITE_NAV}
      tone={tone}
      position={position}
      currentPath={pathname}
      linkComponent={Link}
      aside={
        <>
          <a href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
          <span>{SITE_CONTACT.cities}</span>
        </>
      }
    />
  );
}
