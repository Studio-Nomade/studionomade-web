# Preloader

Pantalla negra con contador **"00%" → "100%" abajo a la izquierda** que se
retira hacia arriba (expo.inOut) al cargar la página. Solo en la primera carga
de la sesión. Client Component.

```tsx
// Solo si la página lo pide: apagado por defecto en el sitio.
<Preloader />
```

| Prop          | Tipo                           | Por defecto      |
| ------------- | ------------------------------ | ---------------- |
| `storageKey`  | clave de `sessionStorage`      | `"sn-preloaded"` |
| `maxDuration` | ms máximos cubriendo la página | `4000`           |

**Decisión: apagado por defecto.** Tapa el contenido durante la carga y
convierte su retirada en el LCP. Úsalo solo en landings que lo pidan.

Para no cubrir en recargas de la misma sesión, el layout puede fijar
`<html data-preloaded>` con un script en línea antes del primer paint:

```js
try {
  sessionStorage.getItem("sn-preloaded") &&
    document.documentElement.setAttribute("data-preloaded", "");
} catch (e) {}
```

Nunca cubre sin JS, con `prefers-reduced-motion` ni con `data-reveal-failed`.
