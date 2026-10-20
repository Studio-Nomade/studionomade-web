# Reveal

Revela su contenido al entrar en viewport, **una sola vez**. Es el patrón dominante
del sitio de Studio Nomade: 26 disparadores de scroll, casi todos sin scrubbing.

```tsx
<Reveal variant="rise">
  <p>Un párrafo que aparece al llegar.</p>
</Reveal>;

{
  items.map((item, index) => (
    <Reveal key={item.id} step={index}>
      {item.label}
    </Reveal>
  ));
}
```

- `variant="rise"` (por defecto) sube 24px y aparece · `fade` solo aparece ·
  `mask` recorta desde la izquierda.
- `step` escalona: cada unidad añade `--dur-stagger` (90ms) de retardo.
- Es **Server Component**. No envuelvas nada en `"use client"` por usarlo.

**No lo uses para titulares**: para eso está `SplitLines`, que los revela línea a
línea desde detrás de una máscara.

El contenido **es visible por defecto**. Solo se oculta si `RevealRoot` confirmó
que JavaScript está vivo, así que sin JS no desaparece nada. Bajo
`prefers-reduced-motion` aparece todo de golpe, sin animación.
