import Image from "next/image";
import {
  Button,
  Circled,
  Counter,
  Mark,
  Parallax,
  Reveal,
  SplitText,
  StrokeNumber
} from "@studionomade/ui";
import { PublicFooter } from "../../components/public/public-footer";
import type { CampaignCompositionProps } from "../types";
import { inmobiliariasAssets as assets, inmobiliariasCaseImages as caseImages } from "./assets";
import { inmobiliariasLanding as landing } from "./content";
import { CampaignForm } from "./form";
import { AsteriskMark, ChatIcon } from "./icons";
import { MobileCtaBar } from "./mobile-cta-bar";
import { whatsappHref } from "./whatsapp";
import styles from "./composition.module.css";

const FORM_HREF = "#form";
const pad = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Enlace a WhatsApp. Va SIEMPRE fuera de un contenedor `data-cta`: así el
 * clasificador lo mide como `contact_click` → `Contact` en Meta.
 */
function WhatsappLink({
  href,
  className,
  children
}: {
  href: string;
  className: string;
  children: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      <ChatIcon className={styles.icon} />
      {children}
    </a>
  );
}

/** CTA principal: el `data-cta` envuelve solo al botón (los componentes de UI no aceptan props extra). */
function QuoteButton({ cta, children }: { cta: string; children: string }) {
  return (
    <span className={styles.ctaSlot} data-cta={cta}>
      <Button href={FORM_HREF} accent size="lg">
        {children}
      </Button>
    </span>
  );
}

