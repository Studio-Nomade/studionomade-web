import type { Metadata } from "next";
import { PublicPage, publicStyles as styles } from "../../components/public/public-shell";
export const metadata: Metadata = {
  title: "Términos | Studio Nomade",
  alternates: { canonical: "/terminos" }
};
export default function TermsPage() {
  return (
    <PublicPage>
      <article className={styles.legal}>
        <h1>Términos de uso</h1>
        <p>
          El contenido de este sitio pertenece a Studio Nomade o se utiliza con autorización. Los
          casos y materiales se presentan con fines informativos.
        </p>
        <h2>Disponibilidad</h2>
        <p>
          El sitio puede cambiar o interrumpirse por mantenimiento sin que ello cree obligaciones
          adicionales.
        </p>
        <h2>Contacto</h2>
        <p>Para consultas sobre estos términos escribe a contact@studionomade.cl.</p>
      </article>
    </PublicPage>
  );
}
