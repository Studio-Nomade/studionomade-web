import type { AppIdentity } from "@studionomade/types";
import { readPublicEnvironment } from "@studionomade/validation";

const app: AppIdentity = {
  id: "admin",
  name: "Studio Nomade Admin",
  description: "Base técnica del CMS propio"
};

export default function HomePage() {
  const environment = readPublicEnvironment({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
  });

  return (
    <main>
      <section>
        <p>{environment.NEXT_PUBLIC_APP_ENV}</p>
        <h1>{app.name}</h1>
        <p>{app.description}. Sin autenticación ni contenido en M01.</p>
        <a href="https://studionomade.cl">Volver al sitio</a>
      </section>
    </main>
  );
}
