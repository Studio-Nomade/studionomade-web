"use client";

import { useEffect, useState, type CSSProperties } from "react";

import type { StudioLocation } from "../../content/about";
import styles from "./location-clocks.module.css";

export interface LocalClock {
  time: string;
  /** Desfase respecto de UTC, por ejemplo "GMT-3". */
  offset: string;
}

/** Ángulos de las agujas (grados) para una hora "HH:MM". */
export function handAngles(time: string): { hour: number; minute: number } {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return { hour: ((h % 12) + m / 60) * 30, minute: m * 6 };
}

const TICKS = Array.from({ length: 12 }, (_, index) => index);

/** Reloj circular minimal: doce marcas, aguja de hora y de minuto. */
function Dial({ time }: { time: string | null }) {
  const angles = time ? handAngles(time) : null;
  return (
    <svg
      className={styles.dial}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      data-ready={angles ? "" : undefined}
      style={
        angles
          ? ({ "--hour": `${angles.hour}deg`, "--minute": `${angles.minute}deg` } as CSSProperties)
          : undefined
      }
    >
      <circle className={styles.face} cx="50" cy="50" r="48" />
      {TICKS.map((tick) => (
        <line
          key={tick}
          className={styles.tick}
          data-major={tick % 3 === 0 || undefined}
          x1="50"
          y1={tick % 3 === 0 ? 6 : 7}
          x2="50"
          y2={tick % 3 === 0 ? 12 : 10}
          transform={`rotate(${tick * 30} 50 50)`}
        />
      ))}
      <line className={styles.hour} x1="50" y1="50" x2="50" y2="27" />
      <line className={styles.minute} x1="50" y1="50" x2="50" y2="15" />
      <circle className={styles.pivot} cx="50" cy="50" r="1.6" />
    </svg>
  );
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
            <Dial time={clock?.time ?? null} />
            <div className={styles.meta}>
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
