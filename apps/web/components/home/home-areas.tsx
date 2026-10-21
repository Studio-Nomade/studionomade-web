import Image from "next/image";
import Link from "next/link";
import { Reveal, SplitText } from "@studionomade/ui";
import { HOME_AREAS, HOME_AREAS_NOTE } from "../../content/home";
import { AreaGrid } from "./area-grid";
import styles from "./home-landing.module.css";

const SIZES = "(min-width: 64em) 25vw, (min-width: 48em) 50vw, 100vw";

/**
 * Sección «Áreas»: las cuatro áreas del Studio como tarjetas cuadradas. Cada
 * una muestra una imagen y, al pasar el cursor (o al enfocar), una segunda
 * imagen del área sube por máscara sobre la primera, crece la regla de acento y
 * aparece la descripción. En táctil el cambio ocurre al hacer scroll.
 */
export function HomeAreas() {
  return (
    <section id="areas" className={styles.areas} aria-labelledby="home-areas">
      <div className={styles.sectionHead}>
        <SplitText as="h2" by="chars" id="home-areas" className={styles.masthead}>
          Áreas
        </SplitText>
        <Reveal as="p" className={styles.sectionNote} step={2}>
          {HOME_AREAS_NOTE}
        </Reveal>
      </div>
      <AreaGrid className={styles.areaGrid}>
        {HOME_AREAS.map((area, index) => (
          <Reveal
            as="li"
            className={styles.area}
            key={area.slug}
            step={index}
            data-accent={area.accent}
          >
            <Link
              className={styles.areaLink}
              href={area.href}
              aria-label={`Ver área ${area.name}`}
              data-cursor-label="Ver"
            >
              <span className={styles.areaMedia}>
                <Image src={area.images[0].src} alt="" fill sizes={SIZES} />
              </span>
              <span className={styles.areaMediaAlt} aria-hidden="true">
                <Image src={area.images[1].src} alt="" fill sizes={SIZES} />
              </span>
              <span className={styles.areaShade} aria-hidden="true" />
              <span className={styles.areaTop}>
                <span className={styles.areaCode}>{area.code}</span>
                <Image
                  className={styles.areaSymbol}
                  src={area.symbol}
                  alt=""
                  width={256}
                  height={256}
                />
              </span>
              <span className={styles.areaBottom}>
                <span className={styles.areaDescription}>{area.description}</span>
                <span className={styles.areaMore} aria-hidden="true">
                  Ver área →
                </span>
                <span className={styles.areaRule} aria-hidden="true" />
                <span className={styles.areaName}>{area.name}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </AreaGrid>
    </section>
  );
}
