import Image from "next/image";
import { Parallax, Reveal } from "@studionomade/ui";
import type { CaseImage, RichText } from "../../content/projects";
import styles from "./case.module.css";

/** Une clases de CSS Modules sin dependencias. */
export function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

/** Texto plano del contenido enriquecido (metadatos, nombres accesibles, tests). */
export function plainText(text: RichText): string {
  return typeof text === "string" ? text : text.map((part) => part.text).join("");
}

/** Pinta los tramos de peso que define Figma (400 / 600 / 700). */
export function Rich({ text }: { text: RichText }) {
  if (typeof text === "string") return <>{text}</>;
  return (
    <>
      {text.map((part, index) =>
        part.weight && part.weight !== 400 ? (
          <span key={index} className={styles.weight} data-weight={part.weight}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}

/** Regla corta de 448 × 2 en el color de acento, que crece desde el centro. */
export function CaseRule() {
  return (
    <Reveal preset="headline" direction="up" className={styles.rule} aria-hidden="true">
      {null}
    </Reveal>
  );
}

/**
 * Botón "Ver en Behance". Las URLs están sin confirmar (TODO-contenido): sin
 * `href` no se renderiza nada.
 */
export function BehanceLink({ href, project }: { href?: string; project: string }) {
  if (!href) return null;
  return (
    <a
      className={styles.behance}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver ${project} en Behance (se abre en una pestaña nueva)`}
      data-cursor-magnetic=""
    >
      Ver en Behance
    </a>
  );
}

interface CaseMediaProps {
  image: CaseImage;
  sizes: string;
  className?: string;
  /** Revela con máscara al entrar en viewport. */
  mask?: boolean;
  /** Desplazamiento de parallax ligado al scroll. `0` lo desactiva. */
  parallax?: number;
  /** Zoom suave al hover. */
  zoom?: boolean;
  priority?: boolean;
  step?: number;
  /** Dirección hacia donde se retira la máscara. */
  direction?: "up" | "down" | "left" | "right";
}

/**
 * Imagen de caso: `cover`, sin radio, con máscara de revelado y parallax. La
 * caja la dimensiona quien la usa (`className` con `aspect-ratio` o alto); sin
 * JS o con movimiento reducido la imagen está quieta y visible.
 */
export function CaseMedia({
  image,
  sizes,
  className,
  mask = true,
  parallax = 0.06,
  zoom = false,
  priority = false,
  step,
  direction = "up"
}: CaseMediaProps) {
  const picture = (
    <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} quality={80} />
  );
  const inner =
    parallax > 0 ? (
      <Parallax y={parallax} clip className={styles.parallax}>
        <span className={styles.frame}>{picture}</span>
      </Parallax>
    ) : (
      <span className={styles.still}>{picture}</span>
    );
  const classes = cx(styles.media, zoom && styles.zoom, className);
  if (!mask) return <div className={classes}>{inner}</div>;
  return (
    <Reveal preset="mask" direction={direction} step={step} className={classes}>
      {inner}
    </Reveal>
  );
}
