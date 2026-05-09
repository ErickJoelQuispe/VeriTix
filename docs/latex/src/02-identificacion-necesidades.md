# Identificación de necesidades y diseño del proyecto

## Estudio inicial y planificación del proyecto

### Identificar las fases del proyecto y su contenido

La planificación original se definió en ocho fases. A continuación se refleja el grado de
cumplimiento según el estado real del repositorio (abril de 2026).

| Fase                              | Contenido planificado                                     |                                             Estado actual |
| --------------------------------- | --------------------------------------------------------- | --------------------------------------------------------: |
| 1. Análisis y diseño              | Requisitos, modelo de datos, contratos API, wireframes    |                                                Completada |
| 2. Autenticación y usuarios       | Registro/login/refresh/roles                              |                      Completada (backend + frontend base) |
| 3. Gestión de eventos y catálogos | CRUD de eventos, recintos, artistas, géneros y formatos   |                                                Completada |
| 4. Venta de tickets               | Órdenes, Stripe Checkout, webhooks, generación de tickets |     Completada en backend; integración frontend pendiente |
| 5. Validación de tickets          | Endpoint de validación y trazabilidad de acceso           |               Backend completado; UI de scanner pendiente |
| 6. Panel administrativo           | Gestión y métricas para administración                    |                       Completada (área admin en frontend) |
| 7. Testing                        | Pruebas unitarias/integración/e2e/concurrencia            | Implementadas en backend; no ejecutadas en esta auditoría |
| 8. Despliegue y documentación     | Operación productiva y manuales finales                   |                                                   Parcial |

### Especificar los objetivos del proyecto

- Centralizar la gestión de eventos y tipos de ticket.
- Automatizar venta, cobro y emisión digital de tickets.
- Evitar sobreventa con consistencia transaccional.
- Asegurar validación de acceso trazable por ticket.
- Mantener un modelo de permisos por rol en backend y frontend.

### Especificar recursos hardware y software

**Hardware de referencia:**

- Equipos de desarrollo para ejecutar backend, frontend y servicios auxiliares.
- Dispositivos móviles para validación de UI responsive y pruebas de lectura QR.
- Servidor de despliegue (cuando se opere en producción).

**Stack software real del proyecto:**

| Capa / dominio | Tecnologías y mecanismos                               |
| -------------- | ------------------------------------------------------ |
| Backend        | NestJS 11, Prisma 7, PostgreSQL, Redis, BullMQ.        |
| Frontend       | Nuxt 4, Vue 3, Nuxt UI, Tailwind 4.                    |
| Auth           | JWT + refresh token HTTP-only con rotación.            |
| Pagos          | Stripe Checkout + webhook (`/api/v1/webhooks/stripe`). |
| Notificaciones | Resend (emails) + colas BullMQ.                        |
| Testing        | Jest, Supertest y suites de concurrencia.              |
| DevOps         | Docker, despliegue manual.                             |

### Especificar recursos materiales y personales

**Recursos materiales:**

- Infraestructura local de desarrollo y repositorio GitHub.
- Servicios externos de pago y correo para entorno real (Stripe, Resend).

**Recursos personales:**

| Rol                  | Responsabilidad                             |
| -------------------- | ------------------------------------------- |
| Equipo de desarrollo | Backend, frontend y base de datos.          |
| Tutor                | Seguimiento técnico y validación académica. |

### Asociación entre fases y recursos (materiales y humanos)

| Fase                        | Recursos materiales                          |      Recursos humanos       |
| --------------------------- | -------------------------------------------- | :-------------------------: |
| Análisis/diseño             | Herramientas de modelado y documentación     | Equipo técnico del proyecto |
| Desarrollo backend/frontend | IDE, control de versiones, servicios locales | Equipo técnico del proyecto |
| Testing                     | Suites automáticas + dispositivos de prueba  |   Equipo técnico + tutor    |
| Revisiones por hito         | Documentación de avance y evidencias         |       Tutor académico       |
| Despliegue / cierre         | Servidor, reverse proxy, certificados TLS    |   Equipo técnico + tutor    |

## Aspectos fiscales y laborales

### Obligaciones de protección de datos (RGPD/LOPD-GDD)

El sistema trata datos personales de usuarios registrados (identidad y contacto), por lo que debe
garantizar información al usuario, base legal del tratamiento, medidas de seguridad y gestión de
derechos ARSOPL.

### Aspectos fiscales

Para explotación comercial, las operaciones de venta deben integrarse con obligaciones de
facturación e impuestos aplicables según jurisdicción.

### Prevención de riesgos laborales

En el contexto de desarrollo software, los riesgos principales son ergonómicos y visuales derivados
del trabajo prolongado con pantallas, mitigables con pausas y condiciones de puesto adecuadas.

## Viabilidad económica

### Presupuesto económico

| Concepto                                     |                   Coste estimado |
| -------------------------------------------- | -------------------------------: |
| Desarrollo realizado por el equipo académico | 0€ (coste imputado no monetario) |
| Dominio y hosting básico anual               |  Bajo (dependiente de proveedor) |
| Licencias software base                      |           0€ (stack open source) |

### Financiación necesaria

La fase académica requiere financiación reducida. Para fase comercial, la estructura de costes
debe recalcularse según volumen transaccional, SLAs y soporte.

### Ayudas y subvenciones

Como opción futura, el proyecto podría optar a programas de emprendimiento o digitalización,
condicionado a formalización empresarial y plan financiero específico.
