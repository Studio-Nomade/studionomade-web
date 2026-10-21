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

export interface SiteHeaderSubLink {
  label: string;
  href: string;
  /** Sigla o dato corto que acompaña al enlace (p. ej. "B&D"). */
  code?: string;
  /** Imagen o ícono del enlace (slot: en Next, `next/image`). */
  media?: ReactNode;
}

export interface SiteHeaderLink {
  label: string;
  /** Destino. Un enlace con `children` es un submenú y no navega. */
  href?: string;
  /** Submenú: en escritorio se despliega a la derecha de la lista principal. */
  children?: SiteHeaderSubLink[];
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
  /** Controles junto al botón Menú (p. ej. selector de idioma). */
  actions?: ReactNode;
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
  actions,
  linkComponent,
  className
}: SiteHeaderProps) {
  const LinkTag = (linkComponent ?? "a") as ElementType;
  const menuId = useId();
  const [enhanced, setEnhanced] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => setEnhanced(true), []);

  const close = useCallback(() => {
    setOpen(false);
    setOpenSub(null);
  }, []);

  // Cierra al navegar (el App Router no desmonta el layout).
  useEffect(() => {
    setOpen(false);
    setOpenSub(null);
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
    const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
      "a[href]:not([tabindex='-1']), button"
    );
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

  const subIsCurrent = (link: SiteHeaderLink) =>
    link.children?.some((child) => isCurrent(child.href)) ?? false;

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

      {actions ? <div className={styles.actions}>{actions}</div> : null}

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
            {links.map((link, index) => {
              const subId = `${menuId}-sub-${index}`;
              const subOpen = openSub === subId;
              return (
                <li
                  key={link.href ?? link.label}
                  className={styles.item}
                  data-sub-open={subOpen || undefined}
                  style={{ "--sn-menu-index": index } as CSSProperties}
                >
                  {link.children?.length ? (
                    <>
                      <button
                        type="button"
                        className={[styles.link, styles.subToggle].join(" ")}
                        aria-expanded={subOpen}
                        aria-controls={subId}
                        data-current={subIsCurrent(link) || undefined}
                        onClick={() => setOpenSub(subOpen ? null : subId)}
                      >
                        <span className={styles.index} aria-hidden="true">
                          {pad(index + 1)}
                        </span>
                        <span className={styles.mask}>
                          <span className={styles.label}>
                            {link.label}
                            <span className={styles.chevron} aria-hidden="true" />
                          </span>
                        </span>
                      </button>
                      <ul id={subId} className={styles.sub} aria-label={link.label}>
                        {link.children.map((child, childIndex) => (
                          <li
                            key={child.href}
                            className={styles.subItem}
                            style={{ "--sn-sub-index": childIndex } as CSSProperties}
                          >
                            <LinkTag
                              href={child.href}
                              className={styles.subLink}
                              aria-current={isCurrent(child.href) ? "page" : undefined}
                              tabIndex={subOpen ? undefined : -1}
                              onClick={close}
                            >
                              {child.media ? (
                                <span className={styles.subMedia} aria-hidden="true">
                                  {child.media}
                                </span>
                              ) : null}
                              <span className={styles.subText}>
                                {child.code ? (
                                  <span className={styles.subCode}>{child.code}</span>
                                ) : null}
                                <span className={styles.subLabel}>{child.label}</span>
                              </span>
                            </LinkTag>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <LinkTag
                      href={link.href}
                      className={styles.link}
                      aria-current={link.href && isCurrent(link.href) ? "page" : undefined}
                      onClick={close}
                    >
                      <span className={styles.index} aria-hidden="true">
                        {pad(index + 1)}
                      </span>
                      <span className={styles.mask}>
                        <span className={styles.label}>{link.label}</span>
                      </span>
                    </LinkTag>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </header>
  );
}
