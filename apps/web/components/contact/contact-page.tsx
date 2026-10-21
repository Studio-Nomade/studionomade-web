import { Reveal, SplitText } from "@studionomade/ui";

import { BOOKING_URL, DIRECT_CONTACTS } from "../../content/contact";
import { PublicPage } from "../public/public-shell";
import { BookingEmbed } from "./booking-embed";
import { ContactLeadForm } from "./contact-lead-form";
import styles from "./contact-page.module.css";

/** Canales directos del estudio (correo por tema y WhatsApp comercial). */
function DirectContacts() {
  return (
    <aside className={styles.channels} aria-labelledby="canales-titulo">
      <h2 id="canales-titulo" className={styles.channelsTitle}>
        Canales directos
      </h2>
      <p className={styles.channelsLead}>
        ¿Prefieres escribirnos tú? Elige el canal según tu consulta.
      </p>
      <ul className={styles.channelList}>
        {DIRECT_CONTACTS.map((contact) => (
          <li key={contact.id}>
            <span className={styles.channelLabel}>{contact.label}</span>
            <a
              href={contact.href}
              className={styles.channelValue}
              {...(contact.kind === "whatsapp"
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {contact.value}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/**
 * /contacto: formulario dedicado con calificación del lead, canales directos y
 * agenda de videollamadas (`#agenda`).
 */
export function ContactPage() {
  return (
    <PublicPage headerTone="light">
      <section className={styles.hero} aria-labelledby="contacto-titulo">
        <Reveal as="p" preset="fade" className={styles.eyebrow}>
          Contacto
        </Reveal>
        <SplitText as="h1" by="chars" id="contacto-titulo" className={styles.title}>
          Conversemos
        </SplitText>
        <Reveal as="p" preset="fade" delay={0.3} className={styles.lead}>
          Cuéntanos qué tienes en mente. Con estos datos podemos entender tu proyecto y responderte
          con una propuesta de trabajo adecuada.
        </Reveal>
        <Reveal
          as="nav"
          preset="fade"
          delay={0.4}
          className={styles.jump}
          aria-label="En esta página"
        >
          <a href="#formulario">Escribir un mensaje</a>
          <a href="#agenda">Agendar una videollamada</a>
        </Reveal>
      </section>

      <section id="formulario" className={styles.formBand} aria-labelledby="formulario-titulo">
        <div className={styles.formLayout}>
          <div className={styles.formCard}>
            <h2 id="formulario-titulo" className={styles.sectionTitle}>
              Cuéntanos sobre tu proyecto
            </h2>
            <ContactLeadForm />
          </div>
          <DirectContacts />
        </div>
      </section>

      <section id="agenda" className={styles.agenda} aria-labelledby="agenda-titulo">
        <div className={styles.agendaIntro}>
          <h2 id="agenda-titulo" className={styles.sectionTitle}>
            Agendar una videollamada
          </h2>
          <p className={styles.agendaLead}>
            Elige un horario disponible y conversemos por videollamada sobre tu proyecto.
          </p>
        </div>
        <BookingEmbed bookingUrl={BOOKING_URL} />
      </section>
    </PublicPage>
  );
}
