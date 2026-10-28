import Image from "next/image";
import { Reveal, SplitText } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import { CaseRule } from "../case-parts";
import { DragScroll } from "./drag-scroll";
import styles from "./case-strip.module.css";

type StripBlock = Extract<CaseBlock, { type: "strip" }>;

/**
 * "Package Design" (CinnaLove 6:32): carril horizontal de scroll libre con los
 * PNG del packaging; el tercero asoma por la derecha como pista.
 */
export function CaseStrip({ block }: { block: StripBlock }) {
  return (
    <section className={styles.strip} aria-labelledby="strip-titulo">
      <div className={styles.heading}>
        <CaseRule />
        <SplitText as="h2" by="words" id="strip-titulo" className={styles.title}>
          {block.title}
        </SplitText>
      </div>
      <DragScroll className={styles.track} label={`${block.title}: galería desplazable`}>
        <ul className={styles.list}>
          {block.items.map((item, index) => (
            <Reveal as="li" key={item.src} step={index} className={styles.item}>
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(max-width: 48em) 80vw, 40vw"
                draggable={false}
              />
            </Reveal>
          ))}
        </ul>
      </DragScroll>
    </section>
  );
}
