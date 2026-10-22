import type { Metadata } from "next";
import { HomeLanding } from "../components/home/home-landing";
import { PublicFooter, PublicHeader } from "../components/public/public-shell";

export const metadata: Metadata = {
  title: "Studio Nomade · Branding, Architecture, Audiovisual y Web Design",
  description:
    "Estudio creativo en Santiago y Madrid: marcas, espacios y experiencias. Somos un estudio enfocado en la comunicación asertiva y la creatividad."
};

export default function HomePage() {
  return (
    <>
      {/* Transparente sobre el hero a pantalla completa (blanco sobre imagen). */}
      <PublicHeader tone="dark" position="overlay" />
      <HomeLanding />
      <PublicFooter />
    </>
  );
}
