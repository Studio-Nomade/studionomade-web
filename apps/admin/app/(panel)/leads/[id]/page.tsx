import { requireAnyRole } from "@studionomade/auth";
import { LEAD_AREAS, LEAD_LABELS, LEAD_PRIORITIES, LEAD_STATUSES } from "@studionomade/validation";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "../../../../components/admin.module.css";
import { readAdminServerEnvironment } from "../../../../lib/env";
import { createAdminServerClient } from "../../../../lib/supabase-server";
import { deriveLeadToNoma, triageLead } from "../actions";

export const dynamic = "force-dynamic";

const dateTime = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Santiago"
});

const NOTICES: Record<string, { tone: "ok" | "error" | "info"; text: string }> = {
  guardado: { tone: "ok", text: "Clasificación guardada." },
  "sin-cambios": { tone: "info", text: "No había cambios que guardar." },
  invalido: {
    tone: "error",
    text: "Revisa la clasificación: un descarte necesita motivo y «derivado» se asigna con el botón de NOMA."
  },
  "no-encontrado": { tone: "error", text: "No encontramos el lead." },
  "ya-derivado": { tone: "info", text: "Este lead ya fue derivado a NOMA." },
  "no-elegible": { tone: "error", text: "Solo se derivan leads calificados con nombre y correo." },
  "noma-sin-configurar": {
    tone: "info",
    text: "La integración con NOMA aún no está configurada. Quedó registrado el intento; el lead sigue calificado."
  },
  "noma-error": { tone: "error", text: "NOMA no confirmó la derivación. Intenta de nuevo." },
  derivado: { tone: "ok", text: "Lead derivado a NOMA." },
  error: { tone: "error", text: "No pudimos guardar los cambios." }
};

const EVENT_LABELS: Record<string, string> = {
  creado: "Lead recibido",
  "estado.cambiado": "Cambio de estado",
  "clasificacion.actualizada": "Clasificación actualizada",
  "noma.enviado": "Enviado a NOMA",
  "noma.confirmado": "NOMA confirmó la derivación",
  "noma.error": "Error al derivar a NOMA",
  "noma.pendiente_configuracion": "Derivación pendiente (NOMA sin configurar)"
};

