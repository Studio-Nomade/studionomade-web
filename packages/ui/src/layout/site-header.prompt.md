# SiteHeader

Cabecera pública: **"STUDIO NOMADE"** a la izquierda y **"Menú"** con dos líneas
a la derecha (`MenuToggle`), que abre un menú a pantalla completa: el fondo
negro baja con un `clip-path` (1.2s expo.inOut) y cada enlace sube desde su
máscara, escalonado. Client Component.

```tsx
<SiteHeader
  links={[
    { label: "Inicio", href: "/" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Branding", href: "/areas/branding" },
    { label: "Architecture", href: "/areas/architecture" },
    { label: "Contacto", href: "/contacto" }
  ]}
  tone="dark"
  currentPath={pathname}
  linkComponent={Link}
  aside={<p>contact@studionomade.cl</p>}
/>
```

| Prop                                    | Tipo                                 | Por defecto                                |
| --------------------------------------- | ------------------------------------ | ------------------------------------------ |
| `links`                                 | `{ label, href }[]`                  | —                                          |
| `brand`                                 | texto de la marca                    | `"STUDIO NOMADE"`                          |
| `brandHref`                             | destino de la marca                  | `"/"`                                      |
| `tone`                                  | `"light" \| "dark"`                  | `"light"`                                  |
| `position`                              | `"sticky" \| "overlay" \| "static"`  | `"sticky"`                                 |
| `currentPath`                           | ruta actual (`aria-current`, cierre) | —                                          |
| `aside`                                 | contenido secundario del menú        | —                                          |
| `linkComponent`                         | `Link` del framework                 | `"a"`                                      |
| `menuLabel` / `closeLabel` / `navLabel` | textos                               | `Menú` / `Cerrar` / `Navegación principal` |

- **Sin JS** no hay overlay: los enlaces se ven en línea en la cabecera.
- **Con JS** el menú es un diálogo modal: foco al primer enlace, trampa de foco,
  Escape cierra, cerrar devuelve el foco a "Menú", el scroll queda bloqueado
  (también con Lenis) y se cierra al cambiar `currentPath`.
- Con `prefers-reduced-motion` abre y cierra sin animación.
