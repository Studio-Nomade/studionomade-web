import type { Metadata } from "next";
import { PublicPage, publicStyles as styles } from "../../components/public/public-shell";

export const metadata: Metadata = {
  title: "Privacidad | Studio Nomade",
  alternates: { canonical: "/privacidad" }
};

/*
 * REVISIÓN LEGAL PENDIENTE (2026-10): contenido base redactado para enlazar el
 * consentimiento 2026-10-v1 y declarar el píxel de Meta. Debe validarlo
 * asesoría legal antes de invertir en campañas, incluida la adecuación a la
 * Ley 21.719 cuando entre en vigencia. Cambios de fondo en las finalidades
 * exigen una versión nueva en content/legal/consentimientos.ts.
 */
export default function PrivacyPage() {
  return (
    <PublicPage>
      <article className={styles.legal}>
        <h1>Política de privacidad</h1>
        <p>Última actualización: 20 de octubre de 2026.</p>

        <h2>Responsable</h2>
        <p>
          Studio Nomade SpA (en adelante, Studio Nomade) es responsable del tratamiento de los datos
          personales recogidos en este sitio. Puedes escribirnos a{" "}
          <a href="mailto:contact@studionomade.cl">contact@studionomade.cl</a>.
        </p>

        <h2>Qué datos tratamos</h2>
        <ul>
          <li>
            Los que nos entregas en los formularios: nombre, email, teléfono, nombre y etapa de tu
            proyecto o empresa, y tu mensaje.
          </li>
          <li>
            Datos técnicos de la visita: página de llegada, sitio de procedencia, parámetros de
            campaña (UTM), identificadores de clic de anuncios (gclid de Google, fbclid de Meta),
            identificadores de navegador de Meta (cookies _fbp y _fbc), navegador utilizado y una
            huella no reversible de tu dirección IP para prevenir abuso.
          </li>
        </ul>
        <p>No vendemos datos personales.</p>

        <h2>Para qué los usamos</h2>
        <ul>
          <li>Responder tu solicitud y coordinar una conversación.</li>
          <li>Contactarte sobre nuestros servicios, si lo autorizaste en el formulario.</li>
          <li>
            Medir qué campañas y anuncios generan contactos, para invertir mejor en publicidad.
          </li>
        </ul>
        <p>
          La base del tratamiento es tu consentimiento, conforme a la Ley 19.628 sobre protección de
          la vida privada. Puedes retirarlo en cualquier momento escribiéndonos.
        </p>

        <h2>Medición y píxel de Meta</h2>
        <p>
          Usamos el píxel de Meta (Facebook e Instagram) para medir visitas, clics en botones de
          contacto y envíos de formulario, y para mostrar anuncios relevantes. El píxel puede usar
          cookies propias del sitio. Nunca le enviamos tu nombre, email, teléfono ni mensaje. Si tu
          navegador envía la señal «Do Not Track» o «Global Privacy Control», el píxel no se carga.
          También puedes bloquear cookies de terceros desde la configuración de tu navegador o
          revisar tus preferencias de anuncios en Meta.
        </p>

        <h2>Con quién los compartimos</h2>
        <p>
          Con proveedores que nos prestan servicios de alojamiento, base de datos, correo y medición
          publicitaria, solo en lo necesario para esas finalidades y bajo sus propias condiciones de
          seguridad. No cedemos tus datos a terceros para fines propios de ellos.
        </p>

        <h2>Conservación</h2>
        <p>
          Conservamos los datos solo durante el tiempo necesario para las finalidades descritas o el
          que exija la ley. Después los eliminamos o anonimizamos.
        </p>

        <h2>Tus derechos</h2>
        <p>
          Según la Ley 19.628 puedes solicitar acceso, rectificación, cancelación (eliminación) y
          oposición al tratamiento de tus datos. Escríbenos a{" "}
          <a href="mailto:contact@studionomade.cl">contact@studionomade.cl</a> indicando tu
          solicitud; te responderemos dentro de los plazos legales.
        </p>

        <h2>Cambios</h2>
        <p>
          Si cambiamos esta política publicaremos la nueva versión en esta página. Si el cambio
          afecta las finalidades que aceptaste, te pediremos un consentimiento nuevo.
        </p>
      </article>
    </PublicPage>
  );
}
