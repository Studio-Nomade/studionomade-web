import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acceso denegado — Studio Nomade Admin",
  robots: { index: false, follow: false }
};

/**
 * Rechazo por allowlist. El mensaje es deliberadamente genérico: no confirma si
 * la cuenta existe, ni si el dominio es correcto, ni qué le faltaría para entrar.
 */
export default function AccesoDenegadoPage() {
  return (
    <main>
      <h1>Acceso denegado</h1>
      <p>Esta cuenta no tiene acceso al panel de Studio Nomade.</p>
      <p>Si crees que se trata de un error, escribe a contact@studionomade.cl.</p>
      <Link href="/login">Volver a intentar</Link>
    </main>
  );
}
