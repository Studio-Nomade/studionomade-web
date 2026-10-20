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
| `loop`                                                 | vuelve al inicio al final             | `false`     |
| `autoplay`                                             | ms entre diapositivas (`0` = apagado) | `0`         |
| `invert`                                               | controles blancos                     | `false`     |
| `layout`                                               | `"bar" \| "sides"`                    | `"bar"`     |
| `labels`                                               | etiqueta de cada diapositiva          | —           |
| `accent`                                               | tramo activo en `--accent`            | `false`     |
| `slideLabel`                                           | `(i, total) => string`                | `"2 de 5"`  |
| `prevLabel` / `nextLabel` / `pauseLabel` / `playLabel` | textos                                | español     |

- Base nativa con `scroll-snap`: sin JS se desliza y todo es alcanzable.
- Teclado: ← → Inicio Fin con el foco dentro del carrusel.
- ARIA: `aria-roledescription="carrusel"`, cada diapositiva es un `group`
  etiquetado, y la actual se anuncia en una región `polite` (apagada mientras
  corre el autoplay, que incluye botón de pausa y se detiene con hover/foco).
- Con `prefers-reduced-motion` no hay desplazamiento suave ni autoplay.

`layout="sides"` (slider de casos): flechas chevron a los lados de la
diapositiva y, debajo, una barra de 2px con un tramo por diapositiva que se
desplaza bajo la activa, más las `labels` como botones (`aria-current` en la
actual). Por debajo de 768px las flechas se ocultan y queda el deslizamiento.

```tsx
<Carousel label="Mockups de NEXA" layout="sides" labels={["Mockup 01", "Mockup 02"]} accent>
  {slides}
</Carousel>
```
