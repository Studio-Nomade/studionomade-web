import type { AppIdentity } from "@studionomade/types";
import { Button, Container, Link } from "@studionomade/ui";
import { readPublicEnvironment } from "@studionomade/validation";

const app: AppIdentity = {
  id: "web",
  name: "Studio Nomade",
  description: "Sitio público y Digital Lab"
};

export default function HomePage() {
  const environment = readPublicEnvironment({
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  });

  return (
    <main>
      <Container>
        <p className="eyebrow">{environment.NEXT_PUBLIC_APP_ENV}</p>
        <h1>{app.name}</h1>
        <p>{app.description}. Fundación pública lista para continuar.</p>
        <div className="actions">
          <Button disabled>Próximamente</Button>
          <Link href="/lab">Digital Lab</Link>
        </div>
      </Container>
    </main>
  );
}
