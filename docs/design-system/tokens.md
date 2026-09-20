# Tokens del design system

`@studionomade/design-system/styles.css` es el único punto de entrada global. Conserva los 175 registros
del manifiesto de origen y añade únicamente el contrato responsive y la separación tipográfica aprobada.

## Capas

- Los primitivos `--sn-*` contienen valores de marca y escala.
- Los semánticos `--surface-*`, `--text-*`, `--font-*` y `--state-*` expresan intención.
- Los acentos se activan exclusivamente mediante `data-accent`.
- `TOKENS` es el espejo TypeScript de todas las propiedades CSS únicas.

## Tipografía

- `--font-core`: Archivo 400–700.
- `--font-display`: San Diego 500/600/700; no se sintetizan otros pesos.
- `--font-editorial`: Archivo 200/300.
- `--font-campaign`: Archivo 800 con eje `wdth` 75.
- Cook Gothif y Missing Lovely solo están declaradas como propuestas; ningún componente las consume.

San Diego se sirve como WOFF2 local. Archivo e IBM Plex Mono se descargan durante el build mediante
`next/font` y quedan autoalojadas; no hay solicitudes a Google Fonts en runtime. Las métricas de fallback
se reproducen con `node scripts/measure-font-metrics.mjs`.

## Responsive

La escala fluida está anclada entre 390 y 1440 px. Los máximos conservan exactamente los valores del
diseño original; cuerpo, cuerpo pequeño y caption permanecen fijos. Los breakpoints son `480`, `768`,
`1024`, `1280` y `1440` px y están espejados en `BREAKPOINTS`.

Para regenerar las fórmulas: `node scripts/fluid.mjs`.
