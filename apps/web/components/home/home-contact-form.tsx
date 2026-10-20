"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Checkbox, Field, SubmitRow, TextArea } from "@studionomade/ui";
import { submitContactLead } from "../../app/actions";
import { UtmFields } from "../campaign/utm-fields";
import { ConsentLabel } from "../legal/consent-label";
import { HOME_CONTACT_CONSENT_VERSION } from "../../content/home";
import { track } from "../../lib/analytics/track";
import styles from "./home-landing.module.css";

const FORM_SLUG = "contacto-general";
const NO_UTM: Record<string, string | undefined> = {};

/** Campos técnicos: un error en ellos no es algo que la persona pueda corregir. */
const TECHNICAL_FIELDS = ["t", "t_signature", "source_path", "form_slug", "origin_type"];

/**
 * Mensaje general en español. Si el único fallo es técnico (p. ej. el token
 * anti-spam no llegó), "Revisa los campos indicados" no indicaría ninguno.
 */
export function formErrorMessage(
  message: string,
  fieldErrors: Record<string, string[] | undefined> = {}
): string {
  const fields = Object.keys(fieldErrors).filter((field) => fieldErrors[field]?.length);
  if (fields.length > 0 && fields.every((field) => TECHNICAL_FIELDS.includes(field))) {
    return "No fue posible validar el envío. Recarga la página e intenta nuevamente.";
  }
  return message;
}

/**
 * Formulario de contacto de la home (captura de leads).
 *
 * La página es estática: el timestamp anti-spam firmado se pide al montar. Los
 * errores vienen del schema compartido (en español) y se enlazan a cada campo
 * con `aria-describedby`; lo escrito se repone tras un error.
 */
export function HomeContactForm() {
  const [state, action] = useActionState(submitContactLead, null);
  const [token, setToken] = useState<{ t: string; signature: string } | null>(null);
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
      // Sin leadId es el honeypot: no se cuenta como conversión.
      if (!state.leadId || trackedLead.current === state.leadId) return;
      trackedLead.current = state.leadId;
      track("form_submit", {
        status: "success",
        form: FORM_SLUG,
        origin: "home",
        event_id: state.leadId
      });
      return;
    }
    track("form_submit", { status: "error", form: FORM_SLUG, origin: "home" });
  }, [state]);

  if (state?.success) {
    return (
      <p className={styles.formSuccess} role="status">
        Gracias por escribirnos. Te contactaremos pronto.
      </p>
    );
  }

  return (
    <form action={action} className={styles.form} noValidate>
      <Field
        required
        label="Nombre y apellido"
        name="name"
        defaultValue={value("name")}
        error={error("name")}
      />
      <Field
        required
        label="Correo"
        name="email"
        type="email"
        defaultValue={value("email")}
        error={error("email")}
      />
      <Field
        label="Teléfono"
        name="phone"
        type="tel"
        defaultValue={value("phone")}
        error={error("phone")}
      />
      <Field
        label="Empresa"
        name="company"
        defaultValue={value("company")}
        error={error("company")}
      />
      <div className={styles.formWide}>
        <TextArea
          label="Cuéntanos sobre tu proyecto"
          name="message"
          rows={4}
          defaultValue={value("message")}
          error={error("message")}
        />
      </div>
      <div className={styles.formWide}>
        <Checkbox
          required
          label={<ConsentLabel version={HOME_CONTACT_CONSENT_VERSION} />}
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
      <input type="hidden" name="form_slug" value={FORM_SLUG} />
      <input type="hidden" name="consent_version" value={HOME_CONTACT_CONSENT_VERSION} />
      <input type="hidden" name="origin_type" value="contacto" />
      <input type="hidden" name="origin_slug" value="home" />
      <input type="hidden" name="source_path" value="/" />
      <input type="hidden" name="t" value={token?.t ?? ""} />
      <input type="hidden" name="t_signature" value={token?.signature ?? ""} />
      <UtmFields initial={NO_UTM} />
      <div className={styles.formWide}>
        {failed && (
          <p className={styles.formError} role="alert">
            {formErrorMessage(failed.message, failed.fieldErrors)}
          </p>
        )}
        <SubmitRow
          variant="solid"
          label="Enviar mensaje"
          pendingLabel="Enviando…"
          note="Responderemos a la brevedad."
        />
      </div>
    </form>
  );
}
