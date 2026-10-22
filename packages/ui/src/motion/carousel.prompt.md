# Carousel

Carrusel con **flechas, contador `01 / 05` y barra de progreso**, para heros
(`variant="full"`), galerías y rieles (`variant="peek"`) y sliders de casos
(`layout="sides"`). Client Component. Una sola API con tres ejes
independientes: `variant` (ancho de diapositiva), `layout` (dónde van las
flechas) y `controls` (con flechas o solo barra de scroll).

```tsx
<Carousel label="Proyectos destacados" variant="full" invert loop>
  {projects.map((project) => (
    <Image key={project.slug} src={project.cover} alt={project.title} fill />
  ))}
</Carousel>
```

| Prop                                                   | Tipo                                  | Por defecto |
| ------------------------------------------------------ | ------------------------------------- | ----------- |
| `label`                                                | nombre accesible (obligatorio)        | —           |
| `variant`                                              | `"full" \| "peek"`                    | `"full"`    |
| `controls`                                             | `"full" \| "progress"`                | `"full"`    |
| `lead`                                                 | bloque junto al riel (`ReactNode`)    | —           |
| `loop`                                                 | vuelve al inicio al final             | `false`     |
| `autoplay`                                             | ms entre diapositivas (`0` = apagado) | `0`         |
| `invert`                                               | controles blancos                     | `false`     |
| `layout`                                               | `"bar" \| "sides"`                    | `"bar"`     |
| `labels`                                               | etiqueta (y pestaña) por diapositiva  | —           |
| `accent`                                               | indicador activo en `--accent`        | `false`     |
| `slideLabel`                                           | `(i, total) => string`                | `"2 de 5"`  |
| `prevLabel` / `nextLabel` / `pauseLabel` / `playLabel` | textos                                | español     |

- Base nativa con `scroll-snap`: sin JS se desliza y todo es alcanzable.
- Teclado: ← → Inicio Fin con el foco dentro del carrusel.
- ARIA: `aria-roledescription="carrusel"`, cada diapositiva es un `group`
  etiquetado, y la actual se anuncia en una región `polite` (apagada mientras
  corre el autoplay, que incluye botón de pausa y se detiene con hover/foco).
- Con `prefers-reduced-motion` no hay desplazamiento suave ni autoplay.
- Con JS el carril se arrastra con el ratón (el táctil desliza nativo; un
  arrastre no dispara el clic de un enlace de la diapositiva) y los gestos
  horizontales del trackpad quedan fuera de Lenis.

| Combinación              | Controles                                                                 | Uso                      |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------ |
| `layout="bar"` (defecto) | flechas, contador `01 / 05`, barra por pasos y pausa                      | hero de Home (`full`)    |
| `layout="sides"`         | chevrons a los lados y barra segmentada de 2px (un tramo por diapositiva) | slider de casos (NEXA)   |
| `controls="progress"`    | sin flechas ni contador: barra fina que sigue el scroll real              | riel de mockups en áreas |

- `controls="progress"`: el indicador mide `1/n` de la pista y recorre el
  scroll real. Ignora `layout` (queda `data-layout="bar"`).
- `layout="sides"`: por debajo de 768px las flechas se ocultan y queda el
  deslizamiento; el tramo activo se desplaza bajo la diapositiva actual.
- `labels`: nombran cada diapositiva (en lugar de `slideLabel`) y, con JS, se
  muestran como pestañas clicables bajo el indicador, con `aria-current` en la
  actual, en cualquier layout. El anuncio es "Mockup 02, 2 de 5".
- `accent`: pinta con `--accent` el tramo, la barra o el pulgar activo.
- `lead`: columna a la izquierda del riel (encima en móvil). Funciona con
  cualquier layout.

```tsx
<Carousel label="Mockups de NEXA" layout="sides" labels={["Mockup 01", "Mockup 02"]} accent>
  {slides}
</Carousel>

<Carousel label="Mockups de marcas" variant="peek" controls="progress" lead={<p>Nota</p>}>
  {slides}
</Carousel>
```

Ajustes por variables CSS en `className` (todas opcionales):
`--sn-carousel-slide` (ancho de diapositiva en `peek`), `--sn-carousel-gap`,
`--sn-carousel-lead` (ancho de la columna `lead`), `--sn-carousel-bleed`
(sangrado del riel hacia la derecha, para centrar la barra), `--sn-carousel-bar`
(ancho de la barra), `--sn-carousel-bar-h`, `--sn-carousel-bar-gap` y
`--sn-carousel-thumb-color` (con `accent`, manda `--accent`).
