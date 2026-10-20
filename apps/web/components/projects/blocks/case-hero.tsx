import { Reveal, SplitText } from "@studionomade/ui";
import { AREA_LABELS, type CaseBlock, type PublicProject } from "../../../content/projects";
import { BehanceLink, CaseMedia, CaseRule, Rich } from "../case-parts";
import styles from "./case-hero.module.css";

type HeroBlock = Extract<CaseBlock, { type: "hero" }>;

/**
 * Cabecera del caso: código de área, título por letras, año por palabras e
 * imagen con máscara y parallax. Variantes de Figma:
 * - `inset` (1081 × 988 sobre banda gris que empieza 80px más abajo),
 * - `inset-wide` (1222 × 1229, banda a 58px),
 * - `full` (1440 × 914 a sangre, con regla, claim y botón debajo).
 */
export function CaseHero({ block, project }: { block: HeroBlock; project: PublicProject }) {
  const long = block.titleSize === "long";
  const behance = block.behance ? project.behanceUrl : undefined;
  const hasFooter = Boolean(block.tags?.length || block.quote || behance);

  return (
    <header
      className={styles.hero}
      data-variant={block.variant}
      data-long={long || undefined}
      data-quote={block.quoteWidth ?? "wide"}
    >
      <div className={styles.heading}>
        <Reveal preset="fade" as="p" className={styles.area}>
          <span className={styles.code}>{project.areaCode}</span>
          <span className={styles.areaName}>{AREA_LABELS[project.areaCode]}</span>
        </Reveal>
        <SplitText as="h1" by="chars" className={styles.title}>
          {project.title}
        </SplitText>
        <SplitText as="p" by="words" delay={0.3} className={styles.year}>
          {project.year}
        </SplitText>
      </div>

      <div className={styles.stage}>
        <CaseMedia
          image={block.image}
          priority
          className={styles.media}
          parallax={0.06}
          sizes={
            block.variant === "full"
              ? "100vw"
              : block.variant === "inset-wide"
                ? "(max-width: 48em) 100vw, 85vw"
                : "(max-width: 48em) 100vw, 75vw"
          }
        />

        {block.variant === "full" ? (
          <div className={styles.claimBlock}>
            <CaseRule />
            {block.claim ? (
              <Reveal as="p" className={styles.claim}>
                <Rich text={block.claim} />
              </Reveal>
            ) : null}
            {behance ? (
              <Reveal step={1}>
                <BehanceLink href={behance} project={project.title} />
              </Reveal>
            ) : null}
          </div>
        ) : hasFooter ? (
          <div className={styles.footer}>
            {block.tags?.length ? (
              <ul className={styles.tags} aria-label="Servicios">
                {block.tags.map((tag, index) => (
                  <Reveal as="li" key={tag} step={index}>
                    {tag}
                  </Reveal>
                ))}
              </ul>
            ) : null}
            {block.quote ? (
              typeof block.quote === "string" ? (
                <SplitText as="p" by="lines" className={styles.quote}>
                  {block.quote}
                </SplitText>
              ) : (
                <Reveal as="p" className={styles.quote}>
                  <Rich text={block.quote} />
                </Reveal>
              )
            ) : null}
            {behance ? (
              <Reveal className={styles.button}>
                <BehanceLink href={behance} project={project.title} />
              </Reveal>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
