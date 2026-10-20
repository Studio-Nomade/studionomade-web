# Parallax

Desplazamiento y/o escala **ligados al scroll** (scrub). Server Component; lo
anima `MotionRoot`.

```tsx
<Parallax y={0.1}><p>Texto que flota</p></Parallax>
<Parallax y={0.05} scaleFrom={1.2} clip>
  <Image src="/caso.webp" alt="" fill />
</Parallax>
```

| Prop        | Tipo                                    | Por defecto |
| ----------- | --------------------------------------- | ----------- |
| `y`         | fracción de la altura (0.05–0.1)        | `0.1`       |
| `scaleFrom` | escala inicial que vuelve a 1 (1.2/0.8) | —           |
| `clip`      | recorta el desborde                     | `false`     |
| `as`        | etiqueta                                | `"div"`     |

El recorrido va de "top bottom" a "bottom top". No pre-oculta nada: sin JS o con
`prefers-reduced-motion` el contenido queda quieto.
