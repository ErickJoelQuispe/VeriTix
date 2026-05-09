# Estudio inicial previo a la realización del proyecto

## Clasificación de empresas del sector por organización y servicio

El sector de gestión de eventos y ticketing digital puede agruparse en tres tipos de organizaciones:

### Organizadores de eventos

Promotoras, instituciones y asociaciones que necesitan publicar eventos, controlar aforo y gestionar
ventas desde una plataforma única.

### Plataformas de ticketing

Empresas que comercializan entradas de terceros y operan con alto volumen transaccional,
especialmente en aperturas de venta con picos de concurrencia.

### Operadores de acceso y validación

Equipos y empresas que gestionan el acceso físico al recinto y requieren validación rápida, trazable
y resistente a intentos de reutilización de entradas.

## Ejemplo de estructura organizativa del sector

Una ticketera digital de tamaño medio suele organizarse en la siguiente matriz funcional:

| Área funcional      | Responsabilidad principal                                 |
| ------------------- | --------------------------------------------------------- |
| Dirección           | Estrategia y priorización de negocio.                     |
| Operaciones         | Relación con organizadores y operación de eventos.        |
| Tecnología          | Backend, frontend, base de datos, seguridad y despliegue. |
| Comercial/marketing | Captación de organizadores y promoción.                   |
| Atención al cliente | Incidencias de compra y acceso.                           |
| Validación en campo | Control de acceso durante el evento.                      |

## Necesidades que cubre VeriTix

VeriTix aborda necesidades reales del sector con alcance verificable en el repositorio:

| Necesidad del sector              | Implementación verificable en VeriTix                                           |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Centralización operativa          | Gestión de eventos, catálogos y usuarios desde una API unificada.               |
| Control de stock y sobreventa     | Compra con transacciones atómicas en PostgreSQL/Prisma.                         |
| Trazabilidad del acceso           | Tickets con hash único y registro de validación (`validatedAt`, `validatedBy`). |
| Automatización del flujo de cobro | Integración con Stripe Checkout + webhooks.                                     |
| Notificación transaccional        | Envío de emails de verificación y confirmación mediante Resend y BullMQ.        |

## Descripción del proyecto

VeriTix es un monorepo con dos aplicaciones desacopladas orientado a la gestión integral de eventos y
ticketing. El backend concentra la lógica transaccional, la seguridad y la persistencia; el frontend
ofrece la experiencia de compra, administración y consulta para usuarios finales y creadores.

| Componente | Tecnología                                              |
| ---------- | ------------------------------------------------------- |
| Backend    | NestJS 11 + TypeScript + Prisma 7 + PostgreSQL + Redis. |
| Frontend   | Nuxt 4 + Vue 3 + Nuxt UI + Tailwind 4.                  |

La autenticación se basa en JWT (access token de corta vida y refresh token en cookie HTTP-only
con rotación). El flujo cubre publicación de eventos, compra transaccional, emisión de tickets
digitales con QR/hash único, validación de acceso y trazabilidad operativa. El dominio contempla
roles `BUYER`, `CREATOR`, `VALIDATOR` y `ADMIN`.

## Justificación del tipo de solución

Se selecciona arquitectura web desacoplada (API REST + cliente web SSR/SPA) por:

| Criterio                | Justificación técnica                                              |
| ----------------------- | ------------------------------------------------------------------ |
| Escalabilidad operativa | Separación de backend y frontend para evolucionar cada capa.       |
| Mantenibilidad          | Módulos de dominio en NestJS y tipado fuerte extremo a extremo.    |
| Portabilidad            | La API puede reutilizarse por otros clientes (ej. app móvil).      |
| Accesibilidad           | Acceso multiplataforma sin instalación de software cliente nativo. |

## Características principales del sistema

| Capacidad                          | Implementación actual                                  |
| ---------------------------------- | ------------------------------------------------------ |
| Autenticación y roles por servidor | Validación de permisos por endpoint.                   |
| Compra transaccional con Stripe    | Confirmación por webhook y generación de tickets.      |
| Tickets digitales con QR y hash    | Trazabilidad de uso, validación de acceso y auditoría. |
| Catálogos de dominio               | Artistas, recintos, géneros y formatos.                |
| Panel administrativo               | Gestión operativa desde el frontend.                   |
| Caché con Redis                    | Optimización de consultas frecuentes.                  |
| Notificaciones transaccionales     | Verificación, confirmación y avisos por email.         |
