# Footer

Footer público según Figma, en negro: **regla · firma · regla**, luego logo
grande (`--footer-logo-w`, 258px a 1440) con la grilla de columnas, y la línea
legal con el año en curso. La firma ("Nos movemos en manada · Santiago |
Madrid") es copy de marca fijo: no la reescribas.

```tsx
<Footer
  logo={<Image src="/home/logo-mark-white.png" alt="Studio Nomade" width={258} height={258} />}
  columns={[
    {
      title: "Studio",
      items: [{ label: "Santa Beatriz 100, Of. 1101" }, { label: "Providencia" }]
    },
    {
      title: "Contacto",
      items: [{ label: "contact@studionomade.cl", href: "mailto:contact@studionomade.cl" }]
    },
    { title: "Redes", items: [{ label: "Instagram", href: "…" }] }
  ]}
  reveal
/>
```

| Prop      | Tipo                                          | Por defecto                  |
| --------- | --------------------------------------------- | ---------------------------- |
| `logo`    | `ReactNode` (prioridad)                       | —                            |
| `logoSrc` | URL de imagen simple                          | —                            |
| `columns` | `{ title, items: { label, href? }[] }[]`      | `[]`                         |
| `social`  | `{ kind, href }[]` (iconos en la línea legal) | `[]`                         |
| `legal`   | texto                                         | `© {año} Studio Nomade - …` |
| `reveal`  | revelado fijo en escritorio                   | `false`                      |

`reveal`: en escritorio (≥64em, alto ≥48em, puntero fino) el footer queda
pegado al fondo por debajo del contenido y se descubre al final. Es CSS puro
(`position: sticky; bottom: 0`): el contenido previo necesita fondo opaco y
`position: relative; z-index: 1`.
