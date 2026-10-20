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
| `slideLabel`                                           | `(i, total) => string`                | `"2 de 5"`  |
| `prevLabel` / `nextLabel` / `pauseLabel` / `playLabel` | textos                                | español     |

- Base nativa con `scroll-snap`: sin JS se desliza y todo es alcanzable.
- Teclado: ← → Inicio Fin con el foco dentro del carrusel.
- ARIA: `aria-roledescription="carrusel"`, cada diapositiva es un `group`
  etiquetado, y la actual se anuncia en una región `polite` (apagada mientras
  corre el autoplay, que incluye botón de pausa y se detiene con hover/foco).
- Con `prefers-reduced-motion` no hay desplazamiento suave ni autoplay.
