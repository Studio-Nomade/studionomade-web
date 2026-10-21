import Image from "next/image";
import { Button, Counter, Parallax, Reveal, SplitText } from "@studionomade/ui";
import {
  HOME_CONTACT,
  HOME_HERO_SLIDES,
  HOME_INSTAGRAM,
  HOME_MANIFESTO,
  HOME_MEETING,
  HOME_POSTS
} from "../../content/home";
import { HomeAreas } from "./home-areas";
import { HomeHero } from "./home-hero";
import { InstagramFeed } from "./instagram-feed";
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
        <InstagramFeed headingId="home-instagram" />
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
    </main>
  );
}
