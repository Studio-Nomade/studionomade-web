# Definition of done del design system

Antes de entregar un cambio visual:

- [ ] No hay colores hex/rgb/hsl fuera de tokens.
- [ ] No hay píxeles sueltos salvo hairlines de `1px`.
- [ ] No hay familias tipográficas literales.
- [ ] No existe `style` inline salvo claves custom property `--*`.
- [ ] Los enums visuales usan atributos `data-*`.
- [ ] Cada componente tiene `*.prompt.md` y prueba unitaria hermana.
- [ ] El componente se importa desde `@studionomade/ui`.
- [ ] El foco visible y el contraste AA fueron verificados.
- [ ] Los formularios funcionan y entregan `FormData` sin JavaScript cliente.
- [ ] No aparece scroll horizontal a 360 px.
- [ ] La regresión visual fue revisada a 360, 768, 1024 y 1440 px.
- [ ] `lint`, `lint:css`, `check:tokens`, `check:assets`, `typecheck`, tests y build pasan.
