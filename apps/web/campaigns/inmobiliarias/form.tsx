"use client";

import { useActionState, useEffect, useRef } from "react";
import { Checkbox, Field, Select, SubmitRow, TextArea } from "@studionomade/ui";
import { submitCampaignLead } from "../../app/campanas/[slug]/actions";
import { UtmFields } from "../../components/campaign/utm-fields";
import { ConsentLabel } from "../../components/legal/consent-label";
import type { LeadConsentVersion } from "../../content/legal/consentimientos";
import { track } from "../../lib/analytics/track";
import type { CampaignContent } from "@studionomade/content-schema";
import styles from "./composition.module.css";

interface CampaignFormProps {
  content: CampaignContent["form"];
  slug: string;
  formSlug: string;
  consentVersion: LeadConsentVersion;
  utm: Record<string, string | undefined>;
  timestamp: string;
  signature: string;
}

export function CampaignForm(props: CampaignFormProps) {
  const [state, action] = useActionState(submitCampaignLead, null);
  const failed = state?.success === false ? state : undefined;
  const error = (name: string) => failed?.fieldErrors?.[name]?.[0];
  const value = (name: string) => failed?.values?.[name];
  const trackedLead = useRef<string | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      // Sin leadId es el honeypot: no se cuenta como conversión.
      if (!state.leadId || trackedLead.current === state.leadId) return;
      trackedLead.current = state.leadId;
      track("form_submit", {
        status: "success",
        form: props.formSlug,
        origin: props.slug,
        event_id: state.leadId
      });
      return;
    }
    track("form_submit", { status: "error", form: props.formSlug, origin: props.slug });
  }, [state, props.formSlug, props.slug]);

  if (state?.success) {
    return (
      <p className={styles.success} role="status">
        {props.content.successMessage}
      </p>
    );
  }

  return (
    <form action={action} className={styles.formGrid} noValidate>
      <Field
        invert
        required
        label="Nombre"
        name="name"
        defaultValue={value("name")}
        error={error("name")}
      />
      <Field
        invert
        required
        label="Email"
        name="email"
        type="email"
        defaultValue={value("email")}
        error={error("email")}
      />
      {/* `key`: React solo fija `defaultSelected` al montar; sin remontar, el reset
          del formulario tras un error dejaría la etapa en blanco. */}
      <Select
        key={value("project_stage") ?? "sin-etapa"}
        invert
        required
        label="Etapa del proyecto"
        name="project_stage"
        options={props.content.stages}
        defaultValue={value("project_stage")}
        error={error("project_stage")}
      />
      <Field
        invert
        required
        label="Proyecto"
        name="company"
        defaultValue={value("company")}
        error={error("company")}
      />
      <Field
        invert
        label="Teléfono"
        name="phone"
        type="tel"
        placeholder="+56 9 1234 5678"
        hint="Opcional. Número chileno."
        defaultValue={value("phone")}
        error={error("phone")}
      />
      <div className={styles.formWide}>
        <TextArea
          invert
          label="Cuéntanos brevemente"
          name="message"
          rows={3}
          defaultValue={value("message")}
          error={error("message")}
        />
      </div>
      <div className={styles.formWide}>
        <Checkbox
          invert
          required
          label={<ConsentLabel version={props.consentVersion} />}
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
      <input type="hidden" name="form_slug" value={props.formSlug} />
      <input type="hidden" name="consent_version" value={props.consentVersion} />
      <input type="hidden" name="origin_type" value="campana" />
      <input type="hidden" name="origin_slug" value={props.slug} />
      <input type="hidden" name="source_path" value={`/campanas/${props.slug}`} />
      <input type="hidden" name="t" value={props.timestamp} />
      <input type="hidden" name="t_signature" value={props.signature} />
      <UtmFields initial={props.utm} />
      <div className={styles.formWide}>
        {failed && (
          <p className={styles.formError} role="alert">
            {failed.message}
          </p>
        )}
        <SubmitRow
          invert
          accent
          label={props.content.submitLabel}
          note="Te contactaremos para coordinar una primera conversación."
        />
      </div>
    </form>
  );
}
