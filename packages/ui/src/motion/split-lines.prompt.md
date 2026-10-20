# SplitLines

Atajo de `SplitText by="lines"` con las líneas **fijadas por diseño**. Se conserva
por compatibilidad: es lo que usa la home.

```tsx
<SplitLines as="h2" lines={["Agendemos", "una reunión"]} />
```

Cada línea sube desde detrás de su máscara (y 105% → 0) con 0.08s de escalonado.
`step` retrasa el bloque `step × 0.09s` para encadenarlo con otro. El nombre
accesible es el titular completo, con espacio entre líneas.

Para cortes medidos, palabras o letras, usa `SplitText`.
