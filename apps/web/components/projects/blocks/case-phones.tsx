import Image from "next/image";
import { HorizontalScroll, Reveal } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import { Rich } from "../case-parts";
import styles from "./case-phones.module.css";

type PhonesBlock = Extract<CaseBlock, { type: "phones" }>;

/**
 * Galería horizontal anclada (Kumelen 6:224): en escritorio la sección se fija
 * y el scroll vertical desplaza los teléfonos mientras el texto queda quieto;
 * en móvil, sin JS o con movimiento reducido, es un carril nativo con el texto
 * encima.
 */
export function CasePhones({ block }: { block: PhonesBlock }) {
  return (
    <HorizontalScroll
      label="Diseño web en teléfonos"
      minWidth={1024}
      className={styles.phones}
      intro={
        <Reveal as="p" className={styles.text}>
          <Rich text={block.text} />
        </Reveal>
      }
    >
      {block.items.map((item, index) => (
        <Reveal key={item.src} step={index} className={styles.card}>
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            sizes="(max-width: 48em) 70vw, 21vw"
          />
        </Reveal>
      ))}
    </HorizontalScroll>
  );
}
