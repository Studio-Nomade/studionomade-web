import localFont from "next/font/local";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--sn-font-archivo",
  adjustFontFallback: true
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--sn-font-plex-mono",
  adjustFontFallback: true
});

export const sanDiego = localFont({
  src: [
    { path: "./san-diego-medium.woff2", weight: "500", style: "normal" },
    { path: "./san-diego-semibold.woff2", weight: "600", style: "normal" },
    { path: "./san-diego-bold.woff2", weight: "700", style: "normal" }
  ],
  variable: "--sn-font-san-diego",
  display: "swap",
  preload: true,
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  declarations: [
    { prop: "size-adjust", value: "135.48%" },
    { prop: "ascent-override", value: "66.43%" },
    { prop: "descent-override", value: "18.45%" }
  ]
});

export const fontVariables = [archivo.variable, sanDiego.variable, plexMono.variable].join(" ");
