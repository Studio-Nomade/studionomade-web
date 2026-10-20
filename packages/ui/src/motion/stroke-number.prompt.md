# StrokeNumber

Número de paso en **contorno** que se dibuja al entrar en viewport (trazo SVG,
1.2s expo.inOut). Server Component; lo anima `MotionRoot`.

```tsx
<ol>
  {steps.map((step, index) => (
    <li key={step.id}>
      <StrokeNumber value={String(index + 1).padStart(2, "0")} delay={index * 0.1} />
      <h3>{step.title}</h3>
    </li>
  ))}
</ol>
```

| Prop    | Tipo                |
| ------- | ------------------- |
| `value` | `"01"` … `"04"`     |
| `delay` | segundos (opcional) |

Hereda `font-size` (alto del número = 1em) y `color` (trazo). Para trazar
cualquier otro SVG, envuélvelo en `<Reveal preset="stroke">`.
