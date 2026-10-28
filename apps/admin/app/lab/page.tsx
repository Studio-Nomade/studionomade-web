import { requirePermission } from "@studionomade/auth";
import { readAdminServerEnvironment } from "../../lib/env";
import { createAdminServerClient } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";
export default async function LabAdminPage() {
  const client = await createAdminServerClient();
  await requirePermission(client, readAdminServerEnvironment().allowlist, "content.read");
  const { data, error } = await client
    .from("prototypes")
    .select("id,slug,title,status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("No fue posible cargar prototipos");
  return (
    <main>
      <h1>Digital Lab</h1>
      <p>
        Inventario CMS; la publicación SFTP se prepara fuera del navegador y requiere credenciales
        externas.
      </p>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {item.title} · {item.slug} · {item.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
