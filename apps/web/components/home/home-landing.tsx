import Image from "next/image";
import { Button, Counter, Parallax, Reveal, SplitText } from "@studionomade/ui";
import {
  HOME_CONTACT,
  HOME_HERO_SLIDES,
  HOME_INSTAGRAM,
  HOME_MANIFESTO,
  HOME_MEETING,
  HOME_OFFICES,
  HOME_POSTS,
  HOME_REEL,
  reelEmbedUrl
} from "../../content/home";
import { HomeAreas } from "./home-areas";
import { HomeHero } from "./home-hero";
import { ReelPlayer } from "./reel-player";
import styles from "./home-landing.module.css";

/** Órbita del manifiesto (rescatada de la home anterior); se dibuja al entrar. */
function Orbit() {
  return (
    <svg className={styles.orbit} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <path d="M10 75 Q120 -10 230 75 Q120 160 10 75Z" />
      <path d="M40 75 Q120 20 200 75 Q120 130 40 75Z" />
      <circle cx="120" cy="75" r="26" />
    </svg>
  );
}

/** Plano esquemático (decorativo): calles y un pin. Sin mapas de terceros. */
function MapSketch({ variant }: { variant: number }) {
  return (
    <svg
      className={styles.mapSketch}
      viewBox="0 0 320 200"
      aria-hidden="true"
      focusable="false"
      data-variant={variant}
    >
      {variant === 0 ? (
        <>
          <path d="M-10 128 L330 76" />
          <path d="M-10 160 L330 108" />
          <path d="M70 -10 L120 210" />
          <path d="M210 -10 L250 210" />
          <path d="M0 40 Q160 70 330 20" />
        </>
      ) : (
        <>
          <path d="M-10 60 L330 96" />
          <path d="M-10 150 L330 170" />
          <path d="M150 -10 L130 210" />
          <path d="M260 -10 Q220 100 280 210" />
          <path d="M30 -10 L60 210" />
        </>
      )}
      <circle
        className={styles.mapPin}
        cx={variant === 0 ? 166 : 140}
        cy={variant === 0 ? 100 : 82}
        r="7"
      />
      <circle cx={variant === 0 ? 166 : 140} cy={variant === 0 ? 100 : 82} r="18" />
    </svg>
  );
}

/** Titular de sección de la home: una palabra a todo el ancho, por letras. */
function Masthead({
  children,
  id,
  className
}: {
  children: string;
  id: string;
  className?: string;
}) {
  return (
    <SplitText
      as="h2"
      by="chars"
      id={id}
      className={[styles.masthead, className].filter(Boolean).join(" ")}
    >
      {children}
    </SplitText>
  );
}

