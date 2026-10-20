# HorizontalScroll

Galería horizontal **a pantalla completa pinneada**: la sección se fija y el
scroll vertical la recorre de lado a lado (ScrollTrigger, scrub). Client
Component.

```tsx
<HorizontalScroll label="Galería del proyecto">
  {images.map((image) => (
    <figure key={image.src} className={styles.panel}>
      <Image src={image.src} alt={image.alt} width={960} height={640} />
    </figure>
  ))}
</HorizontalScroll>
```

| Prop       | Tipo                             | Por defecto |
| ---------- | -------------------------------- | ----------- |
| `label`    | nombre accesible (obligatorio)   | —           |
| `minWidth` | px a partir de los que se pinnea | `768`       |

- Sin JS, con `prefers-reduced-motion` o bajo `minWidth`: carril nativo con
  `scroll-snap`, enfocable (Tab + flechas).
- Pinneada: al enfocar un panel fuera de pantalla con el teclado, la página
  salta al punto del recorrido donde ese panel se ve.
- El ancho de cada panel lo decide quien compone (los hijos).
