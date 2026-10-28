"use client";

import { useEffect, useState } from "react";
import { ChatIcon } from "./icons";
import styles from "./composition.module.css";

interface MobileCtaBarProps {
  /** Selector de los bloques que, visibles, ocultan la barra (CTAs del hero y formulario). */
  watch: string;
  formHref: string;
  whatsappHref: string;
  label: string;
}

/**
 * Barra fija inferior en móvil: «Cotizar» + WhatsApp. Solo aparece cuando ni los
 * CTAs del hero ni el formulario están a la vista, así que nunca tapa el
 * formulario ni duplica el CTA principal. Sin JavaScript no se muestra (es una
 * mejora: los CTAs del contenido siguen ahí). Oculta, sale del orden de
 * tabulación y del árbol de accesibilidad (`visibility: hidden`).
 */
export function MobileCtaBar({ watch, formHref, whatsappHref, label }: MobileCtaBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = [...document.querySelectorAll(watch)];
    if (!targets.length || !("IntersectionObserver" in window)) return;
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setVisible(onScreen.size === 0);
    });
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [watch]);

  return (
    <nav
      className={styles.mobileBar}
      aria-label="Acciones rápidas"
      data-visible={visible || undefined}
      data-testid="barra-cta-movil"
    >
      <span className={styles.mobileBarPrimary} data-cta="barra-movil-cotizar">
        <a href={formHref}>{label}</a>
      </span>
      <a
        className={styles.mobileBarWhatsapp}
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ChatIcon className={styles.icon} />
        WhatsApp
      </a>
    </nav>
  );
}
