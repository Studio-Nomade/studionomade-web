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

## Submenú y acciones (2026-10-21)

- Un enlace con `children` (sin `href`) se dibuja como botón con `aria-expanded`:
  en escritorio el submenú se despliega a la derecha de la lista principal con
  entrada escalonada; bajo 64em se abre debajo del ítem. Cada hijo acepta `code`
  (sigla) y `media` (slot de imagen/ícono). Sin JavaScript los hijos se ven en línea.
- `actions` es un slot junto al botón Menú (selector de idioma, etc.).
