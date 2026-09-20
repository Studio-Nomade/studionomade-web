import { type createServiceDatabaseClient } from "@studionomade/database";

const MAXIMUM_SUBMISSIONS_PER_HOUR = 5;

export async function hasReachedLeadRateLimit(
  database: ReturnType<typeof createServiceDatabaseClient>,
  ipHash: string,
  now = new Date()
) {
  const since = new Date(now.getTime() - 60 * 60 * 1_000).toISOString();
  const { count, error } = await database
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .eq("submitter_ip_hash", ipHash)
    .gt("submitted_at", since);

  if (error) throw new Error("No fue posible verificar el límite de envíos");
  return (count ?? 0) >= MAXIMUM_SUBMISSIONS_PER_HOUR;
}

// Si el volumen aumenta, reemplazar este contador por una tabla de cuotas con actualización
// atómica. Para el volumen inicial evita sumar un proveedor y otro secreto al proyecto público.
