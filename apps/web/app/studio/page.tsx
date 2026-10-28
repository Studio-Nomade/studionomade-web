import type { Metadata } from "next";
import { PublicPage, publicStyles as styles } from "../../components/public/public-shell";

export const metadata: Metadata = {
  title: "Studio | Studio Nomade",
  alternates: { canonical: "/studio" }
};

export default function StudioPage() {
  return (
    <PublicPage>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Quiénes somos</p>
          <h1 className={styles.display}>MOVEMENT</h1>
        </div>
        <p className={styles.lead}>
          Somos un estudio enfocado en la comunicación asertiva y la creatividad. Trabajamos junto a
          personas que buscan convertir ideas en respuestas e identidades auténticas.
        </p>
      </section>
      <section className={styles.section}>
        <h2>Nos movemos en manada</h2>
        <p>
          Un equipo multidisciplinario entre Santiago y Madrid que integra estrategia, diseño,
          comunicación, tecnología y espacio.
        </p>
      </section>
    </PublicPage>
  );
}
