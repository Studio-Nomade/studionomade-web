import type { Metadata } from "next";

import { AboutPage } from "../../components/about/about-page";

export const metadata: Metadata = {
  title: "Nosotros | Studio Nomade",
  description:
    "Studio Nomade es un estudio creativo que integra estrategia, diseño, espacio y tecnología. Conoce nuestro fundamento, áreas, método y equipo.",
  alternates: { canonical: "/nosotros" }
};

export default function NosotrosRoute() {
  return <AboutPage />;
}
