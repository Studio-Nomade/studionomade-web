import { requireAnyRole } from "@studionomade/auth";
import { readAdminServerEnvironment } from "../../lib/env";
import { createAdminServerClient } from "../../lib/supabase-server";
import { deriveLeadToNoma } from "./actions";

export const dynamic = "force-dynamic";
export default async function LeadsAdminPage() {
  const client = await createAdminServerClient();
  await requireAnyRole(
    client,
    readAdminServerEnvironment().allowlist,
    "superadmin",
    "admin",
    "commercial"
  );
  const { data, error } = await client
    .from("leads")
    .select("id,created_at,status,name,email,company,origin_type,origin_slug")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("No fue posible cargar leads");
  return (
    <main>
      <h1>Leads</h1>
      <p>Vista protegida por sesión, allowlist, rol y RLS. No se exponen datos en telemetría.</p>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Contacto</th>
            <th>Empresa</th>
            <th>Origen</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {data.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.created_at}</td>
              <td>
                {lead.name}
                <br />
                {lead.email}
              </td>
              <td>{lead.company ?? "—"}</td>
              <td>
                {lead.origin_type ?? "—"} / {lead.origin_slug ?? "—"}
              </td>
              <td>{lead.status}</td>
              <td>
                {lead.status === "calificado" ? (
                  <form action={deriveLeadToNoma}>
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <button type="submit">Derivar a Noma</button>
                  </form>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
