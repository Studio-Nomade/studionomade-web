import Image from "next/image";
import {
  Carousel,
  Counter,
  Parallax,
  Reveal,
  SplitText,
  type MotionDirection
} from "@studionomade/ui";
import type { CSSProperties } from "react";
import { BEHANCE_URL, type AreaContent, type AreaImage } from "../../content/areas";
import { AREA_TEAMS, initials, type TeamMember } from "../../content/team";
import { PublicFooter, PublicHeader } from "../public/public-shell";
import { AreaContactForm } from "./area-contact-form";
import { RichTextView } from "./rich-text";
import styles from "./area-page.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** Filete decorativo que crece desde el centro (o desde la izquierda) al entrar. */
function AccentRule({
  size,
  from = "center",
  className
}: {
  size: "sm" | "md" | "full";
  from?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      as="span"
      preset="headline"
      direction={from === "left" ? "left" : undefined}
      aria-hidden="true"
      className={[styles.rule, className].filter(Boolean).join(" ")}
      data-size={size}
    />
  );
}

/** Imagen con revelado por máscara y parallax suave dentro de su marco. */
function MaskedImage({
  image,
  sizes,
  direction = "up",
  priority,
  className
}: {
  image: AreaImage;
  sizes: string;
  direction?: MotionDirection;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Reveal
      preset="mask"
      direction={direction}
      className={[styles.media, className].filter(Boolean).join(" ")}
      data-fit={image.fit === "contain" ? "contain" : undefined}
      style={
        {
          "--media-ratio": `${image.width} / ${image.height}`,
          "--media-focus": image.focus ?? "50% 50%"
        } as CSSProperties
      }
    >
      <Parallax y={0.05} clip className={styles.parallax}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} />
      </Parallax>
    </Reveal>
  );
}

