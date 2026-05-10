# Pruebas y soporte

## Estrategia de pruebas

La estrategia de pruebas se estructura por niveles y distingue entre backend
(servicios, controladores, integración) y frontend (lógica de transformación,
comportamiento de composables, autenticación).

## Backend

### Pruebas unitarias

Cobertura de servicios y controladores en módulos críticos (auth, events,
orders, tickets, webhooks, catálogos), con pruebas localizadas en
`backend/src/**/**.spec.ts`.

### Pruebas de integración y e2e

Suites en `backend/test/` para auth, eventos, órdenes, tickets, catálogos y
concurrencia.

### Pruebas de concurrencia/carga

Scripts de concurrencia y stress declarados en `backend/package.json`
(`test:concurrency`, `test:load`, `test:stress`, `test:soak`).

### Pruebas de seguridad funcional

Validación de autenticación JWT, permisos por rol y comportamiento de
validación de tickets.

## Frontend

Las pruebas de frontend se ejecutan con Vitest en dos proyectos:

- **`unit`** (44 tests): lógica pura sin dependencia de Nuxt. Transformación
  de datos de API (mappers, filtros, formateo de fechas y monedas),
  normalización de errores HTTP, validación estructural de repositorios.
- **`nuxt`** (36 tests): comportamiento de composables con runtime Nuxt.
  Autenticación (login, register, refreshSession, ensureSession, logout),
  auto-retry ante 401 con renovación de token, perfil de usuario (fetch,
  update, changePassword), gestión de notificaciones (add, remove,
  auto-dismiss), middlewares de ruta (auth, guest, backoffice), páginas de
  autenticación (login, register, forgot-password).

---

::: {.latex-figure width="0.92\\linewidth"}

![Ejecución de los 80 tests del frontend](assets/frontend-tests.png)

:::

### Organización de tests

Los tests se organizan por dominio reflejando la estructura del código fuente:

```bash
test/
├── unit/                            → 16 archivos
│   ├── auth/                        → useApiErrorMessage, route-access
│   ├── public/                      → normalizeFilters, mappers, currency, date
│   ├── repositories/                → estructura y exports por repositorio
│   └── utils/                       → formatMoney
│
└── nuxt/                            → 6 archivos
    ├── auth/                        → useAuth, useApiRequest, useProfile,
    │                                   middlewares, páginas de auth
    └── ui/                          → useToastQueue
```

Cada archivo de test cubre una única fuente (un composable, un repositorio o
una función) y su nombre indica claramente qué está testeando.

### Infraestructura de tests

- Vitest configurado con `test.alias` + `extends: true` para resolver el alias
  `@/` en tests de entorno Node, apuntando a `app/`.
- `nuxt.config.ts` incluye `typescript.tsConfig` para que TypeScript reconozca
  tipos de Node (`fs`, `path`) en archivos de test.
- Declaration file `test/nuxt/nuxt.d.ts` para el macro `mockNuxtImport`,
  permitiendo `nuxt typecheck` sin errores.
- Advertencias de Vue Suspense y `vitest/environments` silenciadas via
  `onConsoleLog` en la configuración de Vitest y plugin en cliente.

## Registro de pruebas

|  ID   | Evidencia                                                         |
| :---: | ----------------------------------------------------------------- |
|  T01  | Unitaria backend: tickets.generator.spec.ts                       |
|  T02  | Unitaria backend: tickets.service.spec.ts                         |
|  T03  | Integración/e2e auth: backend/test/auth.e2e-spec.ts               |
|  T04  | Integración/e2e events: backend/test/events.e2e-spec.ts           |
|  T05  | Integración/e2e orders: backend/test/orders.e2e-spec.ts           |
|  T06  | Integración/e2e tickets: backend/test/tickets.e2e-spec.ts         |
|  T07  | Concurrencia: backend/test/concurrency/orders.concurrency.spec.ts |
|  T08  | Seguridad config: backend/src/config/env.validation.ts            |
|  T09  | Auth composable: refresh, logout, ensureSession                   |
|  T10  | Auto-retry HTTP 401 con refresh token                             |
|  T11  | Perfil de usuario (fetch, update, changePassword)                 |
|  T12  | Toast queue (add, remove, auto-dismiss, tipos)                    |
|  T13  | Errores HTTP (timeout, 401, 403, 422, session expired)            |
|  T14  | Filtros y mappers de datos públicos                               |
|  T15  | Repositorios backend (estructura y exports)                       |

## Evaluación de cumplimiento de objetivos

| Requisito                        | Verificación                                |
| -------------------------------- | ------------------------------------------- |
| OBJ-01 Gestión de eventos        | CRUD y administración disponibles           |
| OBJ-02 Seguridad de tickets      | Hash único + validación backend             |
| OBJ-03 Anti-sobreventa           | Lógica transaccional + pruebas concurrencia |
| OBJ-04 Roles y permisos          | Guards y restricciones por endpoint         |
| OBJ-08 Trazabilidad validaciones | validatedAt / validatedBy en tickets        |
| OBJ-09 Prueba bajo carga         | Scripts/suites declarados                   |
| OBJ-10 Consistencia doc-código   | Documentación alineada a estado real        |

## Soporte y mantenimiento

- Mantener trazabilidad entre issue, PR y prueba asociada.
- Priorizar correcciones en flujos críticos: autenticación, órdenes, tickets y
  webhooks.
- Versionar cambios documentales junto con cambios funcionales para evitar
  deriva de contenido.
