import type { CSSProperties } from "react";
import { Reveal } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import { CaseMedia, Rich } from "../case-parts";
import shared from "../case.module.css";
import styles from "./case-zones.module.css";

type ZonesBlock = Extract<CaseBlock, { type: "zones" }>;

/**
 * Zonas del recorrido: planta pegada a la izquierda sobre negro (Reebok 27:87)
 * o plano centrado que se monta sobre el bloque anterior, sobre gris tinta
 * (Equifax 27:159). Una sola lista ordenada repartida en dos columnas.
 */
export function CaseZones({ block }: { block: ZonesBlock }) {
  const tone = block.variant === "map" ? "ink" : "dark";
  return (
    <section
      className={`${shared.tone} ${styles.zones}`}
      data-tone={tone}
      data-variant={block.variant}
      aria-label="Zonas del recorrido"
    >
      <CaseMedia
        image={block.image}
        sizes={
          block.variant === "map"
            ? "(max-width: 48em) 100vw, 72vw"
            : "(max-width: 48em) 100vw, 85vw"
        }
        className={styles.media}
        parallax={0}
        direction={block.variant === "map" ? "up" : "left"}
      />
      <div className={styles.content}>
        {block.intro ? (
          <Reveal as="p" className={styles.intro}>
            <Rich text={block.intro} />
          </Reveal>
        ) : null}
        <ol
          className={styles.list}
          style={{ "--sn-step-count": Math.ceil(block.items.length / 2) } as CSSProperties}
        >
          {block.items.map((item, index) => (
            <Reveal as="li" key={item} step={index % 5} className={styles.item}>
              {item}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
