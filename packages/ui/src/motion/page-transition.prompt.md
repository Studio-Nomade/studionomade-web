# PageTransition

Transición entre páginas con **cortina**: sube desde abajo (scaleY 0 → 1), cambia
la ruta y se retira hacia arriba (1 → 0), expo.inOut, 1.2s en total. Client
Component, se monta una vez en el layout. Es agnóstico del framework: recibe la
ruta actual y la función de navegación.

```tsx
// apps/web/components/public/motion-shell.tsx
"use client";
const router = useRouter();
const pathname = usePathname();
<PageTransition pathname={pathname} navigate={router.push} />;
```

| Prop       | Tipo             | Por defecto |
| ---------- | ---------------- | ----------- |
| `pathname` | ruta actual      | —           |
| `navigate` | `(href) => void` | —           |
| `duration` | segundos totales | `1.2`       |

- Intercepta clics en enlaces internos **a otra ruta** (captura), compatible con
  `next/link`. `data-transition="off"` en un enlace lo excluye.
- Degrada: sin JS, con `prefers-reduced-motion`, con Cmd/Ctrl/Shift, `target`,
  `download`, enlaces externos o anclas, el enlace navega normal.
- Si la ruta nueva no llega en 4s, la cortina se retira igual.
