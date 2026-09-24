# RevealRoot

Activa todos los `Reveal` y `SplitLines` de la página. **Se monta una sola vez**,
en el layout raíz, y no renderiza nada.

```tsx
// apps/web/app/layout.tsx
<body>
  {children}
  <RevealRoot />
</body>
```

Un único `IntersectionObserver` compartido para toda la página, más un
`MutationObserver` para el contenido que aparece después del primer paint (la home
y los formularios son Client Components).

Quién arma el estado oculto es el **CSS**, con `@media (scripting: enabled)`: sin
JavaScript no se oculta nada y no hay desajuste de hidratación, porque servidor y
cliente no tienen que coincidir en ningún atributo.

El script inline del `<head>` es solo una red de seguridad: si JavaScript existe
pero la hidratación falla, `RevealRoot` nunca corre y a los dos segundos el
watchdog marca `data-reveal-failed`, que desarma todo y devuelve la página a
legible.
