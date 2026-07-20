# ADR-0003: Supabase Web y Google OAuth

- Estado: Aceptada
- Fecha: 2026-07-20

## Contexto

El ecosistema requerirá persistencia, almacenamiento y acceso administrativo sin acoplarse a la operación existente de Noma.

## Decisión

Usar un proyecto Supabase Web con Postgres, Auth y Storage, y Google OAuth para identidad futura. El proyecto Supabase de Noma permanece separado y fuera de alcance.

## Consecuencias

Las políticas RLS, el modelo de datos, las credenciales y la integración se diseñarán en hitos posteriores. M00 solo inicializa carpetas y configuración local sin tablas ni secretos.
