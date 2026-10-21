import { SITE_OFFICES } from "../../content/site";
import styles from "./office-maps.module.css";

const mapSrc = (query: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=es&output=embed`;

const mapLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/**
 * Mapas de las oficinas con dirección física, incrustados desde Google Maps.
 * El embed público no admite estilos, así que el negro con líneas blancas se
 * logra con un filtro (escala de grises + inversión) sobre el iframe.
 */
export function OfficeMaps() {
  return (
    <div className={styles.maps}>
      {SITE_OFFICES.map((office) => (
        <figure key={office.city} className={styles.map}>
          <div className={styles.frame}>
            <iframe
              src={mapSrc(office.mapQuery)}
              title={`Mapa de la oficina de Studio Nomade en ${office.city}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen={false}
            />
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.city}>{office.city}</span>
            <span>{office.lines.join(" · ")}</span>
            <a href={mapLink(office.mapQuery)} target="_blank" rel="noopener noreferrer">
              Cómo llegar
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
