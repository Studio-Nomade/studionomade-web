# Cursor

Cursor personalizado **solo en escritorio** (`pointer: fine` con hover): un
círculo que sigue al puntero con inercia (GSAP `quickTo`, 0.5s). Client
Component; se monta una vez en el layout.

```tsx
<Cursor />

<a href="/proyectos/kumelen" data-cursor-label="Ver">…</a>     {/* círculo grande con etiqueta */}
<button data-cursor-magnetic>Agenda una reunión</button>         {/* el botón sigue al puntero */}
```

| Prop            | Tipo                   | Por defecto                        |
| --------------- | ---------------------- | ---------------------------------- |
| `hoverSelector` | selector que agranda   | `a, button, [role=button], label…` |
| `magnetism`     | fuerza magnética (0–1) | `0.3`                              |

- No reemplaza el cursor nativo: es una capa decorativa (`aria-hidden`,
  `pointer-events: none`, `mix-blend-mode: difference`).
- No se monta en táctil, con `prefers-reduced-motion` ni en el servidor.
