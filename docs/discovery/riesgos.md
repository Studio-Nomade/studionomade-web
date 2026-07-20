# Registro inicial de riesgos

| ID   | Riesgo                                                                 | Probabilidad | Impacto | Mitigación inicial                                                                | Dueño                           |
| ---- | ---------------------------------------------------------------------- | ------------ | ------- | --------------------------------------------------------------------------------- | ------------------------------- |
| R-01 | Pérdida de correo por cambios DNS incompletos                          | Media        | Alto    | Exportar zona, preservar MX/SPF/DKIM/DMARC, plan de rollback y validación         | Studio Nomade / Infraestructura |
| R-02 | Secretos o know-how en el repositorio público                          | Media        | Crítico | `.gitignore`, secret scan en CI, revisión humana y separación del core privado    | Equipo técnico                  |
| R-03 | Dependencia accidental del repositorio privado                         | Media        | Alto    | Instalación y build aislados en CI; contratos públicos versionados                | Equipo técnico                  |
| R-04 | Accesos privilegiados sin inventario o MFA                             | Media        | Alto    | Resolver PB-01/02/03/05, mínimo privilegio y cuentas nominativas                  | Studio Nomade                   |
| R-05 | Modificación involuntaria de Noma                                      | Baja         | Crítico | Tratar Noma como sistema externo y fuera de alcance; no aplicar DNS ni código     | Equipo técnico                  |
| R-06 | Incompatibilidad de contratos entre Web y Noma                         | Media        | Alto    | Manifiesto versionado y validación en hitos futuros                               | Arquitectura                    |
| R-07 | Secret scanning nativo no habilitado por configuración de organización | Media        | Alto    | Ejecutar Gitleaks CLI sin licencia en CI y confirmar la capacidad nativa en PB-07 | Administrador GitHub            |
| R-08 | Ambientes Web/Admin conectados al proyecto equivocado                  | Media        | Alto    | Inventariar IDs/regiones, nombres explícitos y revisión previa al despliegue      | Infraestructura                 |
| R-09 | Dependencias comprometidas o desactualizadas                           | Media        | Alto    | Lockfile, instalación congelada, revisión automatizada futura                     | Equipo técnico                  |

Los dueños representan roles hasta que Studio Nomade asigne personas nominativas.
