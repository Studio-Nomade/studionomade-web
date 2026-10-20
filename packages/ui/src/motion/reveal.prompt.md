# Reveal

Revela su contenido al entrar en viewport (borde superior al 85%), **una sola
vez**, con GSAP. Es un **Server Component**: no envuelvas nada en `"use client"`
por usarlo. Lo activa `MotionRoot` (alias `RevealRoot`), montado una vez en el
layout.

```tsx
<Reveal>                                   {/* jump: y 30 → 0 + opacidad, 1.2s power3.out */}
  <p>Un párrafo que aparece al llegar.</p>
</Reveal>

<Reveal preset="mask" direction="up">      {/* dos capas se van hacia arriba; imagen 1.2 → 1 */}
  <Image src="/caso.webp" alt="" fill />
</Reveal>

<Reveal preset="headline" as="span" className={styles.rule} />   {/* scaleX 0 → 1 */}

<Reveal preset="stroke"><svg>…</svg></Reveal>                    {/* trazo SVG */}

{items.map((item, index) => (
  <Reveal key={item.id} step={index}>{item.label}</Reveal>       {/* +0.09s por paso */}
))}
```

| Prop        | Tipo                                                   | Por defecto |
| ----------- | ------------------------------------------------------ | ----------- |
| `preset`    | `"jump" \| "fade" \| "mask" \| "headline" \| "stroke"` | `"jump"`    |
| `direction` | `"up" \| "down" \| "left" \| "right"`                  | `"up"`      |
| `delay`     | segundos                                               | `0`         |
| `step`      | posición en una secuencia                              | —           |
| `as`        | etiqueta                                               | `"div"`     |
| `variant`   | **obsoleto**: `rise` → `jump`, `mask` → `mask` izq.    | —           |

**Titulares**: usa `SplitText` (o `SplitLines`), que los revela por líneas,
palabras o letras desde detrás de una máscara.

El contenido **es visible por defecto**: el CSS solo lo pre-oculta con
`@media (scripting: enabled)` y sin `prefers-reduced-motion`. Sin JS o con
movimiento reducido se ve entero desde el primer paint.
