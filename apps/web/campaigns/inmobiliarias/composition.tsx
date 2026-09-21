import Image from "next/image";
import { Button, CampaignHero, Circled, Footer, Mark, Section, StepFlow } from "@studionomade/ui";
import type { CampaignCompositionProps } from "../types";
import { inmobiliariasAssets as assets } from "./assets";
import { CampaignForm } from "./form";
import styles from "./composition.module.css";

export function InmobiliariasComposition(props: CampaignCompositionProps) {
  const { content } = props;
  return (
    <main className={styles.page}>
      <CampaignHero
        eyebrow={content.hero.eyebrow}
        highlight={content.hero.highlight}
        title={content.hero.title}
        height="35rem"
        texture={<Image src={assets.texture} alt="" fill sizes="100vw" priority unoptimized />}
        art={<Image src={assets.building} alt="" sizes="(max-width: 48rem) 100vw, 55vw" priority />}
      />

      <Section>
        <div className={styles.introGrid}>
          <Image src={assets.megaphoneSmall} alt="" sizes="(max-width: 48rem) 100vw, 40vw" />
          <h2 className={styles.displayLarge}>
            En una <Circled>{content.claims[0].text}</Circled>
            <br />
            donde todo se parece,
            <br />
            hacemos que tu proyecto
            <br />
            <Mark>{content.claims[1].text}</Mark>
          </h2>
        </div>
        <div className={styles.pitchGrid}>
          <p className={styles.lead}>
            Construimos marcas <strong>inmobiliarias</strong> que se diferencian y mantienen una
            dirección coherente en cada punto de contacto.
          </p>
          <div className={styles.centeredCta}>
            <Button href="#form" accent size="lg">
              Agendar conversación
            </Button>
            <p className={styles.caption}>Cuéntanos en qué etapa estás.</p>
          </div>
        </div>
      </Section>

      <Section tone="alt" tight>
        <div className={styles.problemGrid}>
          <div>
            <h2 className={styles.displayMedium}>
              Un buen proyecto
              <br />
              <Mark>{content.claims[2].text}</Mark>
              <br />
              si se comunica
              <br />
              <Circled>{content.claims[3].text}</Circled>
            </h2>
            <div className={styles.problemCopy}>
              <p>
                Cuando la <strong>marca</strong>, las <strong>campañas</strong>, la{" "}
                <strong>web</strong> y la <strong>venta</strong> avanzan por separado, el valor del
                proyecto se diluye.
              </p>
              <p className={styles.uppercase}>No se trata de generar más piezas.</p>
              <p className={styles.strong}>
                Se trata de construir una diferencia y hacer que se reconozca en todas partes.
              </p>
            </div>
          </div>
          <Image src={assets.building} alt="" sizes="(max-width: 48rem) 100vw, 45vw" />
        </div>
      </Section>

      <div className={styles.renders}>
        <Image
          src={assets.renders}
          alt="Aplicaciones de marca inmobiliaria"
          sizes="100vw"
          priority
        />
      </div>

      <Section>
        <div className={styles.systemGrid}>
          <p className={styles.systemCopy}>
            En <strong>Studio Nomade</strong> encontramos la idea que hace diferente a tu proyecto y
            la convertimos en un sistema capaz de sostener toda su comunicación.
          </p>
          <h2 className={styles.displayMedium}>
            Una idea clara.
            <br />
            Una marca que la sostiene.
          </h2>
        </div>
        <div className={styles.steps}>
          <StepFlow steps={content.steps} footline={content.footline} />
        </div>
        <div className={styles.claims}>
          {content.claims.slice(4).map((claim) => (
            <span key={claim.text}>{claim.text}</span>
          ))}
        </div>
        <div className={styles.finalCta}>
          <Button href="#form" accent size="lg">
            Quiero diferenciar mi proyecto
          </Button>
        </div>
      </Section>

      <section id="form" className={styles.formSection}>
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
          sizes="(max-width: 48rem) 75vw, 55vw"
        />
        <div className={styles.formInner}>
          <span className={styles.badge}>{content.form.badge}</span>
          <h2 className={styles.formHeading}>{content.form.heading}</h2>
          <CampaignForm {...props} content={content.form} />
        </div>
      </section>

      <Footer
        logoSrc={assets.logo.src}
        columns={[
          {
            title: "Studio",
            items: [
              { label: "Santa Beatriz 100" },
              { label: "Oficina 1101" },
              { label: "Providencia" }
            ]
          },
          {
            title: "Contacto",
            items: [
              { label: "contact@studionomade.cl", href: "mailto:contact@studionomade.cl" },
              { label: "+569 34045111", href: "tel:+56934045111" }
            ]
          }
        ]}
        social={[
          { kind: "linkedin", href: "#" },
          { kind: "vimeo", href: "#" },
          { kind: "instagram", href: "#" },
          { kind: "email", href: "#" }
        ]}
      />
    </main>
  );
}
