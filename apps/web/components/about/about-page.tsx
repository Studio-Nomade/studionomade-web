import Image from "next/image";
import Link from "next/link";
import { Parallax, Reveal, SplitText, StrokeNumber } from "@studionomade/ui";

import { ABOUT, type AboutImage } from "../../content/about";
import { AREA_BY_SLUG, STUDIO_AREAS } from "../../content/area-meta";
import { initials, TEAM, type StudioTeamMember } from "../../content/team";
import { PublicPage } from "../public/public-shell";
import { LocationClocks } from "./location-clocks";
import styles from "./about-page.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** Filete corto que crece desde el centro al entrar. */
function Rule() {
  return <Reveal as="span" preset="headline" aria-hidden="true" className={styles.rule} />;
}

function MaskedImage({
  image,
  sizes,
  priority,
  className
}: {
  image: AboutImage;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Reveal preset="mask" className={[styles.media, className].filter(Boolean).join(" ")}>
      <Parallax y={0.05} clip className={styles.parallax}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} />
      </Parallax>
    </Reveal>
  );
}

function BlockHeading({ id, title, lead }: { id: string; title: string; lead?: string }) {
  return (
    <div className={styles.heading}>
      <SplitText as="h2" id={id} className={styles.h2}>
        {title}
      </SplitText>
      {lead ? (
        <Reveal as="p" preset="fade" delay={0.2} className={styles.headingLead}>
          {lead}
        </Reveal>
      ) : null}
    </div>
  );
}

function HeroSection() {
  const { hero } = ABOUT;
  return (
    <section className={styles.hero} aria-labelledby="nosotros-titulo">
      <Reveal as="p" preset="fade" className={styles.eyebrow}>
        {hero.eyebrow}
      </Reveal>
      <SplitText as="h1" by="chars" id="nosotros-titulo" className={styles.heroTitle}>
        {hero.title}
      </SplitText>
      <SplitText as="p" delay={0.3} className={styles.statement}>
        {hero.statement}
      </SplitText>
      <MaskedImage
        image={hero.image}
        sizes="(max-width: 48em) 100vw, 90vw"
        priority
        className={styles.heroMedia}
      />
    </section>
  );
}

function FoundationSection() {
  const { foundation } = ABOUT;
  return (
    <section className={styles.foundation} aria-labelledby="fundamento">
      <div className={styles.split}>
        <SplitText as="h2" id="fundamento" className={styles.h2}>
          {foundation.title}
        </SplitText>
        <Reveal as="p" className={styles.lead}>
          {foundation.lead}
        </Reveal>
      </div>

      <div className={styles.split}>
        <Reveal as="h3" className={styles.h3}>
          {foundation.pack.title}
        </Reveal>
        <Reveal as="p" step={1} className={styles.body}>
          {foundation.pack.text}
        </Reveal>
      </div>

      <ol className={styles.pillars} aria-label="Lo que integramos">
        {foundation.pillars.map((pillar, index) => (
          <Reveal as="li" key={pillar.title} step={index} className={styles.pillar}>
            <span className={styles.pillarIndex} aria-hidden="true">
              {pad(index + 1)}
            </span>
            <h4 className={styles.pillarTitle}>{pillar.title}</h4>
            <p className={styles.pillarText}>{pillar.text}</p>
          </Reveal>
        ))}
      </ol>

      <div className={styles.gallery}>
        {foundation.images.map((image) => (
          <MaskedImage key={image.src} image={image} sizes="(max-width: 48em) 100vw, 50vw" />
        ))}
      </div>
    </section>
  );
}

function LocationsSection() {
  const { locations } = ABOUT;
  return (
    <section className={styles.locations} aria-labelledby="ubicaciones">
      <BlockHeading id="ubicaciones" title={locations.title} lead={locations.lead} />
      <Reveal>
        <LocationClocks locations={locations.items} />
      </Reveal>
    </section>
  );
}

