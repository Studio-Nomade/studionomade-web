import Image from "next/image";
import { Footer } from "@studionomade/ui";
import { FOOTER_COLUMNS } from "../../content/site";

/** Footer público (Figma) con revelado fijo en escritorio. */
export function PublicFooter({ reveal = true }: { reveal?: boolean }) {
  return (
    <Footer
      logo={
        <Image
          src="/home/logo-mark-white.png"
          alt="Studio Nomade"
          width={258}
          height={258}
          sizes="(max-width: 48em) 36vw, 18vw"
        />
      }
      columns={FOOTER_COLUMNS}
      legalLinks={[
        { label: "Privacidad", href: "/privacidad" },
        { label: "Términos", href: "/terminos" }
      ]}
      reveal={reveal}
    />
  );
}
