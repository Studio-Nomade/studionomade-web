import { IBM_Plex_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";

/**
 * Familias del sitio vivo de Studio Nomade.
 *
 * Cy Grotesk, Gotham y Neue Haas son de un solo corte. Se declaran con un rango
 * de peso amplio (`100 900`) a propósito: así el navegador siempre encuentra una
 * cara que "cubre" el peso pedido y nunca sintetiza el grosor, que es lo que
 * `font-synthesis-weight: none` de base.css exige.
 *
 * No se fija `size-adjust` a mano: los tres se midieron con fontkit contra Arial
 * y dieron 205%, 113% y 132% — muy fuera del rango en el que ese ajuste es una
 * corrección y no una deformación. Se delega en `adjustFontFallback` de Next,
 * que calcula la cara de respaldo y mantiene el CLS bajo control.
 */

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--sn-font-inter",
  adjustFontFallback: true
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--sn-font-plex-mono",
  adjustFontFallback: true
});

/** Display y campaña: los titulares grandes del sitio. */
export const cyGrotesk = localFont({
  src: [{ path: "./cy-grotesk-grand-dark.woff2", weight: "100 900", style: "normal" }],
  variable: "--sn-font-cy-grotesk",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"]
});

/** Botones y etiquetas: uppercase con tracking ancho. */
export const gotham = localFont({
  src: [{ path: "./gotham-book.woff2", weight: "100 900", style: "normal" }],
  variable: "--sn-font-gotham",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"]
});

/**
 * Negra puntual. Sin `preload`: precargar cuatro familias es una regresión
 * directa de LCP, y esta solo aparece en piezas concretas.
 */
export const neueHaas = localFont({
  src: [{ path: "./neue-haas-display-black.woff2", weight: "900", style: "normal" }],
  variable: "--sn-font-neue-haas",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"]
});

export const fontVariables = [
  inter.variable,
  cyGrotesk.variable,
  gotham.variable,
  neueHaas.variable,
  plexMono.variable
].join(" ");