function AreasSection() {
  const { areas } = ABOUT;
  return (
    <section className={styles.areas} aria-labelledby="areas">
      <BlockHeading id="areas" title={areas.title} lead={areas.lead} />
      <ul className={styles.areaGrid}>
        {STUDIO_AREAS.map((area, index) => (
          <Reveal as="li" key={area.slug} step={index} data-accent={area.accent}>
            <Link href={area.href} className={styles.areaCard}>
              <Image
                src={area.symbol}
                alt=""
                width={256}
                height={256}
                sizes="5rem"
                className={styles.areaSymbol}
              />
              <span className={styles.areaCode} aria-hidden="true">
                {area.code}
              </span>
              <span className={styles.areaName}>{area.name}</span>
              <span className={styles.areaText}>{areas.descriptions[area.slug]}</span>
              <span className={styles.areaMore} aria-hidden="true">
                Ver área
                <svg viewBox="0 0 56 16" focusable="false">
                  <path d="M0 8h54M47 1l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function MethodSection() {
  const { method } = ABOUT;
  return (
    <section className={styles.method} aria-labelledby="metodo">
      <BlockHeading id="metodo" title={method.title} lead={method.lead} />
      <ol className={styles.steps}>
        {method.steps.map((step, index) => (
          <Reveal as="li" key={step.title} step={index} className={styles.step}>
            <StrokeNumber
              value={pad(index + 1)}
              delay={index * 0.15}
              className={styles.stepNumber}
            />
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepText}>{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/** Retrato del equipo. Sin foto, un retrato neutro con las iniciales (TODO-contenido). */
function Portrait({ member, step }: { member: StudioTeamMember; step: number }) {
  return (
    <Reveal preset="mask" step={step} className={styles.portrait}>
      {member.photo ? (
        <Image src={member.photo.src} alt={member.name} fill sizes="(max-width: 48em) 50vw, 25vw" />
      ) : (
        <span className={styles.portraitPlaceholder} aria-hidden="true">
          {initials(member.name)}
        </span>
      )}
    </Reveal>
  );
}

function TeamSection() {
  const { team } = ABOUT;
  return (
    <section className={styles.team} aria-labelledby="equipo">
      <Rule />
      <BlockHeading id="equipo" title={team.title} lead={team.lead} />
      <ul className={styles.teamGrid}>
        {TEAM.map((member, index) => (
          <li key={member.id} className={styles.member}>
            <Portrait member={member} step={index % 4} />
            <Reveal step={(index % 4) + 1}>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
              <ul className={styles.memberAreas} aria-label="Áreas">
                {member.areas.map((slug) => (
                  <li key={slug} data-accent={slug}>
                    <abbr title={AREA_BY_SLUG[slug].name}>{AREA_BY_SLUG[slug].code}</abbr>
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CtaSection() {
  const { cta } = ABOUT;
  return (
    <section className={styles.cta} aria-labelledby="cta-titulo">
      <SplitText as="h2" id="cta-titulo" lines={cta.titleLines} className={styles.ctaTitle} />
      <Reveal as="p" preset="fade" delay={0.2} className={styles.ctaText}>
        {cta.text}
      </Reveal>
      <Reveal preset="fade" delay={0.3} className={styles.ctaActions} data-cta="nosotros-cta">
        <Link href={cta.primary.href} className={styles.ctaPrimary} data-cursor-magnetic="">
          {cta.primary.label}
        </Link>
        <Link href={cta.secondary.href} className={styles.ctaSecondary}>
          {cta.secondary.label}
        </Link>
      </Reveal>
    </section>
  );
}

/**
 * /nosotros: declaración, fundamento, ubicaciones con hora local, áreas,
 * método, equipo completo y CTA a contacto.
 */
export function AboutPage() {
  return (
    <PublicPage headerTone="light">
      <div className={styles.page}>
        <HeroSection />
        <FoundationSection />
        <LocationsSection />
        <AreasSection />
        <MethodSection />
        <TeamSection />
        <CtaSection />
      </div>
    </PublicPage>
  );
}
