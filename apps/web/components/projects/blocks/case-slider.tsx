import Image from "next/image";
import { Carousel } from "@studionomade/ui";
import type { CaseBlock } from "../../../content/projects";
import styles from "./case-slider.module.css";

type SliderBlock = Extract<CaseBlock, { type: "slider" }>;

/**
 * Slider de mockups (NEXA 6:76): imagen 1118 × 779, flechas a los lados, barra
 * de progreso de 2px con el tramo activo en acento y etiquetas clicables.
 * Con una sola diapositiva las flechas se ocultan.
 */
export function CaseSlider({ block }: { block: SliderBlock }) {
  return (
    <section className={styles.slider} data-single={block.slides.length < 2 || undefined}>
      <Carousel
        label={block.label}
        layout="sides"
        accent
        labels={block.slides.map((slide) => slide.label)}
        className={styles.carousel}
      >
        {block.slides.map((slide, index) => (
          <div className={styles.frame} key={slide.image.src}>
            <Image
              src={slide.image.src}
              alt={slide.image.alt}
              fill
              sizes="(max-width: 48em) 100vw, 78vw"
              priority={index === 0}
            />
          </div>
        ))}
      </Carousel>
    </section>
  );
}
