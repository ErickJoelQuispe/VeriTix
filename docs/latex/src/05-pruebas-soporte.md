# Pruebas y soporte

## Documento de pruebas a realizar

La estrategia de pruebas se estructura por niveles y distingue entre evidencia existente en
repositorio, contratos del backend, esquema Prisma y cobertura aún pendiente de integración
funcional en frontend.

### Pruebas unitarias (backend)

Cobertura de servicios y controladores en módulos críticos (auth, events, orders, tickets, webhooks,
catálogos), con pruebas localizadas en `backend/src/**/**.spec.ts`.

### Pruebas de integración y e2e (backend)

Suites en `backend/test/` para auth, eventos, órdenes, tickets, catálogos y concurrencia.

### Pruebas de concurrencia/carga

Scripts de concurrencia y stress declarados en `backend/package.json` (`test:concurrency`, `test:load`,
`test:stress`, `test:soak`).

### Pruebas de seguridad funcional

Validación de autenticación JWT, permisos por rol y comportamiento de validación de tickets.

### Pruebas de acceso y usabilidad (frontend)

Frontend con tests unitarios/nuxt/e2e vía Vitest; no obstante, el flujo completo de compra y
scanner QR no está integrado en UI en el estado actual.

## Registro de pruebas

|  ID   | Evidencia (resumen)                                               |   Estado   |
| :---: | ----------------------------------------------------------------- | :--------: |
|  T01  | Unitaria backend: backend/src/.../tickets.generator.spec.ts       | Disponible |
|  T02  | Unitaria backend: backend/src/.../tickets.service.spec.ts         | Disponible |
|  T03  | Integración/e2e auth: backend/test/auth.e2e-spec.ts               | Disponible |
|  T04  | Integración/e2e events: backend/test/events.e2e-spec.ts           | Disponible |
|  T05  | Integración/e2e orders: backend/test/orders.e2e-spec.ts           | Disponible |
|  T06  | Integración/e2e tickets: backend/test/tickets.e2e-spec.ts         | Disponible |
|  T07  | Concurrencia: backend/test/concurrency/orders.concurrency.spec.ts | Disponible |
|  T08  | Seguridad config: backend/src/config/env.validation.ts            | Disponible |
|  T09  | Frontend tests: scripts Vitest en frontend/package.json           | Disponible |
|  T10  | Compra E2E UI: sin rutas frontend de órdenes/tickets              | Pendiente  |
|  T11  | Ticket PDF UI: flujo frontend no implementado                     | Pendiente  |
|  T12  | Scanner QR UI: pantalla/flujo final no integrado                  | Pendiente  |

## Evaluación de cumplimiento de objetivos

| Requisito                          | Verificación (resumen)                      |                 Estado                  |
| ---------------------------------- | ------------------------------------------- | :-------------------------------------: |
| OBJ-01 Gestión de eventos          | CRUD y administración disponibles           |                Cumplido                 |
| OBJ-02 Seguridad de tickets        | Hash único + validación backend             |           Cumplido (backend)            |
| OBJ-03 Anti-sobreventa             | Lógica transaccional + pruebas concurrencia |                Cumplido                 |
| OBJ-04 Roles y permisos            | Guards y restricciones por endpoint         |                Cumplido                 |
| OBJ-05 Compra UX completa          | Flujo completo desde frontend               |                 Parcial                 |
| OBJ-06 Entrega ticket al comprador | Visualización/descarga en frontend          |                 Parcial                 |
| OBJ-07 Escaneo QR móvil            | UI de scanner integrada                     |                Pendiente                |
| OBJ-08 Trazabilidad validaciones   | validatedAt / validatedBy en tickets        |                Cumplido                 |
| OBJ-09 Prueba bajo carga           | Scripts/suites declarados                   | Disponible (sin ejecución en auditoría) |
| OBJ-10 Consistencia doc-código     | Documentación alineada a estado real        |                Mejorada                 |

## Soporte y mantenimiento

- Mantener trazabilidad entre issue, PR y prueba asociada.
- Priorizar correcciones en flujos críticos: autenticación, órdenes, tickets y webhooks.
- Versionar cambios documentales junto con cambios funcionales para evitar deriva de contenido.
