# SmoothScroll

Scroll suave con **Lenis** (MIT), sincronizado con ScrollTrigger. Se monta una
vez en el layout y no renderiza nada.

```tsx
<SmoothScroll />            {/* lerp 0.12 ≈ damping del sitio de origen */}
<SmoothScroll lerp={0.08} />
```

| Prop   | Tipo                    | Por defecto |
| ------ | ----------------------- | ----------- |
| `lerp` | interpolación por frame | `0.12`      |

- Solo con puntero preciso (`pointer: fine` + hover) y sin
  `prefers-reduced-motion`. En táctil y sin JS el scroll es el nativo.
- `data-lenis-prevent` en un contenedor le devuelve su scroll nativo.
- Los estilos que Lenis necesita (`html.lenis`, `.lenis-stopped`) viven en
  `@studionomade/design-system/styles.css`.
