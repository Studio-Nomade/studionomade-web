"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { MenuToggle } from "@studionomade/ui";
import { submitContactLead } from "../../app/actions";
import { CURRENT_LEAD_CONSENT_VERSION, LEAD_CONSENTS } from "../../content/legal/consentimientos";
import styles from "./home-landing.module.css";

const services = [
  { name: "AUDIOVISUAL", kind: styles.audiovisual, symbol: 2, href: null },
  { name: "BRANDING", kind: styles.branding, symbol: 1, href: "/areas/branding" },
  {
    name: "ARCHITECTURE",
    kind: styles.architecture,
    symbol: 3,
    href: "/areas/architecture"
  },
  { name: "WEB DESIGN", kind: styles.web, symbol: 4, href: null }
];
const socialImages = [
  "/home/branding-project-1.webp",
  "/home/mockup-nexa.webp",
  "/home/branding-collateral-1.webp",
  "/home/branding-project-2.webp",
  "/home/branding-project-3.webp"
];

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className={styles.header}>
      <a href="#inicio" className={styles.wordmark}>
        STUDIO NOMADE
      </a>
      <MenuToggle label="Menu" invert onClick={onMenu} aria-label="Abrir menú" />
    </header>
  );
}

function Orbit({ variant }: { variant: number }) {
  return (
    <svg className={styles.orbit} data-variant={variant} viewBox="0 0 240 150" aria-hidden="true">
      {variant === 1 && (
        <>
          <path d="M10 75 Q120 -10 230 75 Q120 160 10 75Z" />
          <circle className={styles.orbitFill} cx="120" cy="75" r="26" />
        </>
      )}
      {variant === 2 && (
        <>
          <path d="M20 50 H210 M70 95 H230" />
          <rect
            className={styles.orbitFill}
            x="60"
            y="32"
            width="36"
            height="36"
            transform="rotate(45 78 50)"
          />
          <circle className={styles.orbitFill} cx="120" cy="95" r="24" />
        </>
      )}
      {variant === 3 && (
        <>
          <circle cx="120" cy="82" r="58" />
          <circle className={styles.orbitFill} cx="120" cy="82" r="20" />
          <circle className={styles.orbitFill} cx="123" cy="24" r="7" />
        </>
      )}
      {variant === 4 && (
        <>
          <rect x="58" y="18" width="124" height="118" rx="20" />
          <path d="M58 56 H182 M76 36 H92 M106 35 H164" />
        </>
      )}
    </svg>
  );
}

