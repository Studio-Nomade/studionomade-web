# SplitText

Titular que se revela por **líneas**, **palabras** o **letras**, cada unidad
subiendo desde detrás de su máscara (y 105% → 0, 1.2s). Server Component; lo
anima `MotionRoot`.

```tsx
<SplitText as="h1" by="lines" lines={["Agendemos", "una reunión"]} />  {/* corte editorial */}
<SplitText as="h2">Un texto libre que se corta por líneas medidas</SplitText>
<SplitText as="h2" by="words" delay={0.2}>Nos movemos en manada</SplitText>
<SplitText as="span" by="chars">BRANDING</SplitText>
```

| Prop       | Tipo                            | Por defecto |
| ---------- | ------------------------------- | ----------- |
| `children` | `string`                        | `""`        |
| `lines`    | `string[]` (prioridad)          | —           |
| `by`       | `"lines" \| "words" \| "chars"` | `"lines"`   |
| `as`       | etiqueta                        | `"span"`    |
| `delay`    | segundos                        | `0`         |
| `step`     | posición en una secuencia       | —           |

- Palabras, letras y `lines` explícitas se parten **en el servidor**: sin
  mutación del DOM tras hidratar y con el texto completo sin JS.
- `by="lines"` sin `lines` mide en el navegador con `SplitText` de GSAP
  (`autoSplit`), y solo oculta el texto hasta partirlo.
- Escalonado: líneas 0.08s (tope 0.3s total) · palabras 0.2s y letras 0.3s
  repartidos entre todas las unidades.
- `by="chars"` expone una copia legible para lectores de pantalla y oculta la
  versión partida (`aria-hidden`).