export default async function LeadDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
}) {
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const client = await createAdminServerClient();
  await requireAnyRole(
    client,
    readAdminServerEnvironment().allowlist,
    "superadmin",
    "admin",
    "commercial"
  );

  const [{ data: lead }, { data: events }] = await Promise.all([
    client.from("leads").select("*").eq("id", id).maybeSingle(),
    client
      .from("lead_events")
      .select("id,event_type,from_status,to_status,created_at,metadata")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
  ]);
  if (!lead) notFound();

  const notice = aviso ? NOTICES[aviso] : undefined;
  const list = (values: string[] | null, labels: Record<string, string>) =>
    values?.length ? values.map((value) => labels[value] ?? value).join(", ") : "—";

  const facts: Array<[string, string]> = [
    ["Recibido", dateTime.format(new Date(lead.created_at))],
    ["Correo", lead.email ?? "—"],
    ["Teléfono", lead.phone ?? "—"],
    ["Empresa / Marca", lead.company ?? "—"],
    ["Áreas de interés", list(lead.areas, LEAD_LABELS.area)],
    ["Necesidades", list(lead.needs, LEAD_LABELS.need)],
    ["Presupuesto", lead.budget_range ? LEAD_LABELS.budget[lead.budget_range] : "—"],
    ["Plazo", lead.timeline ? LEAD_LABELS.timeline[lead.timeline] : "—"],
    ["Cómo nos conoció", lead.source_channel ? LEAD_LABELS.source[lead.source_channel] : "—"],
    ["Etapa del proyecto", lead.project_stage ?? "—"],
    [
      "Origen",
      `${LEAD_LABELS.origin[lead.origin_type] ?? lead.origin_type} · ${lead.origin_slug ?? "—"}`
    ],
    [
      "Campaña",
      [lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ") || "—"
    ],
    [
      "Clics de anuncios",
      [lead.gclid && "Google", lead.fbclid && "Meta"].filter(Boolean).join(", ") || "—"
    ],
    ["Página de entrada", lead.landing_url ?? lead.landing_path ?? "—"],
    [
      "Consentimiento",
      lead.consent_given
        ? `Sí · ${lead.consent_version ?? ""} · ${lead.consent_at ? dateTime.format(new Date(lead.consent_at)) : ""}`
        : "No"
    ]
  ];

  return (
    <main>
      <header className={styles.pageHead}>
        <div>
          <p>
            <Link href="/leads">← Leads</Link>
          </p>
          <h1>{lead.name ?? "Sin nombre"}</h1>
          <p>
            <span className={styles.badge} data-status={lead.status}>
              {LEAD_LABELS.status[lead.status]}
            </span>{" "}
            {lead.priority ? (
              <span className={styles.badge} data-priority={lead.priority}>
                Prioridad {LEAD_LABELS.priority[lead.priority as keyof typeof LEAD_LABELS.priority]}
              </span>
            ) : null}
          </p>
        </div>
        {lead.email ? (
          <a className={styles.buttonGhost} href={`mailto:${lead.email}`}>
            Escribir correo
          </a>
        ) : null}
      </header>

      {notice ? (
        <p className={styles.notice} data-tone={notice.tone} role="status">
          {notice.text}
        </p>
      ) : null}

      <div className={styles.detail}>
        <div>
          <section className={styles.panel} aria-labelledby="lead-datos">
            <h2 id="lead-datos">Datos del contacto</h2>
            <dl className={styles.facts}>
              {facts.map(([term, value]) => (
                <div key={term} className={styles.factRow}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className={styles.panel} aria-labelledby="lead-mensaje">
            <h2 id="lead-mensaje">Mensaje</h2>
            <p className={styles.message}>{lead.message ?? "Sin mensaje."}</p>
          </section>
          <section className={styles.panel} aria-labelledby="lead-historial">
            <h2 id="lead-historial">Historial</h2>
            <ol className={styles.timeline}>
              {(events ?? []).map((event) => (
                <li key={event.id}>
                  <time dateTime={event.created_at}>
                    {dateTime.format(new Date(event.created_at))}
                  </time>
                  {EVENT_LABELS[event.event_type] ?? event.event_type}
                  {event.from_status && event.to_status && event.from_status !== event.to_status
                    ? ` · ${LEAD_LABELS.status[event.from_status]} → ${LEAD_LABELS.status[event.to_status]}`
                    : ""}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div>
          <section className={styles.panel} aria-labelledby="lead-clasificar">
            <h2 id="lead-clasificar">Clasificar</h2>
            {lead.status === "derivado" ? (
              <p className={styles.muted}>Derivado a NOMA: la gestión continúa allá.</p>
            ) : (
              <form action={triageLead}>
                <input type="hidden" name="lead_id" value={lead.id} />
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Estado</span>
                    <select name="status" defaultValue={lead.status}>
                      {LEAD_STATUSES.filter((status) => status !== "derivado").map((status) => (
                        <option key={status} value={status}>
                          {LEAD_LABELS.status[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>Prioridad</span>
                    <select name="priority" defaultValue={lead.priority ?? ""}>
                      <option value="">Sin definir</option>
                      {LEAD_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {LEAD_LABELS.priority[priority]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={`${styles.field} ${styles.wide}`}>
                    <span>Área que lo toma</span>
                    <select name="assigned_area" defaultValue={lead.assigned_area ?? ""}>
                      <option value="">Sin asignar</option>
                      {LEAD_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {LEAD_LABELS.area[area]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={`${styles.field} ${styles.wide}`}>
                    <span>Motivo de descarte</span>
                    <input name="discard_reason" defaultValue={lead.discard_reason ?? ""} />
                    <span className={styles.hint}>Obligatorio si el estado es Descartado.</span>
                  </label>
                  <label className={`${styles.field} ${styles.wide}`}>
                    <span>Notas internas</span>
                    <textarea name="notes" defaultValue={lead.notes ?? ""} />
                  </label>
                </div>
                <div className={styles.actions}>
                  <button type="submit" className={styles.button}>
                    Guardar clasificación
                  </button>
                </div>
              </form>
            )}
          </section>

          {lead.status === "calificado" ? (
            <section className={styles.panel} aria-labelledby="lead-noma">
              <h2 id="lead-noma">Derivar a NOMA</h2>
              <p className={styles.muted}>
                Envía el lead a NOMA como potencial cliente. Queda registrado y el estado pasa a
                «Derivado a NOMA».
              </p>
              <form action={deriveLeadToNoma}>
                <input type="hidden" name="lead_id" value={lead.id} />
                <button type="submit" className={styles.button}>
                  Derivar a NOMA
                </button>
              </form>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
