# Carousel

Carrusel con **flechas, contador `01 / 05` y barra de progreso**, para heros
(`variant="full"`) y galerías (`variant="peek"`). Client Component.

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
| `slideLabel`                                           | `(i, total) => string`                | `"2 de 5"`  |
| `prevLabel` / `nextLabel` / `pauseLabel` / `playLabel` | textos                                | español     |

- Base nativa con `scroll-snap`: sin JS se desliza y todo es alcanzable.
- Teclado: ← → Inicio Fin con el foco dentro del carrusel.
- ARIA: `aria-roledescription="carrusel"`, cada diapositiva es un `group`
  etiquetado, y la actual se anuncia en una región `polite` (apagada mientras
  corre el autoplay, que incluye botón de pausa y se detiene con hover/foco).
- Con `prefers-reduced-motion` no hay desplazamiento suave ni autoplay.
- Con JS el carril se arrastra con el ratón (el táctil desliza nativo) y los
  gestos horizontales del trackpad quedan fuera de Lenis.
- `controls="progress"`: sin flechas ni contador; una barra fina cuyo indicador
  mide `1/n` de la pista y recorre el scroll real (riel de mockups).
- `lead`: columna a la izquierda del riel (encima en móvil).

Ajustes por variables CSS en `className` (todas opcionales):
`--sn-carousel-slide` (ancho de diapositiva en `peek`), `--sn-carousel-gap`,
`--sn-carousel-lead` (ancho de la columna `lead`), `--sn-carousel-bleed`
(sangrado del riel hacia la derecha, para centrar la barra), `--sn-carousel-bar`
(ancho de la barra), `--sn-carousel-bar-h`, `--sn-carousel-bar-gap` y
`--sn-carousel-thumb-color`.
