import type { AppIdentity } from "@studionomade/types";
import { Button, Eyebrow, Section } from "@studionomade/ui";
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
      <Section>
        <Eyebrow>{environment.NEXT_PUBLIC_APP_ENV}</Eyebrow>
        <h1>{app.name}</h1>
        <p>{app.description}. Sin autenticación ni contenido en M01.</p>
        <Button href="https://studionomade.cl">Volver al sitio</Button>
      </Section>
    </main>
  );
}
