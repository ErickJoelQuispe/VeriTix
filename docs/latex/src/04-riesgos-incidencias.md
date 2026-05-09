# Gestión de riesgos e incidencias

## Objetivo

Anticipar los principales riesgos de evolución, integración y despliegue del proyecto, y dejar
definido un protocolo claro de actuación si aparece una incidencia en producción o en un entorno
previo.

## Riesgos principales

|  ID   | Riesgo                                                                     | Probabilidad | Impacto  |
| :---: | -------------------------------------------------------------------------- | :----------: | :------: |
|  R01  | Desalineación entre funcionalidades backend y frontend                     |    Media     |   Alto   |
|  R02  | Errores en flujos de pago/webhook con efectos en órdenes y tickets         |    Media     |   Alto   |
|  R03  | Defectos de seguridad en autenticación o manejo de secretos                |     Baja     | Muy alto |
|  R04  | Degradación bajo concurrencia en compra de tickets                         |    Media     |   Alto   |
|  R05  | Desactualización documental respecto al código real                        |     Alta     |  Medio   |
|  R06  | Merge o despliegue a `main` con fallos que terminen afectando a producción |     Baja     | Muy alto |

## Medidas preventivas y de mitigación

| Riesgo | Mitigación                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| R01    | Mantener una matriz de estado funcional por capa (backend/frontend) y revisarla en cada hito.                |
| R02    | Ejecutar pruebas de integración y e2e específicas de órdenes, tickets y webhooks.                            |
| R03    | Validación estricta de entorno, revisión de permisos y rotación de credenciales.                             |
| R04    | Mantener y ampliar las suites de concurrencia (`test:concurrency`) y stress.                                 |
| R05    | Revisiones documentales periódicas con trazabilidad directa a archivos de código.                            |
| R06    | Proteger `main` con PR obligatorio, revisiones requeridas, checks obligatorios y bloqueo de pushes directos. |

## Safeguards sobre `main`

Para evitar que cambios defectuosos lleguen a producción, la rama `main` debe permanecer protegida:

- no se permiten pushes directos
- no se permiten merges sin revisión previa
- no se puede mergear si fallan los checks
- las PRs deben pasar CI antes de integrarse

## Protocolo de incidencias

### Recopilación de información

Para cada incidencia se debe registrar: contexto funcional, pasos de reproducción, rol afectado,
hora, entorno (local/staging/prod), trazas relevantes y severidad.

### Diagnóstico y solución

1. Clasificar la incidencia (funcional, seguridad, rendimiento, datos, UX).
2. Reproducir el problema en un entorno controlado.
3. Aplicar la corrección mínima verificable.
4. Ejecutar pruebas de regresión del módulo impactado.
5. Si afecta a producción, aplicar rollback o hotfix según severidad.

### Comunicación

- Registrar la incidencia en GitHub como issue etiquetado por tipo y prioridad.
- Notificar a los stakeholders relevantes (equipo, tutor) para incidencias críticas o bloqueantes.

## Necesidades legales y operativas

En el contexto académico no se requieren licencias de actividad. Para explotación comercial sí
aplica cumplimiento en protección de datos, comercio electrónico y obligaciones fiscales.
