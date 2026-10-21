# Tokens del design system

`@studionomade/design-system/styles.css` es el único punto de entrada global. Conserva los 175 registros
del manifiesto de origen y añade, de forma aditiva, el contrato responsive y los tokens del rediseño del
sitio público. Ningún token original se renombra ni se elimina.

## Capas

- Los primitivos `--sn-*` contienen valores de marca y escala.
- Los semánticos `--surface-*`, `--text-*`, `--font-*` y `--state-*` expresan intención.
- Los acentos se activan exclusivamente mediante `data-accent`.
- `TOKENS` es el espejo TypeScript de todas las propiedades CSS únicas; `MOTION` espeja el contrato de
  movimiento en las unidades que consume GSAP (segundos y nombres de ease).

## Tipografía

| Token              | Familia                         | Uso                                           |
| ------------------ | ------------------------------- | --------------------------------------------- |
| `--font-core`      | **Inter** (variable 100–900)    | Cuerpo, titulares del rediseño, botones, menú |
| `--font-editorial` | Inter                           | Textos editoriales                            |
| `--font-display`   | Cy Grotesk Grand (local, WOFF2) | Titulares display de la home y campañas       |
| `--font-campaign`  | Cy Grotesk Grand                | Campañas                                      |
| `--font-label`     | Gotham Book (local)             | Etiquetas en mayúsculas con tracking          |
| `--font-black`     | Neue Haas Display Black (local) | Piezas puntuales, sin `preload`               |
| `--font-mono`      | IBM Plex Mono 400/500           | Roles mono                                    |

Inter se carga con `next/font/google` como fuente **variable** (todos los pesos de 100 a 900, incluidos
100/200/300 del rediseño) y queda autoalojada en el build: no hay solicitudes a Google Fonts en runtime.
Cook Gothif y Missing Lovely solo están declaradas como propuestas del Lab.

Build sin red (sandbox, CI aislado): `NEXT_FONT_GOOGLE_MOCKED_RESPONSES=/ruta/a/mock.cjs pnpm build`, con
un mock local **no versionado** que devuelva el CSS de `@font-face` apuntando a archivos locales. Vercel
descarga las fuentes reales.

## Rediseño del sitio público

Escala fluida anclada entre 390 y 1440 px (`node scripts/fluid.mjs` regenera las fórmulas).

