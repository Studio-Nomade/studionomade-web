"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { Checkbox } from "@studionomade/ui";

import { submitQualifiedContactLead } from "../../app/actions";
import {
  AREA_OPTIONS,
  BUDGET_OPTIONS,
  CONTACT_CONSENT_VERSION,
  CONTACT_FORM_SLUG,
  DIRECT_CONTACTS,
  NEED_OPTIONS,
  SOURCE_OPTIONS,
  TIMELINE_OPTIONS,
  type ChoiceOption
} from "../../content/contact";
import { track } from "../../lib/analytics/track";
import { splitEchoedValues } from "../../lib/leads/echo-values";
import { UtmFields } from "../campaign/utm-fields";
import { ConsentLabel } from "../legal/consent-label";
import { CONTACT_FIELD_ORDER, validateContactForm } from "./validate-contact-form";
import styles from "./contact-lead-form.module.css";

const EMPTY_UTM: Record<string, string | undefined> = {};
const GENERAL_EMAIL = DIRECT_CONTACTS.find((contact) => contact.id === "general")!;
const WHATSAPP = DIRECT_CONTACTS.find((contact) => contact.id === "whatsapp")!;

function TextField({
  name,
  label,
  type = "text",
  autoComplete,
  inputMode,
  multiline,
  required,
  optional,
  error,
  defaultValue
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "text";
  multiline?: boolean;
  required?: boolean;
  optional?: boolean;
  error?: string;
  defaultValue?: string;
}) {
  const id = `contacto-${name}`;
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
        <textarea {...common} rows={5} maxLength={2000} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} inputMode={inputMode} />
      )}
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
        {optional ? <span className={styles.optional}> (opcional)</span> : null}
      </label>
      {error ? (
        <span id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Grupo de opciones como "chips": casillas (selección múltiple) o radios (una
 * sola). Son inputs nativos dentro de un `fieldset`, así que funcionan sin JS.
 */
function ChoiceGroup<Value extends string>({
  name,
  legend,
  hint,
  options,
  multiple,
  required,
  error,
  selected
}: {
  name: string;
  legend: string;
  hint?: string;
  options: readonly ChoiceOption<Value>[];
  multiple?: boolean;
  required?: boolean;
  error?: string;
  selected: readonly string[];
}) {
  const id = `contacto-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return (
    <fieldset
      className={styles.group}
      id={id}
      aria-describedby={describedBy || undefined}
      data-invalid={error ? "" : undefined}
    >
      <legend className={styles.legend}>
        {legend}
        {required ? <span aria-hidden="true"> *</span> : null}
        {!required ? <span className={styles.optional}> (opcional)</span> : null}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      <div className={styles.chips}>
        {options.map((option) => (
          <label key={option.value} className={styles.chip}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={option.value}
              required={!multiple && required ? true : undefined}
              defaultChecked={selected.includes(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submit} disabled={pending} data-cursor-magnetic="">
      <span>{pending ? "Enviando…" : "Enviar solicitud"}</span>
      <svg viewBox="0 0 56 16" aria-hidden="true" focusable="false">
        <path d="M0 8h54M47 1l7 7-7 7" />
      </svg>
    </button>
  );
}

/**
 * Formulario dedicado de /contacto con calificación del lead (basado en el
 * formulario de Calendly del estudio).
 *
 * Valida en el navegador para responder al instante y vuelve a validar en el
 * servidor con `qualifiedLeadSubmissionSchema` (fuente de verdad). Reutiliza la
 * captura de leads del sitio: firma anti-spam de `/api/contacto/token`,
 * honeypot, consentimiento versionado y atribución UTM.
 */
export function ContactLeadForm() {
  const [state, action] = useActionState(submitQualifiedContactLead, null);
  const [token, setToken] = useState({ t: "", signature: "" });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const trackedLead = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const failed = state?.success === false ? state : undefined;
  const error = (name: string) => clientErrors[name] ?? failed?.fieldErrors?.[name]?.[0];
  const value = (name: string) => failed?.values?.[name];
  const values = (name: string) => splitEchoedValues(failed?.values?.[name]);

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
        form: CONTACT_FORM_SLUG,
        origin: "contacto",
        event_id: state.leadId
      });
      return;
    }
    track("form_submit", { status: "error", form: CONTACT_FORM_SLUG, origin: "contacto" });
    // Errores del servidor: llevar el foco al primer campo marcado.
    const first = CONTACT_FIELD_ORDER.find((name) => state.fieldErrors?.[name]?.length);
    if (first) focusField(formRef.current, first);
  }, [state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateContactForm(new FormData(event.currentTarget));
    setClientErrors(errors);
    const first = CONTACT_FIELD_ORDER.find((name) => errors[name]);
    if (first) {
      // Sin `preventDefault` el action no se ejecuta: no hay viaje al servidor.
      event.preventDefault();
      focusField(event.currentTarget, first);
    }
  }

  function clearError(name: string) {
    if (!clientErrors[name]) return;
    setClientErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  if (state?.success) {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>Gracias por escribirnos.</p>
        <p>
          Revisaremos tu solicitud y te contactaremos pronto. Si prefieres adelantar la
          conversación, agenda una videollamada más abajo.
        </p>
      </div>
    );
  }

  const hasErrors = Object.keys(clientErrors).length > 0 || Boolean(failed?.fieldErrors);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={handleSubmit}
      onChange={(event) => clearError((event.target as HTMLInputElement).name)}
      className={styles.form}
      noValidate
      aria-describedby="contacto-requeridos"
    >
      <p id="contacto-requeridos" className={styles.required}>
        Los campos marcados con * son obligatorios.
      </p>
      <TextField
        name="name"
        label="Nombre"
        autoComplete="name"
        required
        error={error("name")}
        defaultValue={value("name")}
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        error={error("email")}
        defaultValue={value("email")}
      />
      <TextField
        name="phone"
        label="Teléfono"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        optional
        error={error("phone")}
        defaultValue={value("phone")}
      />
      <TextField
        name="company"
        label="Empresa / Marca"
        autoComplete="organization"
        required
        error={error("company")}
        defaultValue={value("company")}
      />

      <ChoiceGroup
        name="areas"
        legend="Área de interés"
        hint="Puedes elegir más de una."
        options={AREA_OPTIONS}
        multiple
        required
        error={error("areas")}
        selected={values("areas")}
      />
      <ChoiceGroup
        name="needs"
        legend="¿Qué necesitas?"
        hint="Puedes elegir más de una."
        options={NEED_OPTIONS}
        multiple
        required
        error={error("needs")}
        selected={values("needs")}
      />
      <ChoiceGroup
        name="budget_range"
        legend="Rango de presupuesto (CLP)"
        options={BUDGET_OPTIONS}
        required
        error={error("budget_range")}
        selected={values("budget_range")}
      />
      <ChoiceGroup
        name="timeline"
        legend="Plazo"
        options={TIMELINE_OPTIONS}
        required
        error={error("timeline")}
        selected={values("timeline")}
      />
      <ChoiceGroup
        name="source_channel"
        legend="¿Cómo nos conociste?"
        options={SOURCE_OPTIONS}
        error={error("source_channel")}
        selected={values("source_channel")}
      />

      <TextField
        name="message"
        label="Mensaje"
        multiline
        optional
        error={error("message")}
        defaultValue={value("message")}
      />
      <div className={styles.consent}>
        <Checkbox
          id="contacto-consentimiento"
          required
          label={<ConsentLabel version={CONTACT_CONSENT_VERSION} />}
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
      <input type="hidden" name="form_slug" value={CONTACT_FORM_SLUG} />
      <input type="hidden" name="consent_version" value={CONTACT_CONSENT_VERSION} />
      <input type="hidden" name="origin_type" value="contacto" />
      <input type="hidden" name="origin_slug" value="contacto" />
      <input type="hidden" name="source_path" value="/contacto" />
      <input type="hidden" name="t" value={token.t} />
      <input type="hidden" name="t_signature" value={token.signature} />
      <UtmFields initial={EMPTY_UTM} />

      <div className={styles.footer}>
        {hasErrors ? (
          <p className={styles.formError} role="alert">
            Revisa los campos indicados.
          </p>
        ) : failed ? (
          <div className={styles.formError} role="alert">
            <p>{failed.message}</p>
            <p>
              Si el problema continúa, escríbenos a{" "}
              <a href={GENERAL_EMAIL.href}>{GENERAL_EMAIL.value}</a> o por{" "}
              <a href={WHATSAPP.href} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              .
            </p>
          </div>
        ) : null}
        <SubmitButton />
      </div>
    </form>
  );
}

/** Enfoca el campo (o la primera opción del grupo) con ese `name`. */
function focusField(form: HTMLFormElement | null, name: string) {
  const target = form?.querySelector<HTMLElement>(`[name="${name}"]`);
  target?.focus();
}
