"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home-landing.module.css";

/**
 * Botón de reproducir y lightbox del reel.
 *
 * Usa `<dialog>` modal nativo: atrapa el foco, cierra con Escape y devuelve el
 * foco al botón. El iframe de Vimeo se crea solo al abrir (nada de terceros en
 * la carga de la página) y se destruye al cerrar para cortar el audio.
 */
export function ReelPlayer({ embedUrl, title }: { embedUrl: string; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.play}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-cursor-magnetic=""
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M8 5.5v13l10.5-6.5z" />
        </svg>
        <span className={styles.srOnly}>Reproducir {title}</span>
      </button>
      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={title}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Clic en el fondo (fuera del video) cierra.
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <button type="button" className={styles.lightboxClose} onClick={() => setOpen(false)}>
          Cerrar
        </button>
        <div className={styles.lightboxFrame}>
          {open ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>
      </dialog>
    </>
  );
}
