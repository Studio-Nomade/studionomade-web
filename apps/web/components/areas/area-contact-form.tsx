"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Checkbox } from "@studionomade/ui";
import { submitContactLead } from "../../app/actions";
import { UtmFields } from "../campaign/utm-fields";
import { ConsentLabel } from "../legal/consent-label";
import type { AreaSlug } from "../../content/areas";
import type { LeadConsentVersion } from "../../content/legal/consentimientos";
import { track } from "../../lib/analytics/track";
import styles from "./area-contact-form.module.css";

/**
 * Versión de consentimiento de las páginas de área: la vigente más reciente,
 * con enlace a la política de privacidad. Cambiarla es una decisión explícita.
 */
export const AREA_CONSENT_VERSION: LeadConsentVersion = "2026-10-v1";
/** Formulario de captura existente (`forms.slug`); el área viaja en `origin_slug`. */
export const AREA_FORM_SLUG = "contacto-general";

const EMPTY_UTM: Record<string, string | undefined> = {};

function FloatingField({
  name,
  label,
  type = "text",
  autoComplete,
  multiline,
  required,
  error,
  defaultValue
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
  required?: boolean;
  error?: string;
  defaultValue?: string;
}) {
  const id = `area-${name}`;
  const common = {
    id,
    name,
    required,
    defaultValue,
    // Un espacio: `:placeholder-shown` sostiene la etiqueta flotante sin JS.
    placeholder: " ",
    "aria-required": required || undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined
  };
  return (
    <div className={styles.field} data-wide={multiline || undefined}>
      {multiline ? (
        <textarea {...common} rows={6} maxLength={2000} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} />
      )}
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {error ? (
        <span id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submit} disabled={pending} data-cursor-magnetic="">
      <span>{pending ? "Enviando…" : "Enviar mensaje"}</span>
      <svg viewBox="0 0 56 16" aria-hidden="true" focusable="false">
        <path d="M0 8h54M47 1l7 7-7 7" />
      </svg>
    </button>
  );
}

/**
 * Formulario "Contáctanos" de las páginas de área (Figma `8:441` / `2:203`).
 *
 * Reutiliza la captura de leads del sitio: el Server Action `submitContactLead`,
 * la firma anti-spam de `/api/contacto/token`, el honeypot y el consentimiento
 * versionado. El área queda registrada como `origin_type=area` y
 * `origin_slug=<área>`.
 */
export function AreaContactForm({ slug }: { slug: AreaSlug }) {
  const [state, action] = useActionState(submitContactLead, null);
  const [token, setToken] = useState({ t: "", signature: "" });
  const trackedLead = useRef<string | null>(null);
  const failed = state?.success === false ? state : undefined;
  const error = (name: string) => failed?.fieldErrors?.[name]?.[0];
  const value = (name: string) => failed?.values?.[name];

  useEffect(() => {
    let active = true;
    fetch("/api/contacto/token", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { t?: string; signature?: string } | null) => {
        if (active && data?.t && data.signature) setToken({ t: data.t, signature: data.signature });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      // Sin leadId es el honeypot: no cuenta como conversión.
      if (!state.leadId || trackedLead.current === state.leadId) return;
      trackedLead.current = state.leadId;
      track("form_submit", {
        status: "success",
        form: AREA_FORM_SLUG,
        origin: slug,
        event_id: state.leadId
      });
      return;
    }
    track("form_submit", { status: "error", form: AREA_FORM_SLUG, origin: slug });
  }, [state, slug]);

  if (state?.success) {
    return (
      <p className={styles.success} role="status">
        Gracias por escribirnos. Te contactaremos pronto.
      </p>
    );
  }

  return (
    <form action={action} className={styles.form} noValidate>
      <FloatingField
        name="name"
        label="Tu Nombre"
        autoComplete="name"
        required
        error={error("name")}
        defaultValue={value("name")}
      />
      <FloatingField
        name="email"
        label="Tu E-mail"
        type="email"
        autoComplete="email"
        required
        error={error("email")}
        defaultValue={value("email")}
      />
      <FloatingField
        name="message"
        label="Mensaje"
        multiline
        error={error("message")}
        defaultValue={value("message")}
      />
      <div className={styles.consent}>
        <Checkbox
          required
          label={<ConsentLabel version={AREA_CONSENT_VERSION} />}
          name="consentimiento"
          defaultChecked={value("consentimiento") === "on"}
          error={error("consentimiento")}
        />
      </div>
      <input
        type="text"
        name="empresa_web"
        className={styles.honeypot}
        aria-label="Empresa web"
        tabIndex={-1}
        autoComplete="off"
      />
      <input type="hidden" name="form_slug" value={AREA_FORM_SLUG} />
      <input type="hidden" name="consent_version" value={AREA_CONSENT_VERSION} />
      <input type="hidden" name="origin_type" value="area" />
      <input type="hidden" name="origin_slug" value={slug} />
      <input type="hidden" name="source_path" value={`/areas/${slug}`} />
      <input type="hidden" name="t" value={token.t} />
      <input type="hidden" name="t_signature" value={token.signature} />
      <UtmFields initial={EMPTY_UTM} />
      {failed ? (
        <p className={styles.formError} role="alert">
          {failed.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