function ContactForm() {
  const [state, action] = useActionState(submitContactLead, null);
  const [token, setToken] = useState<{ t: string; signature: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/contacto/token", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data?.t && data?.signature) setToken(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const fieldError = (name: string) =>
    state?.success === false ? state.fieldErrors?.[name]?.[0] : undefined;

  if (state?.success) {
    return (
      <p className={styles.formSuccess} role="status">
        Gracias por escribirnos. Te contactaremos pronto.
      </p>
    );
  }

  return (
    <form action={action} className={styles.contactForm} noValidate>
      <label>
        <span>Nombre y apellido</span>
        <input name="name" placeholder="Escribe acá tu nombre y apellido*" required minLength={2} />
      </label>
      <label>
        <span>Correo</span>
        <input name="email" type="email" placeholder="Escribe acá tu correo*" required />
      </label>
      <label>
        <span>Número</span>
        <input name="phone" placeholder="Escribe acá tu número" />
      </label>
      <label>
        <span>Empresa</span>
        <input name="company" placeholder="Escribe acá tu empresa" />
      </label>
      <label className={styles.message}>
        <span>Mensaje</span>
        <textarea name="message" placeholder="Escribe acá tu mensaje" />
      </label>
      <label className={styles.consent}>
        <input type="checkbox" name="consentimiento" required />
        <span>{LEAD_CONSENTS[CURRENT_LEAD_CONSENT_VERSION]}</span>
      </label>
      <input
        type="text"
        name="empresa_web"
        className={styles.honeypot}
        aria-label="Empresa web"
        tabIndex={-1}
        autoComplete="off"
      />
      <input type="hidden" name="form_slug" value="contacto-general" />
      <input type="hidden" name="consent_version" value={CURRENT_LEAD_CONSENT_VERSION} />
      <input type="hidden" name="origin_type" value="contacto" />
      <input type="hidden" name="origin_slug" value="home" />
      <input type="hidden" name="source_path" value="/" />
      <input type="hidden" name="t" value={token?.t ?? ""} />
      <input type="hidden" name="t_signature" value={token?.signature ?? ""} />
      {fieldError("email") && <p className={styles.formError}>{fieldError("email")}</p>}
      {state?.success === false && <p className={styles.formError}>{state.message}</p>}
      <button type="submit">ENVIAR</button>
    </form>
  );
}

export function HomeLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main id="inicio" className={styles.page}>
      <h1 className={styles.srOnly}>Studio Nomade</h1>
      <Header onMenu={() => setMenuOpen(true)} />
      <section className={styles.hero}>
        <Image
          src="/home/cinnalove-hero-1.webp"
          alt="Proyecto editorial de Studio Nomade"
          fill
          priority
          sizes="100vw"
        />
      </section>

      <section id="nosotros" className={styles.movement}>
        <h2>MOVEMENT</h2>
        <div className={styles.movementGrid}>
          <Orbit variant={1} />
          <div className={styles.introCopy}>
            <p>Somos un estudio enfocado en la comunicación asertiva y la creatividad.</p>
            <p>
              Buscamos trabajar en conjunto con personas que desean llevar sus ideas y expresiones a
              resoluciones, respuestas e identidades auténticas.
            </p>
          </div>
        </div>
      </section>

      <section id="servicios" className={styles.services}>
        <h2>SERVICIOS</h2>
        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article className={`${styles.service} ${service.kind}`} key={service.name}>
              {service.href ? (
                <Link href={service.href} aria-label={`Ver área ${service.name}`}>
                  <Orbit variant={service.symbol} />
                  <span>{service.name} •</span>
                </Link>
              ) : (
                <>
                  <Orbit variant={service.symbol} />
                  <span>{service.name} •</span>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.meeting}>
        <Image src="/home/cinnalove-banner-1.webp" alt="" fill sizes="90vw" />
        <div className={styles.mediaShade} />
        <div className={styles.meetingContent}>
          <span className={styles.shortRule} />
          <p>¿Tienes un proyecto en mente?</p>
          <h2>Agendemos una reunión</h2>
          <a href="#contacto">Agenda una reunión</a>
        </div>
      </section>

      <section className={styles.reel}>
        <h2>REEL</h2>
        <div className={styles.reelMedia}>
          <Image
            src="/home/arch-1.webp"
            alt="Proyecto audiovisual de Studio Nomade"
            fill
            sizes="85vw"
          />
          <button type="button" aria-label="Reproducir reel">
            ▶
          </button>
        </div>
      </section>

      <section className={styles.instagram}>
        <h2>INSTAGRAM</h2>
        <div className={styles.socialGrid}>
          {socialImages.map((src, index) => (
            <div className={styles.socialTile} key={src} data-featured={index === 2 || undefined}>
              <Image
                src={src}
                alt="Publicación de Studio Nomade"
                fill
                sizes="(max-width: 48em) 50vw, 30vw"
              />
            </div>
          ))}
        </div>
      </section>

      <section id="blog" className={styles.blog}>
        <span className={styles.shortRule} />
        <h2>Últimas publicaciones</h2>
        <article className={styles.articleCard}>
          <Image
            src="/home/branding-project-1.webp"
            alt="Mesa de trabajo de diseño"
            fill
            sizes="80vw"
          />
          <div className={styles.mediaShade} />
          <time dateTime="2025-11-26">26 Nov 2025</time>
          <div>
            <h3>Guía: Paso a paso para crear un sitio web efectivo</h3>
            <p>
              Empresas Emergentes&nbsp; / &nbsp;Ecommerce&nbsp; / &nbsp;Web Design&nbsp; /
              &nbsp;Desarrollo Web
            </p>
          </div>
        </article>
      </section>

      <section id="contacto" className={styles.contact}>
        <Image src="/home/branding-collateral-1.webp" alt="" fill sizes="100vw" />
        <div className={styles.mediaShade} />
        <div className={styles.contactInner}>
          <h2>CONTACTO</h2>
          <ContactForm />
        </div>
      </section>

      <section className={styles.locations}>
        <article>
          <p>Avenida Providencia 1208. Of. 207</p>
          <h2>Oficina Principal</h2>
          <div className={styles.map}>
            Providencia
            <br />
            Santiago
          </div>
        </article>
        <article>
          <p>Santa Beatriz 100. Of. 1101</p>
          <h2>Estudio Fotográfico</h2>
          <div className={styles.map}>
            Santa Beatriz
            <br />
            Providencia
          </div>
        </article>
      </section>

      <footer className={styles.footer}>
        <p className={styles.tagline}>
          Nos movemos en manada
          <br />
          Santiago | Madrid
        </p>
        <div className={styles.footerGrid}>
          <Image src="/home/logo-mark-white.png" alt="Studio Nomade" width={140} height={140} />
          <div>
            <strong>Studio</strong>
            <p>
              Santa Beatriz 100
              <br />
              Oficina 1101
              <br />
              Providencia
            </p>
          </div>
          <div>
            <strong>Contacto</strong>
            <p>
              contact@studionomade.cl
              <br />
              +569 34045111
              <br />
              +569 34045134
            </p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 Studio Nomade - Todos los derechos reservados</span>
          <span>in &nbsp; v &nbsp; ◎ &nbsp; @</span>
        </div>
      </footer>

      {menuOpen && (
        <div
          className={styles.menuOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Navegación principal"
        >
          <button type="button" className={styles.closeMenu} onClick={() => setMenuOpen(false)}>
            Salir&nbsp; ×
          </button>
          <nav>
            <a href="#inicio" onClick={() => setMenuOpen(false)}>
              Inicio
            </a>
            <a href="#nosotros" onClick={() => setMenuOpen(false)}>
              <small>01 | ¿Quiénes somos?</small>Nosotros
            </a>
            <a href="#servicios" onClick={() => setMenuOpen(false)}>
              <small>02 | ¿Qué hacemos?</small>Servicios
            </a>
            <a href="#contacto" onClick={() => setMenuOpen(false)}>
              <small>03 | ¿Dónde estamos?</small>Contacto
            </a>
            <a href="#blog" onClick={() => setMenuOpen(false)}>
              <small>04 | Últimas Publicaciones</small>Blog
            </a>
          </nav>
        </div>
      )}
    </main>
  );
}
