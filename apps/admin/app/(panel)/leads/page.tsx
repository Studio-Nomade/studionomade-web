import { requireAnyRole } from "@studionomade/auth";
import {
  LEAD_AREAS,
  LEAD_BUDGET_RANGES,
  LEAD_LABELS,
  LEAD_ORIGINS,
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  parseLeadFilters,
  type LeadFilters
} from "@studionomade/validation";
import Link from "next/link";

import styles from "../../../components/admin.module.css";
import { readAdminServerEnvironment } from "../../../lib/env";
import { createAdminServerClient } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const dateTime = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Santiago"
});

function filterHref(filters: LeadFilters, changes: Partial<LeadFilters>) {
  const merged = { ...filters, ...changes };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "pagina" && value === 1) continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `/leads?${qs}` : "/leads";
}

/**
 * Bandeja de leads: todos los formularios del sitio llegan aquí como "nuevo".
 * Se revisan, se clasifican (estado, prioridad, área) y los calificados se
 * derivan a NOMA desde el detalle.
 */
export default async function LeadsAdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const client = await createAdminServerClient();
  await requireAnyRole(
    client,
    readAdminServerEnvironment().allowlist,
    "superadmin",
    "admin",
    "commercial"
  );
  const filters = parseLeadFilters(await searchParams);

  let query = client
    .from("leads")
    .select(
      "id,created_at,status,priority,assigned_area,name,email,company,areas,needs,budget_range,timeline,origin_type,origin_slug,utm_campaign",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });
  if (filters.estado) query = query.eq("status", filters.estado);
  if (filters.origen) query = query.eq("origin_type", filters.origen);
  if (filters.area) query = query.contains("areas", [filters.area]);
  if (filters.presupuesto) query = query.eq("budget_range", filters.presupuesto);
  if (filters.prioridad) query = query.eq("priority", filters.prioridad);
  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ").trim();
    if (term)
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
  }
  const from = (filters.pagina - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible cargar los leads");

  const statusCounts = await Promise.all(
    LEAD_STATUSES.map(async (status) => {
      const { count: total } = await client
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      return [status, total ?? 0] as const;
    })
  );
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <main>
      <header className={styles.pageHead}>
        <div>
          <h1>Leads</h1>
          <p>
            Recibe, revisa y clasifica los contactos del sitio. Los calificados se derivan a NOMA
            desde su ficha.
          </p>
        </div>
      </header>

      <nav className={styles.counters} aria-label="Leads por estado">
        <Link
          href={filterHref(filters, { estado: undefined, pagina: 1 })}
          aria-current={!filters.estado}
        >
          Todos
        </Link>
        {statusCounts.map(([status, total]) => (
          <Link
            key={status}
            href={filterHref(filters, { estado: status, pagina: 1 })}
            aria-current={filters.estado === status}
          >
            {LEAD_LABELS.status[status]} <strong>{total}</strong>
          </Link>
        ))}
      </nav>

      <form className={styles.filters} method="get" role="search" aria-label="Filtrar leads">
        {filters.estado ? <input type="hidden" name="estado" value={filters.estado} /> : null}
        <label className={styles.field}>
          <span>Buscar</span>
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Nombre, empresa o correo"
          />
        </label>
        <label className={styles.field}>
          <span>Origen</span>
          <select name="origen" defaultValue={filters.origen ?? ""}>
            <option value="">Todos</option>
            {LEAD_ORIGINS.map((origin) => (
              <option key={origin} value={origin}>
                {LEAD_LABELS.origin[origin]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Área de interés</span>
          <select name="area" defaultValue={filters.area ?? ""}>
            <option value="">Todas</option>
            {LEAD_AREAS.map((area) => (
              <option key={area} value={area}>
                {LEAD_LABELS.area[area]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Presupuesto</span>
          <select name="presupuesto" defaultValue={filters.presupuesto ?? ""}>
            <option value="">Todos</option>
            {LEAD_BUDGET_RANGES.map((budget) => (
              <option key={budget} value={budget}>
                {LEAD_LABELS.budget[budget]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Prioridad</span>
          <select name="prioridad" defaultValue={filters.prioridad ?? ""}>
            <option value="">Todas</option>
            {LEAD_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {LEAD_LABELS.priority[priority]}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.actions}>
          <button type="submit" className={styles.button}>
            Filtrar
          </button>
          <Link href="/leads" className={styles.buttonGhost}>
            Limpiar
          </Link>
        </div>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Contacto</th>
              <th scope="col">Empresa</th>
              <th scope="col">Interés</th>
              <th scope="col">Presupuesto · Plazo</th>
              <th scope="col">Origen</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.muted}>
                  No hay leads con estos filtros.
                </td>
              </tr>
            ) : (
              data.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <time dateTime={lead.created_at}>
                      {dateTime.format(new Date(lead.created_at))}
                    </time>
                  </td>
                  <td>
                    <Link href={`/leads/${lead.id}`}>{lead.name ?? "Sin nombre"}</Link>
                    <br />
                    <span className={styles.muted}>{lead.email ?? "—"}</span>
                  </td>
                  <td>{lead.company ?? "—"}</td>
                  <td>
                    {(lead.areas ?? [])
                      .map(
                        (area) => LEAD_LABELS.area[area as keyof typeof LEAD_LABELS.area] ?? area
                      )
                      .join(", ") || "—"}
                    {lead.needs?.length ? (
                      <>
                        <br />
                        <span className={styles.muted}>
                          {lead.needs.map((need) => LEAD_LABELS.need[need] ?? need).join(", ")}
                        </span>
                      </>
                    ) : null}
                  </td>
                  <td>
                    {lead.budget_range ? LEAD_LABELS.budget[lead.budget_range] : "—"}
                    <br />
                    <span className={styles.muted}>
                      {lead.timeline ? LEAD_LABELS.timeline[lead.timeline] : ""}
                    </span>
                  </td>
                  <td>
                    {LEAD_LABELS.origin[lead.origin_type] ?? lead.origin_type}
                    <br />
                    <span className={styles.muted}>
                      {lead.utm_campaign ?? lead.origin_slug ?? ""}
                    </span>
                  </td>
                  <td>
                    <span className={styles.badge} data-status={lead.status}>
                      {LEAD_LABELS.status[lead.status]}
                    </span>
                    {lead.priority ? (
                      <>
                        {" "}
                        <span className={styles.badge} data-priority={lead.priority}>
                          {LEAD_LABELS.priority[lead.priority as keyof typeof LEAD_LABELS.priority]}
                        </span>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className={styles.pagination} aria-label="Páginas">
          {filters.pagina > 1 ? (
            <Link href={filterHref(filters, { pagina: filters.pagina - 1 })}>← Más recientes</Link>
          ) : (
            <span />
          )}
          <span>
            Página {filters.pagina} de {pages} · {count} leads
          </span>
          {filters.pagina < pages ? (
            <Link href={filterHref(filters, { pagina: filters.pagina + 1 })}>Más antiguos →</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}
