"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type ReactNode
} from "react";

import { lockScroll } from "../motion/runtime";
import { MenuToggle } from "./menu-toggle";
import styles from "./site-header.module.css";

export interface SiteHeaderLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  links: SiteHeaderLink[];
  brand?: string;
  brandHref?: string;
  /** `light`: texto gris sobre blanco · `dark`: blanco sobre negro. */
  tone?: "light" | "dark";
  /** `sticky` (por defecto), `overlay` (transparente sobre un hero) o `static`. */
  position?: "sticky" | "overlay" | "static";
  /** Ruta actual, para marcar `aria-current` y cerrar el menú al navegar. */
  currentPath?: string;
  menuLabel?: string;
  closeLabel?: string;
  navLabel?: string;
  /** Contenido secundario del menú abierto (contacto, ciudades). */
  aside?: ReactNode;
  /** Componente de enlace del framework (en Next: `Link`). Por defecto `<a>`. */
  linkComponent?: ElementType;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Cabecera pública: "STUDIO NOMADE" a la izquierda y "Menú" con dos líneas a la
 * derecha, que abre un menú a pantalla completa animado.
 *
 * Sin JavaScript no hay overlay: los enlaces se muestran en línea dentro de la
 * cabecera (`@media (scripting: none)`) y todo es navegable. Con JS, el menú es
 * un diálogo modal: atrapa el foco, cierra con Escape, con un enlace o al
 * cambiar la ruta, bloquea el scroll y devuelve el foco al botón.
 */
export function SiteHeader({
  links,
  brand = "STUDIO NOMADE",
  brandHref = "/",
  tone = "light",
  position = "sticky",
  currentPath,
  menuLabel = "Menú",
  closeLabel = "Cerrar",
  navLabel = "Navegación principal",
  aside,
  linkComponent,
  className
}: SiteHeaderProps) {
  const LinkTag = (linkComponent ?? "a") as ElementType;
  const menuId = useId();
  const [enhanced, setEnhanced] = useState(false);
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => setEnhanced(true), []);

  const close = useCallback(() => setOpen(false), []);

  // Cierra al navegar (el App Router no desmonta el layout).
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      lockScroll(true);
      overlayRef.current?.querySelector<HTMLElement>("nav a[href]")?.focus();
      return () => lockScroll(false);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      toggleRef.current?.focus();
    }
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = overlayRef.current?.querySelectorAll<HTMLElement>("a[href], button");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const isCurrent = (href: string) =>
    currentPath !== undefined &&
    (href === "/" ? currentPath === "/" : currentPath.startsWith(href));

  return (
    <header
      className={[styles.header, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-position={position}
      data-open={open || undefined}
    >
      <LinkTag href={brandHref} className={styles.brand}>
        {brand}
      </LinkTag>

      <MenuToggle
        ref={toggleRef}
        className={styles.toggle}
        label={menuLabel}
        invert={tone === "dark"}
        expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(true)}
      />

      <div
        ref={overlayRef}
        id={menuId}
        className={styles.overlay}
        role={enhanced ? "dialog" : undefined}
        aria-modal={enhanced ? true : undefined}
        aria-label={enhanced ? navLabel : undefined}
        inert={enhanced && !open ? true : undefined}
        data-lenis-prevent=""
        onKeyDown={onKeyDown}
      >
        <div className={styles.overlayBar}>
          <LinkTag href={brandHref} className={styles.brand} onClick={close}>
            {brand}
          </LinkTag>
          <button type="button" className={styles.close} onClick={close}>
            {closeLabel}
            <span aria-hidden="true" className={styles.cross} />
          </button>
        </div>

        <nav aria-label={navLabel} className={styles.nav}>
          <ol className={styles.list}>
            {links.map((link, index) => (
              <li
                key={link.href}
                className={styles.item}
                style={{ "--sn-menu-index": index } as CSSProperties}
              >
                <LinkTag
                  href={link.href}
                  className={styles.link}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  onClick={close}
                >
                  <span className={styles.index} aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <span className={styles.mask}>
                    <span className={styles.label}>{link.label}</span>
                  </span>
                </LinkTag>
              </li>
            ))}
          </ol>
        </nav>

        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </header>
  );
}
