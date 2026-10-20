import type { Metadata } from "next";
import { ContactForm } from "../../components/public/contact-form";
import { PublicPage, publicStyles as styles } from "../../components/public/public-shell";
export const metadata: Metadata = {
  title: "Contacto | Studio Nomade",
  description: "Conversemos sobre tu proyecto.",
  alternates: { canonical: "/contacto" }
};
export default function ContactPage() {
  return (
    <PublicPage>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Conversemos</p>
          <h1 className={styles.display}>CONTACTO</h1>
        </div>
        <p className={styles.lead}>
          Cuéntanos qué tienes en mente. Buscaremos la mejor forma de trabajar en conjunto.
        </p>
      </section>
      <section className={styles.section}>
        <ContactForm />
      </section>
    </PublicPage>
  );
}