function SectionTitle({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  return (
    <div className={styles.sectionTitle}>
      <SplitText as="h2" id={id} className={styles.h2}>
        {title}
      </SplitText>
      {subtitle ? (
        <Reveal as="p" preset="fade" delay={0.2} className={styles.subtitle}>
          {subtitle}
        </Reveal>
      ) : null}
    </div>
  );
}

function HeroSection({ area }: { area: AreaContent }) {
  const { hero } = area;
  return (
    <section className={styles.hero} data-media={hero.kind} aria-labelledby="area-titulo">
      <SplitText as="h1" by="chars" id="area-titulo" className={styles.heroTitle}>
        {area.title}
      </SplitText>
      <ul className={styles.services} aria-label="Servicios">
        {area.services.map((service, index) => (
          <Reveal as="li" key={service} step={index + 2}>
            {service}
          </Reveal>
        ))}
      </ul>
      <figure className={styles.quote}>
        <SplitText as="blockquote" delay={0.4}>
          <RichTextView text={area.quote} />
        </SplitText>
        <Reveal as="figcaption" preset="fade" delay={0.7}>
          {area.quoteBy}
        </Reveal>
      </figure>

      {hero.kind === "carousel" ? (
        <Carousel
          label={hero.label ?? "Mockups de marcas"}
          variant="peek"
          controls="progress"
          className={styles.rail}
          lead={
            <Reveal as="p" className={styles.railNote}>
              <RichTextView text={hero.note} />
            </Reveal>
          }
        >
          {hero.slides.map((slide, index) => (
            <Reveal key={slide.src} preset="mask" step={index} className={styles.slide}>
              <Image
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                sizes="(max-width: 48em) 70vw, 21vw"
                priority={index === 0}
                draggable={false}
              />
            </Reveal>
          ))}
        </Carousel>
      ) : (
        <div className={styles.band}>
          <MaskedImage
            image={hero.image}
            sizes="(max-width: 48em) 100vw, 70vw"
            priority
            className={styles.bandMedia}
          />
        </div>
      )}
    </section>
  );
}

function WhatSection({ area }: { area: AreaContent }) {
  const { values, scope } = area;
  return (
    <section className={styles.what} aria-labelledby="que-hacemos">
      <div className={styles.split2}>
        <SectionTitle id="que-hacemos" title="¿Qué hacemos?" />
        <SplitText as="p" className={styles.lead}>
          <RichTextView text={area.what} />
        </SplitText>
      </div>

      <div className={styles.row}>
        <MaskedImage
          image={values.image}
          direction="left"
          sizes="(max-width: 48em) 100vw, 50vw"
          className={styles.rowMedia}
        />
        <div className={styles.rowText}>
          <h3 className={styles.h3}>Valores</h3>
          <AccentRule size="sm" />
          <ol className={styles.values}>
            {values.items.map((item, index) => (
              <Reveal as="li" key={item.title} step={index} className={styles.value}>
                <span className={styles.valueMark} aria-hidden="true">
                  <Reveal as="span" preset="stroke" delay={0.2 + index * 0.09}>
                    <svg viewBox="0 0 64 64" focusable="false">
                      <circle cx="32" cy="32" r="31.5" />
                    </svg>
                  </Reveal>
                  <span>{pad(index + 1)}</span>
                </span>
                <div>
                  <h4 className={styles.valueTitle}>{item.title}</h4>
                  <p className={styles.valueBody}>{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.row} data-order="text-first">
        <div className={styles.rowText}>
          <h3 className={styles.h3}>Alcance</h3>
          <AccentRule size="sm" />
          {scope.stats.length ? (
            <div
              className={styles.stats}
              data-layout={scope.stats.length > 1 ? "diagonal" : "single"}
            >
              {scope.stats.map((stat, index) => (
                <Reveal key={stat.label} preset="fade" step={index * 2} className={styles.stat}>
                  <p className={styles.statValue}>
                    {stat.prefix ? <span className={styles.statPrefix}>{stat.prefix}</span> : null}
                    <Counter to={stat.value} />
                  </p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </Reveal>
              ))}
            </div>
          ) : null}
          {scope.points?.length ? (
            <ul className={styles.points}>
              {scope.points.map((point, index) => (
                <Reveal as="li" key={point} step={index} className={styles.point}>
                  {point}
                </Reveal>
              ))}
            </ul>
          ) : null}
        </div>
        <MaskedImage
          image={scope.image}
          direction="right"
          sizes="(max-width: 48em) 100vw, 50vw"
          className={styles.rowMedia}
        />
      </div>
    </section>
  );
}

/** Galería de a pares; las imágenes `wide` ocupan toda la fila. */
function GallerySection({ area }: { area: AreaContent }) {
  return (
    <section className={styles.gallery} aria-label="Galería de proyectos">
      {area.gallery.map((image) => (
        <MaskedImage
          key={image.src}
          image={image}
          sizes={image.wide ? "(max-width: 48em) 100vw, 90vw" : "(max-width: 48em) 100vw, 45vw"}
          className={image.wide ? styles.wide : undefined}
        />
      ))}
    </section>
  );
}

function MethodSection({ area }: { area: AreaContent }) {
  const { method } = area;
  return (
    <section className={styles.method} aria-labelledby="metodologia">
      <SectionTitle id="metodologia" title="Metodología" subtitle="¿Cómo lo hacemos?" />
      <div className={styles.methodBody} data-tone={method.tone}>
        {method.paragraphs.map((paragraph, index) => (
          <SplitText as="p" key={index} delay={index * 0.15}>
            {index === 0 && method.lead ? (
              <>
                <strong className={styles.methodLead}>{method.lead}</strong>
                <br />
              </>
            ) : null}
            <RichTextView text={paragraph} />
          </SplitText>
        ))}
        {method.pills.length ? (
          <ul className={styles.pills}>
            {method.pills.map((pill, index) => (
              <Reveal as="li" key={pill} step={index}>
                {pill}
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function DeliverablesSection({ area }: { area: AreaContent }) {
  const { deliverables } = area;
  return (
    <section className={styles.deliverables} aria-labelledby="que-entregamos">
      <SectionTitle id="que-entregamos" title="¿Qué entregamos?" />
      <div className={styles.deliverablesBody}>
        <Reveal className={styles.block}>
          <h3>Outputs claros</h3>
          <p>{deliverables.outputs}</p>
        </Reveal>
        <AccentRule size="full" from="left" />
        <Reveal className={styles.block}>
          <h3>Tipos de proyectos</h3>
          <div className={styles.types}>
            {deliverables.types.map((column, index) => (
              <ul key={index}>
                {column.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            ))}
          </div>
        </Reveal>
        <AccentRule size="full" from="left" />
        <Reveal className={styles.block}>
          <h3>Resultados</h3>
          <p>{deliverables.results}</p>
        </Reveal>
      </div>
    </section>
  );
}

/** Retrato del equipo. Sin foto, un retrato neutro con las iniciales (TODO-contenido). */
function Portrait({ member, step }: { member: TeamMember; step: number }) {
  return (
    <Reveal preset="mask" step={step} className={styles.portrait}>
      {member.photo ? (
        <Image
          src={member.photo.src}
          alt={member.name}
          fill
          sizes="(max-width: 48em) 100vw, 33vw"
        />
      ) : (
        <span className={styles.portraitPlaceholder} data-placeholder="" aria-hidden="true">
          {initials(member.name)}
        </span>
      )}
    </Reveal>
  );
}

function TeamSection({ area }: { area: AreaContent }) {
  const team = AREA_TEAMS[area.slug];
  // TODO-contenido: las áreas sin equipo definido omiten la sección.
  if (!team.length) return null;
  return (
    <section className={styles.team} aria-labelledby="equipo">
      <AccentRule size="md" />
      <SplitText as="h2" id="equipo" className={styles.h2}>
        Conoce al equipo
      </SplitText>
      <ul className={styles.teamGrid}>
        {team.map((member, index) => (
          <li key={member.id} className={styles.member}>
            <Portrait member={member} step={index % 2} />
            <Reveal step={(index % 2) + 1}>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CtaSection() {
  return (
    <section className={styles.cta} aria-labelledby="cta-titulo">
      <AccentRule size="md" />
      <SplitText
        as="h2"
        id="cta-titulo"
        lines={["¿Tienes algún", "proyecto en mente?"]}
        className={styles.ctaTitle}
      />
      <Reveal as="p" preset="fade" delay={0.3} className={styles.ctaSubtitle}>
        Podemos ayudarte. ¡Conversemos!
      </Reveal>
      <div className={styles.ctaActions}>
        <Reveal preset="fade" delay={0.4}>
          <a href="#contacto" className={styles.circle} data-cursor-magnetic="">
            <span>Contáctanos</span>
            <Reveal as="span" preset="stroke" delay={0.8} className={styles.circleArrow}>
              <svg viewBox="0 0 24 40" aria-hidden="true" focusable="false">
                <path d="M12 2v34M3 27l9 9 9-9" />
              </svg>
            </Reveal>
          </a>
        </Reveal>
        {BEHANCE_URL ? (
          <Reveal preset="fade" delay={0.5}>
            <a href={BEHANCE_URL} className={styles.pill} target="_blank" rel="noopener">
              Ver más en Behance
            </a>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function ContactSection({ area }: { area: AreaContent }) {
  return (
    <section id="contacto" className={styles.contact} aria-labelledby="contacto-titulo">
      <AccentRule size="md" className={styles.ruleThin} />
      <SplitText as="h2" by="words" id="contacto-titulo" className={styles.contactTitle}>
        Contáctanos
      </SplitText>
      <Reveal className={styles.contactCard}>
        <AreaContactForm slug={area.slug} />
      </Reveal>
    </section>
  );
}

/**
 * Página de servicio por área según el Figma "SERVICIOS" (Branding / Architecture;
 * Audiovisual y Web Design reutilizan la misma estructura):
 * hero, ¿Qué hacemos? con Valores y Alcance, galería, Metodología, ¿Qué
 * entregamos?, equipo, CTA y formulario de contacto en la misma página.
 *
 * El acento del área (`data-accent` en la ruta) solo tiñe elementos gráficos:
 * filetes, círculos, indicador del carrusel, pills, el círculo del CTA, el "+"
 * de las cifras y el botón de envío. El texto de cuerpo queda en grises.
 */
export function AreaPage({ area }: { area: AreaContent }) {
  return (
    <>
      <PublicHeader tone="light" />
      <main id="contenido" className={styles.page} data-area={area.slug}>
        <HeroSection area={area} />
        <WhatSection area={area} />
        <GallerySection area={area} />
        <MethodSection area={area} />
        <DeliverablesSection area={area} />
        <TeamSection area={area} />
        <CtaSection />
        <ContactSection area={area} />
      </main>
      <PublicFooter />
    </>
  );
}
