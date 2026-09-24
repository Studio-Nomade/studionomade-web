import { requirePermission } from "@studionomade/auth";
import { readAdminServerEnvironment } from "../../lib/env";
import { createAdminServerClient } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";
export default async function ProjectsAdminPage() {
  const client = await createAdminServerClient();
  await requirePermission(client, readAdminServerEnvironment().allowlist, "content.read");
  const { data, error } = await client
    .from("projects")
    .select("id,slug,title,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("No fue posible cargar proyectos");
  return (
    <main>
      <h1>Proyectos y medios</h1>
      <p>
        La publicación exige autorización registrada. Las escrituras permanecen sujetas a permisos y
        RLS.
      </p>
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Slug</th>
            <th>Estado</th>
            <th>Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.slug}</td>
              <td>{item.status}</td>
              <td>{item.updated_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
