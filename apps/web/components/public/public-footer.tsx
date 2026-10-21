import Image from "next/image";
import { Footer } from "@studionomade/ui";
import { FOOTER_COLUMNS, SITE_CONTACT } from "../../content/site";
import { footerSocialLinks } from "../../content/social";
import { OfficeMaps } from "./office-maps";

/** Footer público con revelado fijo en escritorio, mapas de oficinas y redes abajo. */
export function PublicFooter({ reveal = true }: { reveal?: boolean }) {
  return (
    <Footer
      cities={SITE_CONTACT.cities}
      logo={
        <Image
          src="/home/logo-mark-white.png"
          alt="Studio Nomade"
          width={258}
          height={258}
          sizes="160px"
        />
      }
      logoSize="compact"
      columns={FOOTER_COLUMNS}
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
