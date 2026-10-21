"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { MailIcon, WhatsAppIcon } from "@studionomade/ui";
import { DIRECT_CONTACTS } from "../../content/contact";
import styles from "./contact-dock.module.css";

/**
 * Botón flotante de contacto directo: una píldora "Contacto directo" abajo a la
 * derecha que aparece al dejar atrás el banner principal y abre los correos por
 * área y el WhatsApp comercial. La apertura es un despliegue suave desde la
 * esquina del botón. Cierra con Escape, con un clic fuera o al elegir un canal.
 */
export function ContactDock() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Visible solo fuera del banner principal: el hero marcado con
  // `data-dock-hide` (home) o, si la página no tiene uno, la primera pantalla.
  // Al final de la página se retira: el footer ya muestra contactos y redes.
  useEffect(() => {
    const check = () => {
      const viewport = window.innerHeight;
      const remaining = document.documentElement.scrollHeight - (window.scrollY + viewport);
      const banners = Array.from(document.querySelectorAll("[data-dock-hide]"));
      const overBanner = banners.length
        ? banners.some((element) => element.getBoundingClientRect().bottom > viewport * 0.35)
        : window.scrollY < viewport * 0.6;
      setHidden(overBanner || remaining < viewport * 0.18);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    // Respaldo: el scroll suave o un salto por ancla no siempre emiten "scroll".
    const timer = window.setInterval(check, 600);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={styles.dock}
      data-open={open || undefined}
      data-hidden={hidden || undefined}
    >
      <div id={panelId} className={styles.panel} role="region" aria-label="Contacto directo">
        <ul className={styles.list}>
          {DIRECT_CONTACTS.map((contact, index) => (
            <li
              key={contact.href}
              className={styles.row}
              style={{ "--dock-index": index } as CSSProperties}
            >
              <a
                className={styles.item}
                href={contact.href}
                target={contact.kind === "whatsapp" ? "_blank" : undefined}
                rel={contact.kind === "whatsapp" ? "noopener noreferrer" : undefined}
                tabIndex={open ? undefined : -1}
                onClick={() => setOpen(false)}
              >
                <span className={styles.icon} aria-hidden="true">
                  {contact.kind === "whatsapp" ? <WhatsAppIcon /> : <MailIcon />}
                </span>
                <span className={styles.text}>
                  <span className={styles.label}>{contact.label}</span>
                  <span className={styles.value}>{contact.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        tabIndex={hidden ? -1 : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.toggleText}>
          <span className={styles.toggleLabel} data-state="closed" aria-hidden={open}>
            Contacto directo
          </span>
          <span className={styles.toggleLabel} data-state="open" aria-hidden={!open}>
            Cerrar
          </span>
        </span>
        <span className={styles.plus} aria-hidden="true" />
      </button>
    </div>
  );
}
