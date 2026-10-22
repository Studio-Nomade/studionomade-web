# RevealRoot

Alias histórico de **`MotionRoot`**: activa todas las primitivas de movimiento de
la página. **Se monta una sola vez**, en el layout raíz, y no renderiza nada.

```tsx
// apps/web/app/layout.tsx
<body>
  {children}
  <RevealRoot />
</body>
```

El contrato no cambia: `data-reveal` / `data-revealed` en los elementos,
`window.__snRevealReady` para el watchdog del layout y `data-reveal-failed` en
`<html>` para desarmar todo si la hidratación o GSAP fallan. Ver
`motion-root.prompt.md`.