| Grupo       | Tokens                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pesos Inter | `--fw-hairline` (100), `--fw-masthead` (→100), `--fw-block-title` (→200 `--fw-thin`), `--fw-button` (600)                                          |
| Masthead    | `--fs-xxxl` 96–212, `--fs-xxl` 54–126, `--fs-xl` 46–102 · `--tr-masthead` (-2px) · `--lh-masthead`                                                 |
| Titulares   | `--fs-heading-1` 40–76 · `-2` 32–52 · `-3` 27–32 · `-4` 18–22 · `-5` 16–18 · `-6` 14–16 · `--lh-block-title`                                       |
| Áreas       | `--fs-title-hero` 40–96 · `--fs-title-cta` 36–64 · `--fs-title-section` 28–40 · `--fs-lead-xl` 22–32 · `--fs-body-xl` 18–24 · `--fs-figure` 72–128 |
| Cuerpo      | `--lh-body-site` (16/28.8 → 1.8) · `--fs-body-block` (15.7px)                                                                                      |
| Botón       | `--fs-button` (13px) · `--button-pad-y` 16–18 · `--button-pad-x` 30–42                                                                             |
| Color       | `--sn-iron` (#555555) → `--text-title`, titulares sobre claro                                                                                      |
| Retícula    | `--site-margin` 20–112 · `--site-content-max` (1236px) · `--site-gutter` 20–62 · `--site-section-y` 54–127                                         |
| Footer      | `--footer-logo-w` 140–258                                                                                                                          |
| Cursor      | `--cursor-size` (12px) · `--cursor-size-hover` (56px) · `--cursor-size-label` (88px)                                                               |
| Capas z     | `--z-content` (1) · `--z-curtain` (400) · `--z-cursor` (500) · `--z-preloader` (600)                                                               |

La fila **Áreas** sale del Figma "SERVICIOS" (páginas Branding y Architecture, 1440 px): título del
hero Inter 200, CTA/formulario, H2 de sección Inter 600, lead/cita, cuerpo grande y cifras Inter 500.
Los máximos son los de Figma y los mínimos siguen el comportamiento móvil del sitio legado.

### Páginas de caso

Escala del Figma "WEB NOMADE 2026" (máximo a 1440, fluida desde 390; `scripts/fluid.mjs`):

| Token                  | 390 → 1440              | Uso                                           |
| ---------------------- | ----------------------- | --------------------------------------------- |
| `--fs-case-title`      | 44 → 96                 | Título del caso (hero), en mayúsculas         |
| `--fs-case-title-long` | 32 → 64                 | Títulos largos ("Reebok x Lollapalooza")      |
| `--fs-case-credits`    | 32 → 48                 | "Créditos"                                    |
| `--fs-case-headline`   | 26 → 40                 | Objetivos, desafío, narrativa (600)           |
| `--fs-case-statement`  | 24 → 36                 | Statement de cierre, "Package Design"         |
| `--fs-case-lead`       | 22 → 32                 | Año, citas, claim, lead, zonas de Equifax     |
| `--fs-case-body`       | 18 → 24                 | Cuerpo, columnas del desafío, créditos        |
| `--fs-case-label`      | 16 → 20                 | Etiquetas, captions, servicios, botón Behance |
| `--fs-case-small`      | 15 → 16                 | Objetivos y código de área                    |
| `--case-y-xl/-lg/-md`  | 64→162 · 56→120 · 40→80 | Aire vertical de bloque                       |

`--lh-case` (1.21) reproduce el `line-height: normal` de Inter que mide Figma.

**Peso del título.** Figma dibuja el título del caso en Inter 400 con tracking 0; el legado usaba
Inter 100 con -2px. Se toma la caja, el tamaño y el interlineado de Figma con el peso delgado del
sistema: `--fw-case-title: var(--fw-masthead)` y `--tr-case-title: var(--tr-masthead)`. Volver al 400
de Figma es cambiar esas dos líneas.

**Acentos de caso** (decisión del cliente, `data-accent` en el `<article>` del caso): CinnaLove
`#813408`, NEXA `#dc5c34`, Kumelen `#d89840`, Reebok y Equifax el rojo de A&D `#ef1942`. El acento
pinta la regla corta, el tramo activo del slider, los círculos de objetivos, el hover del botón
Behance y los números de zonas; nunca texto de cuerpo sobre fondo claro. `tokens.test.ts` verifica
los valores y que `--accent-contrast` cumpla AA (≥ 4.5:1) sobre cada acento.

`--fs-h1`…`--fs-h5`, `--fs-display-*` y `--fs-campaign-*` siguen vigentes para campañas y páginas
interiores; los titulares del rediseño usan `--fs-heading-*`.

## Movimiento

| Token                       | Valor                               | Espejo `MOTION`          |
| --------------------------- | ----------------------------------- | ------------------------ |
| `--motion-dur`              | 1200ms                              | `duration: 1.2`          |
| `--motion-dur-counter`      | 2400ms                              | `counterDuration: 2.4`   |
| `--motion-ease-expo-in-out` | cubic-bezier(0.87, 0, 0.13, 1)      | `ease.mask/headline/...` |
| `--motion-ease-expo-out`    | cubic-bezier(0.19, 1, 0.22, 1)      | `ease.splitChars`        |
| `--motion-ease-power3-out`  | cubic-bezier(0.215, 0.61, 0.355, 1) | `ease.jump/split`        |
| `--motion-jump-y`           | 30px                                | `jumpY: 30`              |
| `--motion-mask-scale`       | 1.2                                 | `maskScale: 1.2`         |
| `--reveal-shift-lines`      | 105%                                | `splitShift: 105`        |

`MOTION` además fija el disparo (`top 85%`, una vez), los escalonados (líneas 0.08 con tope 0.3, palabras
0.2, letras 0.3) y el `lerp` 0.12 de Lenis. Con `prefers-reduced-motion: reduce` las duraciones CSS y los
desplazamientos pasan a 0 y el runtime no carga GSAP. `pnpm check:tokens` verifica ambos espejos.

## Responsive

Los máximos de la escala legada conservan exactamente los valores del diseño original; cuerpo, cuerpo
pequeño y caption permanecen fijos. Los breakpoints son `480`, `768`, `1024`, `1280` y `1440` px y están
espejados en `BREAKPOINTS`.

## 2026-10-21 — Acentos de área Audiovisual y Web Design

Se agregan `[data-accent="audiovisual"]` (`--accent: #7569f6`, violeta del isologo
A&A aclarado lo mínimo para AA con `#0a0a0a`; la línea conserva `#6e62f5`) y
`[data-accent="web-design"]` (`--accent: #e9c736`, amarillo del isologo WD), para
que las cuatro áreas tengan página, favicon y color propios. Aprobado por
Sebastián (dirección) al pedir favicon e identidad por área.