export function HomeLanding() {
  const reelEmbed = HOME_REEL.reelUrl ? reelEmbedUrl(HOME_REEL.reelUrl) : null;

  return (
    <main id="inicio" className={styles.page}>
      <h1 className={styles.srOnly}>Studio Nomade</h1>

      <HomeHero slides={HOME_HERO_SLIDES} />

      {/* ---- Creative Movement ---- */}
      <section id="creative-movement" className={styles.manifesto} aria-labelledby="home-movement">
        <Masthead id="home-movement" className={styles.movementTitle}>
          {HOME_MANIFESTO.title}
        </Masthead>
        <div className={styles.manifestoGrid}>
          <Reveal preset="stroke" className={styles.orbitWrap}>
            <Orbit />
          </Reveal>
          <div className={styles.manifestoCopy}>
            <SplitText as="p" className={styles.lead}>
              {HOME_MANIFESTO.lead}
            </SplitText>
            <Reveal as="p" className={styles.body} step={2}>
              {HOME_MANIFESTO.body}
            </Reveal>
            <dl className={styles.stats}>
              {HOME_MANIFESTO.stats.map((stat, index) => (
                <Reveal className={styles.stat} key={stat.label} step={3 + index}>
                  <dt>{stat.label}</dt>
                  <dd>
                    <Counter to={stat.value} prefix={stat.prefix} />
                  </dd>
                </Reveal>
              ))}
            </dl>
            <Reveal className={styles.manifestoCta} step={5}>
              <span className={styles.magnet} data-cursor-magnetic="">
                <Button href={HOME_MANIFESTO.cta.href} variant="outline" size="md">
                  {HOME_MANIFESTO.cta.label}
                </Button>
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Áreas ---- */}
      <HomeAreas />

      {/* ---- Agendemos una reunión ---- */}
      <section className={styles.meeting} aria-labelledby="home-reunion">
        <Parallax className={styles.meetingMedia} y={0.12} scaleFrom={1.15} clip aria-hidden="true">
          <Image src={HOME_MEETING.image.src} alt="" fill sizes="100vw" />
        </Parallax>
        <div className={styles.meetingShade} aria-hidden="true" />
        <div className={styles.meetingContent}>
          <Reveal as="span" preset="headline" className={styles.rule} aria-hidden="true" />
          <Reveal as="p" className={styles.meetingKicker} preset="fade">
            {HOME_MEETING.kicker}
          </Reveal>
          <SplitText
            as="h2"
            by="lines"
            lines={[...HOME_MEETING.lines]}
            className={styles.meetingTitle}
            id="home-reunion"
          />
          <Reveal step={3}>
            {/* El imán mueve el envoltorio: Button no expone atributos `data-*`. */}
            <span className={styles.magnet} data-cursor-magnetic="">
              <Button href={HOME_MEETING.href} variant="invert" size="md">
                {HOME_MEETING.cta}
              </Button>
            </span>
          </Reveal>
        </div>
      </section>

      {/* ---- Reel ---- */}
      <section className={styles.reel} aria-labelledby="home-reel">
        <div className={styles.sectionHead}>
          <Masthead id="home-reel">{HOME_REEL.title}</Masthead>
          <Reveal as="p" className={styles.sectionNote} step={2}>
            Showreel Studio Nomade
          </Reveal>
        </div>
        <div className={styles.reelFrame}>
          <Reveal preset="mask" direction="up" className={styles.reelMask}>
            <Parallax className={styles.reelParallax} y={0.1}>
              <Image
                src={HOME_REEL.poster.src}
                alt={HOME_REEL.poster.alt}
                fill
                sizes="(min-width: 64em) 86vw, 100vw"
              />
            </Parallax>
          </Reveal>
          {reelEmbed ? <ReelPlayer embedUrl={reelEmbed} title="Reel de Studio Nomade" /> : null}
        </div>
      </section>

      {/* ---- Instagram ---- */}
      <section className={styles.instagram} aria-labelledby="home-instagram">
        <div className={styles.sectionHead}>
          <Masthead id="home-instagram">{HOME_INSTAGRAM.title}</Masthead>
          <Reveal as="p" className={styles.sectionNote} step={2}>
            <a
              href={HOME_INSTAGRAM.href}
              className={styles.textLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Síguenos en {HOME_INSTAGRAM.handle}
            </a>
          </Reveal>
        </div>
        <ul className={styles.socialGrid}>
          {HOME_INSTAGRAM.images.map((image, index) => (
            <li
              className={styles.socialTile}
              key={image.src}
              data-featured={index === 2 || undefined}
            >
              <Reveal preset="mask" direction="up" step={index} className={styles.socialMask}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={
                    index === 2 ? "(min-width: 48em) 40vw, 100vw" : "(min-width: 48em) 20vw, 50vw"
                  }
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Últimas publicaciones ---- */}
      <section id="blog" className={styles.blog} aria-labelledby="home-blog">
        <div className={styles.blogHead}>
          <Reveal as="span" preset="headline" className={styles.rule} aria-hidden="true" />
          <SplitText
            as="h2"
            by="lines"
            lines={["Últimas publicaciones"]}
            className={styles.blogTitle}
            id="home-blog"
          />
        </div>
        {HOME_POSTS.map((post) => (
          <article className={styles.post} key={post.title}>
            <Reveal preset="mask" direction="left" className={styles.postMedia}>
              <Image
                src={post.image.src}
                alt={post.image.alt}
                fill
                sizes="(min-width: 64em) 55vw, 100vw"
              />
            </Reveal>
            <Reveal className={styles.postBody} step={2}>
              <time dateTime={post.date}>{post.dateLabel}</time>
              <h3>{post.title}</h3>
              <ul className={styles.tags} aria-label="Temas">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </Reveal>
          </article>
        ))}
      </section>

      {/* ---- Contacto: el formulario vive en /contacto ---- */}
      <section id="contacto" className={styles.contact} aria-labelledby="home-contacto">
        <div className={styles.contactHead}>
          <Masthead id="home-contacto">{HOME_CONTACT.title}</Masthead>
          <Reveal as="p" className={styles.contactLead} step={2}>
            {HOME_CONTACT.lead}
          </Reveal>
        </div>
        <Reveal className={styles.contactActions} step={3}>
          <span className={styles.magnet} data-cursor-magnetic="">
            <Button href={HOME_CONTACT.primary.href} variant="outline" size="md">
              {HOME_CONTACT.primary.label}
            </Button>
          </span>
          <Button href={HOME_CONTACT.secondary.href} variant="ghost" size="md">
            {HOME_CONTACT.secondary.label}
          </Button>
        </Reveal>
      </section>

      {/* ---- Oficinas ---- */}
      <section className={styles.offices} aria-labelledby="home-oficinas">
        <h2 id="home-oficinas" className={styles.srOnly}>
          Oficinas
        </h2>
        {HOME_OFFICES.map((office, index) => (
          <Reveal as="article" className={styles.office} key={office.name} step={index}>
            <Reveal preset="stroke" className={styles.map}>
              <MapSketch variant={index} />
            </Reveal>
            <h3>{office.name}</h3>
            <address>
              {office.address}, {office.detail}
              <br />
              {office.commune}
            </address>
            <a
              className={styles.textLink}
              href={office.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Cómo llegar<span className={styles.srOnly}> a {office.name} (Google Maps)</span>
            </a>
          </Reveal>
        ))}
      </section>
    </main>
  );
}
