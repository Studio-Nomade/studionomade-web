# ADR-0002: Next.js App Router y Vercel

- Estado: Aceptada
- Fecha: 2026-07-20

## Contexto

El ecosistema necesita un sitio público y una aplicación administrativa separados, con una base tecnológica común.

## Decisión

Usar Next.js App Router, React y TypeScript para ambas aplicaciones, desplegadas como dos proyectos Vercel: Web y Admin.

## Consecuencias

Las aplicaciones comparten herramientas y paquetes, pero tienen dominios y ciclos de despliegue separados. M00 solo crea páginas placeholder.
