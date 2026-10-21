"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { MailIcon, WhatsAppIcon } from "@studionomade/ui";
import { DIRECT_CONTACTS } from "../../content/contact";
import styles from "./contact-dock.module.css";

/**
 * Botón flotante de contacto directo (referencia mubien.com): una píldora
 * abajo a la derecha que acompaña la navegación y abre los correos por área y
 * el WhatsApp comercial. Cierra con Escape, con un clic fuera o al elegir.
 */
export function ContactDock() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // El botón se retira donde estorba: al final de la página (el footer ya
  // muestra contactos y redes) y sobre secciones marcadas con `data-dock-hide`
  // (el hero de la home, que tiene su propia píldora "Ver proyecto").
  useEffect(() => {
    const check = () => {
      const remaining =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      const overHidden = Array.from(document.querySelectorAll("[data-dock-hide]")).some(
        (element) => {
          const rect = element.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > window.innerHeight * 0.55;
        }
      );
      setAtEnd(remaining < window.innerHeight * 0.18 || overHidden);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    if (atEnd) setOpen(false);
  }, [atEnd]);

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
      data-hidden={atEnd || undefined}
    >
      <div id={panelId} className={styles.panel} role="region" aria-label="Contacto directo">
        <p className={styles.panelTitle}>Contacto directo</p>
        <ul className={styles.list}>
          {DIRECT_CONTACTS.map((contact) => (
            <li key={contact.href}>
              <a
                className={styles.item}
                href={contact.href}
                target={contact.kind === "whatsapp" ? "_blank" : undefined}
                rel={contact.kind === "whatsapp" ? "noopener noreferrer" : undefined}
                tabIndex={open ? undefined : -1}
                data-kind={contact.kind}
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

      <div className={styles.bar}>
        <span className={styles.mark} aria-hidden="true">
          <Image src="/icons/studio-180.png" alt="" width={44} height={44} />
        </span>
        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.toggleLabel}>{open ? "Cerrar" : "Contacto directo"}</span>
          <span className={styles.plus} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
