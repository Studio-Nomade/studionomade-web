import type { Metadata } from "next";
import { PublicPage, publicStyles as styles } from "../../components/public/public-shell";
export const metadata: Metadata = {
  title: "Privacidad | Studio Nomade",
  alternates: { canonical: "/privacidad" }
};
export default function PrivacyPage() {
  return (
    <PublicPage>
      <article className={styles.legal}>
        <h1>Política de privacidad</h1>
        <p>
          Tratamos únicamente los datos necesarios para responder solicitudes y gestionar relaciones
          comerciales. No vendemos datos personales.
        </p>
        <h2>Finalidad y conservación</h2>
        <p>
          Los datos enviados mediante formularios se utilizan para contacto comercial y se conservan
          solo durante el tiempo necesario o exigido legalmente.
        </p>
        <h2>Derechos</h2>
        <p>
          Puedes solicitar acceso, rectificación o eliminación escribiendo a
          contact@studionomade.cl.
        </p>
      </article>
    </PublicPage>
  );
}
