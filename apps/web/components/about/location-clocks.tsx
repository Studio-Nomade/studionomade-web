"use client";

import { useEffect, useState } from "react";

import type { StudioLocation } from "../../content/about";
import styles from "./location-clocks.module.css";

export interface LocalClock {
  time: string;
  /** Desfase respecto de UTC, por ejemplo "GMT-3". */
  offset: string;
}

/** Hora local (HH:MM, 24 h) y desfase UTC de una zona horaria. */
export function localClock(timeZone: string, now: Date): LocalClock {
  const time = new Intl.DateTimeFormat("es-CL", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(now);
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  return { time, offset };
}

/**
 * Ciudades del estudio con su hora local en vivo. Un solo temporizador para
 * todas, alineado al cambio de minuto.
 *
 * En el servidor (y antes de hidratar) la hora queda en "--:--": el HTML es
 * estático y una hora fija en build sería falsa.
 */
export function LocationClocks({ locations }: { locations: StudioLocation[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = new Date();
      setNow(current);
      // Próximo cambio de minuto (+50 ms de margen).
      timer = setTimeout(tick, 60_000 - (current.getTime() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return (
    <ul className={styles.list}>
      {locations.map((location) => {
        const clock = now ? localClock(location.timeZone, now) : null;
        return (
          <li key={location.city} className={styles.item}>
            <p className={styles.city}>{location.city}</p>
            <p className={styles.country}>{location.country}</p>
            <p className={styles.clock}>
              <time
                className={styles.time}
                dateTime={now?.toISOString()}
                aria-label={clock ? `Hora local en ${location.city}: ${clock.time}` : undefined}
              >
                {clock?.time ?? "--:--"}
              </time>
              <span className={styles.offset}>{clock?.offset ?? " "}</span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
