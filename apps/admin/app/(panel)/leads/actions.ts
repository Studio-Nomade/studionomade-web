"use server";

import { requireAnyRole } from "@studionomade/auth";
import { deliverLeadToNoma } from "@studionomade/domain";
import { leadTriageSchema } from "@studionomade/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readAdminServerEnvironment } from "../../../lib/env";
import { createAdminServerClient } from "../../../lib/supabase-server";

const UUID = /^[0-9a-f-]{36}$/i;

async function leadManager() {
  const client = await createAdminServerClient();
  const { user } = await requireAnyRole(
    client,
    readAdminServerEnvironment().allowlist,
    "superadmin",
    "admin",
    "commercial"
  );
  return { client, user };
}

const back = (leadId: string, aviso: string) => redirect(`/leads/${leadId}?aviso=${aviso}`);

/**
 * Clasifica un lead: estado, prioridad, área que lo toma, notas internas y
 * motivo de descarte. Registra en `lead_events` qué cambió y quién lo cambió.
 */
export async function triageLead(formData: FormData) {
  const parsed = leadTriageSchema.safeParse(Object.fromEntries(formData));
  const leadId = String(formData.get("lead_id") ?? "");
  if (!UUID.test(leadId)) return;
  if (!parsed.success) back(leadId, "invalido");
  const input = parsed.data!;

  const { client, user } = await leadManager();
  const { data: lead, error } = await client
    .from("leads")
    .select("id,status,priority,assigned_area,notes,discard_reason")
    .eq("id", input.lead_id)
    .single();
  if (error || !lead) back(leadId, "no-encontrado");
  if (lead!.status === "derivado") back(leadId, "ya-derivado");

  const changes = {
    status: input.status,
    priority: input.priority,
    assigned_area: input.assigned_area,
    notes: input.notes,
    discard_reason: input.status === "descartado" ? input.discard_reason : null
  };
  const changed = Object.entries(changes).filter(
    ([key, value]) => (lead as Record<string, unknown>)[key] !== value
  );
  if (changed.length === 0) back(leadId, "sin-cambios");

  const { error: updateError } = await client.from("leads").update(changes).eq("id", lead!.id);
  if (updateError) back(leadId, "error");

  await client.from("lead_events").insert({
    lead_id: lead!.id,
    actor_id: user.id,
    event_type: lead!.status !== input.status ? "estado.cambiado" : "clasificacion.actualizada",
    from_status: lead!.status,
    to_status: input.status,
    metadata: Object.fromEntries(
      changed.map(([key]) => [
        key,
        key === "notes" ? "editadas" : changes[key as keyof typeof changes]
      ])
    )
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${lead!.id}`);
  back(leadId, "guardado");
}

/**
 * Deriva a NOMA un lead calificado: lo envía firmado (HMAC) al endpoint de
 * NOMA y lo deja como "derivado". Si la integración aún no está configurada,
 * no cambia el estado y lo informa en la ficha.
 */
export async function deriveLeadToNoma(formData: FormData) {
  const leadId = String(formData.get("lead_id") ?? "");
  if (!UUID.test(leadId)) return;
  const { client, user } = await leadManager();

  const { data: lead, error } = await client
    .from("leads")
    .select("id,name,email,phone,company,origin_slug,status")
    .eq("id", leadId)
    .single();
  if (error || !lead) back(leadId, "no-encontrado");
  if (!lead!.name || !lead!.email || lead!.status !== "calificado") back(leadId, "no-elegible");

  const endpoint = process.env.NOMA_LEADS_ENDPOINT;
  const secret = process.env.NOMA_WEBHOOK_SECRET;
  if (process.env.NOMA_INTEGRATION_ENABLED !== "true" || !endpoint || !secret) {
    await client.from("lead_events").insert({
      lead_id: lead!.id,
      actor_id: user.id,
      event_type: "noma.pendiente_configuracion",
      from_status: lead!.status,
      to_status: lead!.status
    });
    back(leadId, "noma-sin-configurar");
  }

  await client.from("lead_events").insert({
    lead_id: lead!.id,
    actor_id: user.id,
    event_type: "noma.enviado",
    from_status: lead!.status,
    to_status: lead!.status
  });
  let delivered = false;
  try {
    await deliverLeadToNoma(
      {
        id: lead!.id,
        name: lead!.name!,
        email: lead!.email!,
        phone: lead!.phone,
        company: lead!.company,
        origin: lead!.origin_slug ?? "admin"
      },
      { endpoint: endpoint!, secret: secret! }
    );
    delivered = true;
  } catch {
    await client.from("lead_events").insert({
      lead_id: lead!.id,
      actor_id: user.id,
      event_type: "noma.error",
      from_status: "calificado",
      to_status: "calificado"
    });
  }
  if (!delivered) back(leadId, "noma-error");

  await client
    .from("leads")
    .update({ status: "derivado" })
    .eq("id", lead!.id)
    .eq("status", "calificado");
  await client.from("lead_events").insert({
    lead_id: lead!.id,
    actor_id: user.id,
    event_type: "noma.confirmado",
    from_status: "calificado",
    to_status: "derivado"
  });
  revalidatePath("/leads");
  back(leadId, "derivado");
}
