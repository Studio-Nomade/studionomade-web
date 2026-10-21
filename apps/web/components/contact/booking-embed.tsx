import { isEmbeddableBookingUrl } from "../../content/contact";
import styles from "./booking-embed.module.css";

/**
 * Agenda de videollamadas embebida (Calendly hoy; Google Calendar después).
 *
 * Solo se incrusta una URL https de un proveedor conocido
 * (`isEmbeddableBookingUrl`); si no, queda el enlace. El iframe carga en
 * diferido y el enlace permite abrir la agenda completa en otra pestaña.
 */
export function BookingEmbed({
  bookingUrl,
  title = "Agenda una videollamada con Studio Nomade"
}: {
  bookingUrl: string;
  title?: string;
}) {
  const embeddable = isEmbeddableBookingUrl(bookingUrl);
  return (
    <div className={styles.booking}>
      {embeddable ? (
        <div className={styles.frame}>
          {/* Queda detrás del iframe: solo se ve mientras carga o si el navegador lo bloquea. */}
          <p className={styles.fallback} aria-hidden="true">
            Cargando la agenda…
          </p>
          <iframe
            src={bookingUrl}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : null}
      <a
        className={styles.link}
        href={bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="agenda-pestana"
      >
        Abrir en una pestaña nueva
        <span className={styles.srOnly}> (agenda de videollamadas)</span>
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M5 3h8v8M13 3 3 13" />
        </svg>
      </a>
    </div>
  );
}
