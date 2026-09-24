"use client";

import { useActionState, useEffect, useState } from "react";
import { Checkbox, Field, SubmitRow, TextArea } from "@studionomade/ui";
import { submitContactLead } from "../../app/actions";
import styles from "./contact-form.module.css";

export function ContactForm({
  origin = "contacto",
  originType = "contacto",
  sourcePath = "/contacto"
}: {
  origin?: string;
  originType?: "contacto" | "prototipo" | "referido";
  sourcePath?: string;
}) {
  const [state, action] = useActionState(submitContactLead, null);
  const [token, setToken] = useState({ timestamp: "", signature: "" });
  useEffect(() => {
    fetch("/api/contacto/token", { cache: "no-store" })
      .then((response) => response.json())
      .then((value: { timestamp?: string; signature?: string }) =>
        setToken({ timestamp: value.timestamp ?? "", signature: value.signature ?? "" })
      )
      .catch(() => setToken({ timestamp: "", signature: "" }));
  }, []);
  if (state?.success)
    return <p role="status">Gracias. Recibimos tu mensaje y te contactaremos pronto.</p>;
  return (
    <form action={action} className={styles.form} noValidate>
      <Field required label="Nombre" name="name" />
      <Field required label="Correo" name="email" type="email" />
      <Field label="Teléfono" name="phone" />
      <Field label="Empresa" name="company" />
      <div className={styles.wide}>
        <TextArea label="Cuéntanos sobre tu proyecto" name="message" rows={5} />
      </div>
      <div className={styles.wide}>
        <Checkbox
          required
          label="Acepto el tratamiento de mis datos para responder esta solicitud."
          name="consentimiento"
        />
      </div>
      <input
        className={styles.honeypot}
        name="empresa_web"
        tabIndex={-1}
        autoComplete="off"
        aria-label="Empresa web"
      />
      <input type="hidden" name="form_slug" value="contacto-general" />
      <input type="hidden" name="consent_version" value="2026-09" />
      <input type="hidden" name="origin_type" value={originType} />
      <input type="hidden" name="origin_slug" value={origin} />
      <input type="hidden" name="source_path" value={sourcePath} />
      <input type="hidden" name="t" value={token.timestamp} />
      <input type="hidden" name="t_signature" value={token.signature} />
      <div className={styles.wide}>
        {state?.success === false && <p role="alert">{state.message}</p>}
        <SubmitRow label="Enviar" note="Responderemos a la brevedad." />
      </div>
    </form>
  );
}
