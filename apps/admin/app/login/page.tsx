import type { Metadata } from "next";

import { signInWithGoogle } from "./actions";

export const metadata: Metadata = {
  title: "Acceder — Studio Nomade Admin",
  robots: { index: false, follow: false }
};

const MESSAGES: Record<string, string> = {
  oauth: "No se pudo completar el acceso con Google. Inténtalo de nuevo.",
  config: "El panel no está configurado correctamente. Avisa al equipo técnico."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const message = error ? (MESSAGES[error] ?? MESSAGES.oauth) : null;

  return (
    <main>
      <h1>Studio Nomade</h1>
      <p>Panel de administración. El acceso está restringido al equipo.</p>

      {message ? <p role="alert">{message}</p> : null}

      <form action={signInWithGoogle}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <button type="submit">Entrar con Google</button>
      </form>
    </main>
  );
}
