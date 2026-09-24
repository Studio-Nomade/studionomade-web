# SplitLines

Titular que se revela **línea a línea**, cada una subiendo desde detrás de una
máscara. Es la firma visual del sitio.

```tsx
<SplitLines as="h2" lines={["Una idea clara.", "Una marca que la sostiene."]} />
```

**El corte de línea es decisión de diseño, no de medición.** Pasa una entrada por
línea. El componente no mide nada a propósito: medir obligaría a convertirlo en
Client Component, a esperar a que carguen las fuentes y produciría desajuste de
hidratación.

- `as` fija la etiqueta (`h1`, `h2`, `span`…). Ponla siempre en titulares reales.
- `step` desplaza el inicio del escalonado para encadenar con un bloque anterior.

El nombre accesible sigue siendo el titular completo: cada línea es un bloque, así
que el cálculo del nombre inserta la separación. Hay un test que lo verifica.
