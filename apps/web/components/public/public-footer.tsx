import Image from "next/image";
import { Footer } from "@studionomade/ui";
import { CAMPAIGN_FOOTER_COLUMNS, FOOTER_COLUMNS, SITE_CONTACT } from "../../content/site";
import { footerSocialLinks } from "../../content/social";
import { OfficeMaps } from "./office-maps";

/**
 * Footer público, el mismo en todas las páginas: revelado fijo en escritorio,
 * mapas de oficinas y redes abajo. `variant="campaign"` (landings de alta
 * conversión) quita los enlaces a Proyectos, Nosotros, Blog y Contacto.
 */
export function PublicFooter({
  reveal = true,
  variant = "site"
}: {
  reveal?: boolean;
  variant?: "site" | "campaign";
}) {
  return (
    <Footer
      cities={SITE_CONTACT.cities}
      logo={
        <Image
          src="/home/logo-mark-white.png"
          alt="Studio Nomade"
          width={258}
          height={258}
          sizes="(max-width: 48em) 40vw, 12vw"
        />
      }
      logoSize="compact"
      columns={variant === "campaign" ? CAMPAIGN_FOOTER_COLUMNS : FOOTER_COLUMNS}
      extra={<OfficeMaps />}
      social={footerSocialLinks()}
      legalLinks={[
        { label: "Privacidad", href: "/privacidad" },
        { label: "Términos", href: "/terminos" }
      ]}
      reveal={reveal}
    />
  );
}
