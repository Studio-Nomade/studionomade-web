import type { Metadata } from "next";

import { ContactPage } from "../../components/contact/contact-page";

export const metadata: Metadata = {
  title: "Contacto | Studio Nomade",
  description:
    "Cuéntanos sobre tu proyecto de branding, arquitectura y diseño, audiovisual o web, escríbenos por nuestros canales directos o agenda una videollamada.",
  alternates: { canonical: "/contacto" }
};

export default function ContactRoute() {
  return <ContactPage />;
}
