"use client";

import { useActionState } from "react";
import { Checkbox, Field, Select, SubmitRow, TextArea } from "@studionomade/ui";
import { submitCampaignLead } from "../../app/campanas/[slug]/actions";
import { UtmFields } from "../../components/campaign/utm-fields";
import type { CampaignContent } from "@studionomade/content-schema";
import styles from "./composition.module.css";

interface CampaignFormProps {
  content: CampaignContent["form"];
  slug: string;
  formSlug: string;
  consentVersion: string;
  utm: Record<string, string | undefined>;
  timestamp: string;
  signature: string;
}

export function CampaignForm(props: CampaignFormProps) {
  const [state, action] = useActionState(submitCampaignLead, null);
  const error = (name: string) =>
    state?.success === false ? state.fieldErrors?.[name]?.[0] : undefined;

  if (state?.success) {
    return <p className={styles.success}>{props.content.successMessage}</p>;
  }

  return (
    <form action={action} className={styles.formGrid} noValidate>
      <Field invert required label="Nombre" name="name" error={error("name")} />
      <Field invert required label="Email" name="email" type="email" error={error("email")} />
      <Select
        invert
        required
        label="Etapa del proyecto"
        name="project_stage"
        options={props.content.stages}
      />
      <Field invert required label="Proyecto" name="company" error={error("company")} />
      <div className={styles.formWide}>
        <TextArea invert label="Cuéntanos brevemente" name="message" rows={3} />
      </div>
      <div className={styles.formWide}>
        <Checkbox
          invert
          required
          label={props.content.consentLabel}
          name="consentimiento"
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
        {state?.success === false && <p className={styles.formError}>{state.message}</p>}
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
