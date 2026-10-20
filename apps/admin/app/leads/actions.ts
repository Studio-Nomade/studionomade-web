"use server";

import { requireAnyRole } from "@studionomade/auth";
import { deliverLeadToNoma } from "@studionomade/domain";
import { revalidatePath } from "next/cache";
import { readAdminServerEnvironment } from "../../lib/env";
import { createAdminServerClient } from "../../lib/supabase-server";

export async function deriveLeadToNoma(formData: FormData) {
  const leadId = String(formData.get("lead_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) return;
  const client = await createAdminServerClient();
  const { user } = await requireAnyRole(
    client,
    readAdminServerEnvironment().allowlist,
    "superadmin",
    "admin",
    "commercial"
  );
  if (
    process.env.NOMA_INTEGRATION_ENABLED !== "true" ||
    !process.env.NOMA_LEADS_ENDPOINT ||
    !process.env.NOMA_WEBHOOK_SECRET
  )
    throw new Error("La integración Noma no está configurada");
  const { data: lead, error } = await client
    .from("leads")
    .select("id,name,email,phone,company,origin_slug,status")
    .eq("id", leadId)
    .single();
  if (error || !lead || !lead.name || !lead.email || lead.status !== "calificado")
    throw new Error("Lead no elegible para derivación");
  await client.from("lead_events").insert({
    lead_id: lead.id,
    actor_id: user.id,
    event_type: "noma.enviado",
    from_status: lead.status,
    to_status: lead.status
  });
  try {
    await deliverLeadToNoma(
      {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        origin: lead.origin_slug ?? "admin"
      },
      { endpoint: process.env.NOMA_LEADS_ENDPOINT, secret: process.env.NOMA_WEBHOOK_SECRET }
    );
    const { error: updateError } = await client
      .from("leads")
      .update({ status: "derivado" })
      .eq("id", lead.id)
      .eq("status", "calificado");
    if (updateError) throw updateError;
    await client.from("lead_events").insert({
      lead_id: lead.id,
      actor_id: user.id,
      event_type: "noma.confirmado",
      from_status: "calificado",
      to_status: "derivado"
    });
  } catch {
    await client.from("lead_events").insert({
      lead_id: lead.id,
      actor_id: user.id,
      event_type: "noma.error",
      from_status: "calificado",
      to_status: "calificado"
    });
    throw new Error("Noma no confirmó la derivación");
  }
  revalidatePath("/leads");
}