export function InmobiliariasComposition(props: CampaignCompositionProps) {
  const { content } = props;
  const whatsapp = whatsappHref(landing.whatsapp.phone, landing.whatsapp.message);
  const { hero } = landing;

  return (
    <main className={styles.page}>
      {/* 1 · Hero: propuesta de valor + CTAs visibles sin scroll (390 y 1440). */}
      <section className={styles.hero} aria-labelledby="landing-title">
        <Image
          className={styles.heroTexture}
          src={assets.texture}
          alt=""
          fill
          sizes="100vw"
          priority
          unoptimized
        />
        <div className={styles.topbar}>
          <span className={styles.brand}>
            <Image className={styles.brandMark} src={assets.logo} alt="" sizes="3rem" />
            Studio Nomade
          </span>
          <div className={styles.topbarActions}>
            <WhatsappLink href={whatsapp} className={styles.topbarLink}>
              WhatsApp
            </WhatsappLink>
            <span className={styles.ctaSlot} data-cta="cabecera-cotizar">
              <Button href={FORM_HREF} variant="invert" size="sm">
                Cotizar
              </Button>
            </span>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>
              <AsteriskMark className={styles.eyebrowMark} />
              {hero.eyebrow}
            </p>
            {/* Sin pre-ocultado por JS: el titular es candidato a LCP y se anima solo con CSS. */}
            <h1 id="landing-title" className={styles.heroTitle}>
              {hero.titleLines.map((line, index) => (
                <span key={line} className={styles.heroLine} data-line={index}>
                  {line}{" "}
                </span>
              ))}
              <span className={styles.heroLine} data-line={hero.titleLines.length}>
                <Mark>{hero.titleMark}</Mark>
              </span>
            </h1>
            <p className={styles.heroLead}>{hero.lead}</p>
            <div className={styles.heroActions} data-hero-ctas="">
              <QuoteButton cta="agendar-conversacion">{hero.primaryCta}</QuoteButton>
              <WhatsappLink href={whatsapp} className={styles.whatsappButton}>
                {hero.secondaryCta}
              </WhatsappLink>
            </div>
            <ul className={styles.heroTrust}>
              {hero.trust.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Collage por capas: cada capa tiene su propio recorrido de parallax. */}
          <div className={styles.collage}>
            <Parallax y={0.2} className={styles.collageAsterisk}>
              <AsteriskMark className={styles.spin} />
            </Parallax>
            <Parallax y={0.06} className={styles.collageRenders}>
              <Image
                src={assets.renders}
                alt="Renders de un edificio residencial con aplicaciones de marca"
                sizes="(max-width: 48em) 60vw, 26vw"
                priority
              />
            </Parallax>
            <Parallax y={0.1} className={styles.collageBuilding}>
              <Image src={assets.building} alt="" sizes="(max-width: 48em) 80vw, 38vw" priority />
            </Parallax>
            <Parallax y={0.28} className={styles.collageSticker}>
              <span>Desde el verde</span>
            </Parallax>
          </div>
        </div>
      </section>

      {/* Banda de servicios en movimiento (decorativa: los servicios se listan abajo). */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {[0, 1].map((copy) => (
            <span key={copy} className={styles.tickerGroup}>
              {hero.tags.map((tag) => (
                <span key={tag} className={styles.tickerItem}>
                  {tag}
                  <AsteriskMark className={styles.tickerMark} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* 2 · Problema / dolor. */}
      <section className={styles.problem} aria-labelledby="problema-title">
        <div className={styles.container}>
          <div className={styles.problemHead}>
            <Reveal as="h2" id="problema-title" className={styles.displayLarge}>
              Un buen proyecto <Mark>{content.claims[2].text}</Mark> si se comunica{" "}
              <Circled>{content.claims[3].text}</Circled>
            </Reveal>
            <Reveal preset="mask" direction="up" className={styles.problemArt}>
              <Image src={assets.megaphoneSmall} alt="" sizes="(max-width: 48em) 50vw, 22vw" />
            </Reveal>
          </div>
          <ol className={styles.painGrid}>
            {landing.pains.map((pain, index) => (
              <Reveal as="li" key={pain.title} step={index} className={styles.pain}>
                <span className={styles.painIndex}>{pad(index)}</span>
                <h3 className={styles.painTitle}>{pain.title}</h3>
                <p>{pain.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 · Qué hacemos. */}
      <section className={styles.services} aria-labelledby="servicios-title">
        <div className={styles.container}>
          <div className={styles.servicesHead}>
            <p className={styles.kicker}>Qué hacemos</p>
            <Reveal as="h2" id="servicios-title" className={styles.displayMedium}>
              En una <Circled>{content.claims[0].text}</Circled> donde todo se parece, hacemos que
              tu proyecto <Mark>{content.claims[1].text}</Mark>
            </Reveal>
          </div>
          <ol className={styles.serviceList}>
            {landing.services.map((service, index) => (
              <li key={service.title} className={styles.service}>
                <StrokeNumber
                  value={pad(index)}
                  delay={index * 0.08}
                  className={styles.serviceNumber}
                />
                <Reveal step={index} className={styles.serviceBody}>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p>{service.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className={styles.inlineCtas}>
            <QuoteButton cta="servicios-cotizar">{hero.primaryCta}</QuoteButton>
            <WhatsappLink href={whatsapp} className={styles.whatsappButton}>
              {hero.secondaryCta}
            </WhatsappLink>
          </div>
        </div>
      </section>

      {/* 4 · Prueba: cifras ya publicadas + casos reales del área A&D. */}
      <section className={styles.proof} aria-labelledby="prueba-title">
        <div className={styles.statsBand}>
          <div className={`${styles.container} ${styles.statsGrid}`}>
            <p className={styles.statsClaim}>
              {content.claims.slice(4).map((claim) => (
                <span key={claim.text}>{claim.text}</span>
              ))}
            </p>
            {landing.stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <Counter to={stat.value} prefix={stat.prefix} className={styles.statValue} />
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.cases}>
          <div className={styles.container}>
            <div className={styles.casesHead}>
              <SplitText
                as="h2"
                id="prueba-title"
                className={styles.displayMedium}
                lines={["Renders y espacios", "que ya están en la calle."]}
              />
              <Reveal as="p" className={styles.casesIntro}>
                Trabajo del área Architecture &amp; Design de Studio Nomade: el mismo equipo que
                diseña tu sala de ventas y tus renders.
              </Reveal>
            </div>
            <ul className={styles.caseGrid}>
              {landing.cases.map((item, index) => (
                <li
                  key={item.image}
                  className={styles.case}
                  data-wide={("wide" in item && item.wide) || undefined}
                >
                  <Reveal preset="mask" direction="up" step={index} className={styles.caseMedia}>
                    <Image
                      src={caseImages[item.image]}
                      alt={item.alt}
                      sizes={
                        "wide" in item
                          ? "(max-width: 48em) 100vw, 60vw"
                          : "(max-width: 48em) 100vw, 30vw"
                      }
                    />
                  </Reveal>
                  <p className={styles.caseCaption}>
                    <strong>{item.client}</strong>
                    <span>{item.detail}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5 · Proceso en pasos con línea de tiempo animada. */}
      <section className={styles.process} aria-labelledby="proceso-title">
        <div className={styles.container}>
          <p className={styles.kicker}>Cómo trabajamos</p>
          <SplitText
            as="h2"
            id="proceso-title"
            className={styles.displayMedium}
            lines={["Una idea clara.", "Una marca que la sostiene."]}
          />
          <div className={styles.timeline}>
            <Reveal
              preset="headline"
              direction="left"
              className={styles.timelineLine}
              aria-hidden="true"
            />
            <ol className={styles.timelineSteps}>
              {content.footline.map((label, index) => (
                <li key={label} className={styles.timelineStep}>
                  <span className={styles.timelineDot} aria-hidden="true" />
                  <StrokeNumber
                    value={pad(index)}
                    delay={0.2 + index * 0.15}
                    className={styles.timelineNumber}
                  />
                  <Reveal step={index + 1}>
                    <p className={styles.timelineLabel}>{label}</p>
                    <h3 className={styles.timelineTitle}>{content.steps[index]}</h3>
                    <p className={styles.timelineBody}>{landing.process[index]}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 6 · FAQ: <details> nativo (teclado y lector de pantalla sin JS). */}
      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={`${styles.container} ${styles.faqGrid}`}>
          <div className={styles.faqHead}>
            <p className={styles.kicker}>Preguntas frecuentes</p>
            <h2 id="faq-title" className={styles.displayMedium}>
              Antes de cotizar
            </h2>
            <p className={styles.faqAside}>
              ¿Otra duda?{" "}
              <a
                className={styles.textLink}
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escríbenos por WhatsApp
              </a>
              .
            </p>
          </div>
          <div className={styles.faqList}>
            {landing.faq.map((item, index) => (
              <details key={item.title} className={styles.faqItem} open={index === 0}>
                <summary className={styles.faqQuestion}>
                  <span>{item.title}</span>
                  <span className={styles.faqIcon} aria-hidden="true" />
                </summary>
                <p className={styles.faqAnswer}>{item.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · Formulario (contrato y medición sin cambios). */}
      <section id="form" className={styles.formSection} aria-labelledby="form-title">
        <Image
          className={styles.formTexture}
          src={assets.texture}
          alt=""
          fill
          sizes="100vw"
          unoptimized
        />
        <Image
          className={styles.formArt}
          src={assets.megaphone}
          alt=""
          sizes="(max-width: 48em) 75vw, 35vw"
        />
        <div className={styles.formInner}>
          <div className={styles.formIntro}>
            <span className={styles.badge}>{content.form.badge}</span>
            <h2 id="form-title" className={styles.formHeading}>
              {content.form.heading}
            </h2>
            <ul className={styles.formTrust}>
              {landing.form.trust.map((item) => (
                <li key={item}>
                  <AsteriskMark className={styles.trustMark} />
                  {item}
                </li>
              ))}
            </ul>
            <p className={styles.formAlt}>
              ¿Prefieres hablar ahora?{" "}
              <a
                className={styles.textLink}
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escríbenos por WhatsApp
              </a>
            </p>
          </div>
          <div className={styles.formCard}>
            <CampaignForm {...props} content={content.form} />
          </div>
        </div>
      </section>

      {/* 8 · CTA fijo en móvil: se oculta con el hero o el formulario a la vista. */}
      <MobileCtaBar
        watch="[data-hero-ctas], #form"
        formHref={FORM_HREF}
        whatsappHref={whatsapp}
        label="Cotizar"
      />

      {/* 9 · Footer del sitio, variante de campaña (sin enlaces de navegación). */}
      <div className={styles.footerWrap}>
        <PublicFooter variant="campaign" reveal={false} />
      </div>
    </main>
  );
}
