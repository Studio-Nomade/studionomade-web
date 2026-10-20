import "server-only";

import { cookies, headers } from "next/headers";

import { resolveMetaBrowserIds } from "./meta-ids";
import type { LeadRequestMetadata } from "./submit-lead";

interface PrepareLeadRequestOptions {
  /**
   * Si el formulario no trae `referrer` propio, usar la cabecera `Referer` del
   * POST. Ojo: en un Server Action esa cabecera es la página del formulario, no
   * el origen del visitante; los formularios de campaña envían el referrer de
   * primer contacto y desactivan este respaldo.
   */
  referrerFromHeader: boolean;
}

/**
 * Completa el `FormData` con lo que solo conoce el servidor (cookies `_fbp` y
 * `_fbc`, `Referer`) y devuelve los metadatos de la petición.
 */
export async function prepareLeadRequest(
  formData: FormData,
  { referrerFromHeader }: PrepareLeadRequestOptions
): Promise<LeadRequestMetadata> {
  const [requestHeaders, cookieStore] = await Promise.all([headers(), cookies()]);
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

  const formReferrer = String(formData.get("referrer") ?? "").trim();
  formData.set(
    "referrer",
    formReferrer || (referrerFromHeader ? (requestHeaders.get("referer") ?? "") : "")
  );

  const { fbp, fbc } = resolveMetaBrowserIds({
    cookieFbp: cookieStore.get("_fbp")?.value,
    cookieFbc: cookieStore.get("_fbc")?.value,
    fbclid: String(formData.get("fbclid") ?? ""),
    now: Date.now()
  });
  formData.set("fbp", fbp ?? "");
  formData.set("fbc", fbc ?? "");

  return {
    ipAddress: forwarded || requestHeaders.get("x-real-ip") || "127.0.0.1",
    userAgent: requestHeaders.get("user-agent") ?? undefined
  };
}
