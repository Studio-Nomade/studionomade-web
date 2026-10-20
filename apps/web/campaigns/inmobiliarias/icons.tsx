/**
 * Íconos propios de la landing. Heredan el color con `currentColor` y el tamaño
 * del CSS que los contiene; son decorativos (el texto del control los nombra).
 */

/** Asterisco de la campaña, en trazo para que `Reveal preset="stroke"` lo dibuje. */
export function AsteriskMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth={13} strokeLinecap="round">
        <line x1="50" y1="9" x2="50" y2="91" />
        <line x1="14.5" y1="29.5" x2="85.5" y2="70.5" />
        <line x1="14.5" y1="70.5" x2="85.5" y2="29.5" />
      </g>
    </svg>
  );
}

/** Globo de conversación genérico para los accesos a WhatsApp. */
export function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <path
        d="M9 8.4c.3 2.7 2.4 5.2 5.4 6.4l1.2-1.3-1.8-1-.9.8a5 5 0 0 1-2.4-2.4l.8-.9-1-1.8z"
        fill="currentColor"
      />
    </svg>
  );
}
