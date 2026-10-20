# MotionRoot

Motor de las primitivas declarativas de movimiento (`Reveal`, `SplitText`,
`SplitLines`, `Parallax`, `Counter`, `StrokeNumber`). **Se monta una sola vez**
en el layout raíz y no renderiza nada. `RevealRoot` es su alias histórico.

```tsx
<body>
  {children}
  <MotionRoot />
</body>
```

- Carga GSAP (ScrollTrigger + SplitText) con `import()` dinámico tras hidratar:
  fuera del bundle inicial y del camino del LCP.
- Un ScrollTrigger por elemento `[data-motion]`: `top 85%`, una sola vez
  (parallax: scrub). Un `MutationObserver` recoge el contenido que llega
  después (navegación del App Router, Client Components) y limpia lo que sale.
- Red de seguridad: lo que un salto de scroll deja por encima del viewport se
  revela en el acto.
- Con `prefers-reduced-motion` no carga GSAP; sin JS no hay nada que activar.
  Si GSAP no carga, marca `data-reveal-failed` en `<html>` y todo queda visible.
