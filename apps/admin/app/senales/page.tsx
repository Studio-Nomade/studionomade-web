import { requireAnyRole } from "@studionomade/auth";
import { readAdminServerEnvironment } from "../../lib/env";
import { createAdminServerClient } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";
export default async function SignalsPage() {
  const client = await createAdminServerClient();
  await requireAnyRole(
    client,
    readAdminServerEnvironment().allowlist,
    "superadmin",
    "admin",
    "analyst"
  );
  const [{ count: leadCount }, { count: projectCount }] = await Promise.all([
    client.from("leads").select("id", { count: "exact", head: true }),
    client.from("projects").select("id", { count: "exact", head: true })
  ]);
  return (
    <main>
      <h1>Señales operativas</h1>
      <p>
        Panel mínimo sin PII. El proveedor de tracking/error tracking sigue pendiente de aprobación.
      </p>
      <dl>
        <dt>Leads registrados</dt>
        <dd>{leadCount ?? "Sin datos"}</dd>
        <dt>Proyectos</dt>
        <dd>{projectCount ?? "Sin datos"}</dd>
        <dt>Tracker externo</dt>
        <dd>No configurado</dd>
      </dl>
    </main>
  );
}
