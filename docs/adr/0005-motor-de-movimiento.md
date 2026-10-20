# ADR-0005: GSAP y Lenis como motor de movimiento del sitio público

- Estado: Aceptada
- Fecha: 2026-10-20

## Contexto

El rediseño replica la sensación del tema legado (Kinsey): revelados por líneas, máscaras, parallax,
contadores, galería horizontal pinneada, cursor y transición entre páginas. El tema es de licencia
comercial y este repositorio es público, así que la implementación es propia.

## Decisión

- **GSAP 3.15** (licencia estándar gratuita desde 3.13, incluye ScrollTrigger y SplitText) como motor
  de animación, y **Lenis 1.3** (MIT) para el scroll suave. Ambos son dependencias de `@studionomade/ui`.
- Las primitivas declarativas (`Reveal`, `SplitText`, `Parallax`, `Counter`, `StrokeNumber`) son Server
  Components que emiten atributos `data-*`; un único `MotionRoot` carga GSAP con `import()` dinámico tras
  hidratar y crea los ScrollTriggers. GSAP no entra en el JS inicial ni en el camino del LCP.
- El pre-ocultado vive en CSS bajo `@media (scripting: enabled) and (prefers-reduced-motion:
no-preference)`: sin JavaScript o con movimiento reducido no se oculta nada.
- La transición entre páginas intercepta clics internos en captura y navega con el router del framework,
  en lugar de la View Transitions API (sin soporte estable en el App Router de Next 15 ni en Firefox).
- El preloader existe pero queda apagado por defecto porque desplaza el LCP.

## Consecuencias

Una dependencia de animación de licencia no MIT (estándar de GSAP, gratuita y redistribuible). El
contrato de atributos (`data-reveal`, `data-revealed`, `data-reveal-failed`) se mantiene, así que las
pruebas e2e de revelado siguen vigentes.
