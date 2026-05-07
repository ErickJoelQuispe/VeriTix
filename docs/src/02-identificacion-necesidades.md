# Identificación de necesidades y diseño del proyecto

## Estudio inicial y planificación del proyecto

### Identificar las fases del proyecto y su contenido

- **Fase 1 — Análisis y Diseño (Semanas 1-2):** Definición detallada de los requerimientos
  funcionales y no funcionales, diseño del modelo de Entidad/Relación de la base de datos,
  diseño de los diagramas de casos de uso y elaboración de los wireframes de las
  principales interfaces de usuario. También se define el contrato de la API REST
  (endpoints, métodos, parámetros de entrada y salida).
- **Fase 2 — Autenticación y Usuarios (Semanas 3-4):** Implementación del módulo de
  registro, inicio de sesión mediante JWT con refresh token rotativo, y gestión de perfiles de
  usuario. Configuración de Prisma 7 con PostgreSQL y definición del esquema de la base
  de datos. Implementación del sistema de roles y guards en el backend.
- **Fase 3 — Gestión de Eventos (Semanas 5-7):** Desarrollo del CRUD completo de eventos
  y tipos de ticket en el backend. Implementación de las interfaces de creación, listado y
  detalle de eventos en el frontend con Nuxt 4. Control de capacidades y validaciones de
  negocio. Módulos de catálogo (artistas, recintos, géneros, formatos).
- **Fase 4 — Sistema de Tickets (Semanas 8-11):** Implementación de la lógica de compra
  con Stripe Checkout y transacciones atómicas, generación de códigos QR con hash
  único SHA, envío de notificaciones por correo con Resend y visualización del historial de
  tickets del comprador.
- **Fase 5 — Módulo de Validación (Semanas 12-13):** Desarrollo de la interfaz de escaneo
  QR para dispositivos móviles, implementación de la lógica de verificación en el backend
  y registro de los accesos validados.
- **Fase 6 — Panel de Administración (Semana 14):** Desarrollo del panel de estadísticas en
  tiempo real para organizadores y administradores, con métricas de ventas y control de
  aforo.
- **Fase 7 — Testing y QA (Semanas 15-16):** Elaboración de pruebas unitarias e integración
  para los módulos críticos del backend. Pruebas de carga y rendimiento. Pruebas de
  usuario en los flujos principales.
- **Fase 8 — Despliegue y Documentación (Semanas 17-18):** Configuración del entorno de
  producción en servidor VPS, despliegue con Docker, configuración de NGINX y SSL/TLS.
  Redacción de los manuales de usuario, instalación y administración.

### Especificar los objetivos del proyecto

- Proporcionar una plataforma web centralizada que permita a cualquier organizador crear
  y gestionar eventos con múltiples tipos de tickets y control de aforo automatizado.
- Automatizar el proceso completo de venta y distribución de tickets digitales, eliminando
  la necesidad de entradas físicas y reduciendo los costos operativos asociados a su
  producción y envío.
- Garantizar el control de acceso a los eventos mediante un sistema de validación QR
  antifraude, que detecte y prevenga el uso duplicado o falsificado de entradas.
- Optimizar el control de aforo con actualizaciones de disponibilidad instantáneas y
  prevención de sobreventa mediante transacciones atómicas en la base de datos.
- Implementar un sistema de autenticación y gestión de roles que garantice que cada perfil
  de usuario (comprador, creador, validador, administrador) acceda exclusivamente a las
  funcionalidades que le corresponden.
- Proporcionar una experiencia de usuario intuitiva y accesible desde cualquier dispositivo,
  tanto para la gestión del evento por parte del organizador como para la compra por parte
  del asistente.

### Especificar recursos hardware y software

**Recursos Hardware:**

- **Ordenadores de desarrollo:** Mínimo procesador de 4 núcleos, 8 GB de RAM y 100 GB de
  almacenamiento SSD para ejecutar el entorno de desarrollo completo (Docker con
  PostgreSQL, Redis, backend NestJS y frontend Nuxt 4) de forma simultánea.
- **Dispositivos móviles:** Smartphones con cámara para realizar las pruebas de escaneo de
  códigos QR y verificar la responsividad de las interfaces en pantallas pequeñas.
- **Servidor de producción:** VPS (Servidor Privado Virtual) con un mínimo de 2 vCPU, 4 GB
  de RAM y 50 GB de almacenamiento SSD para alojar la aplicación en producción.

**Recursos Software — Stack Tecnológico:**

- **Backend:** NestJS 11 con TypeScript como framework principal para el desarrollo de la
  API REST. Prisma 7 como capa de acceso a datos con PostgreSQL como motor de base
  de datos relacional.
- **Frontend:** Vue 3 con Nuxt 4 como framework SSR/SPA, Nuxt UI y Tailwind 4 para el
  sistema de diseño y estilos de la interfaz de usuario.
- **Autenticación y Seguridad:** JSON Web Tokens (JWT) con access token de 15 minutos y
  refresh token en cookie HTTP-only con rotación almacenada en base de datos. Bcrypt
  para el hash de contraseñas. Librería `qrcode` para la generación de códigos QR con
  hash SHA único.
- **Pagos:** Stripe Checkout para el procesamiento de pagos y webhooks para la
  confirmación asíncrona de transacciones.
- **Notificaciones:** Resend para el envío de correos electrónicos (verificación, confirmación
  de orden, reembolso, recordatorios). BullMQ con Redis para la gestión de colas de tareas.
- **Caché:** Redis como capa de caché del backend con TTLs configurados por tipo de
  recurso (2 min, 5 min, 1 hora).
- **Herramientas de desarrollo:** Visual Studio Code como editor de código, Docker y Docker
  Compose para la orquestación del entorno de desarrollo y producción, Git con GitHub
  para el control de versiones, y Postman para las pruebas de la API REST.
- **Testing:** Jest para las pruebas unitarias e integración del backend.

### Especificar recursos materiales y personales

**Recursos Materiales:**

- Equipos informáticos de desarrollo con las especificaciones indicadas en el punto anterior.
- Conexión a internet estable para el acceso a repositorios, documentación técnica y
  servicios en la nube.
- Dominio web para el despliegue de la aplicación en producción (coste aproximado de 15€/año).
- Servidor VPS para el entorno de producción (coste aproximado de 10€/mes).

**Recursos Personales:**

- Dos desarrolladores full-stack (alumnos del ciclo DAW/DAM), encargados conjuntamente
  de la implementación del backend, el frontend, la base de datos y el despliegue de la
  aplicación.
- Tutor/Mentor del proyecto, responsable de la supervisión técnica y pedagógica del
  trabajo, la revisión del cumplimiento de los requisitos y la validación de los entregables
  en cada hito del proyecto.

### Realizar una asociación de fases y recursos materiales que deben intervenir en cada fase

| Fase del Proyecto | Recursos Materiales |
|---|---|
| Fase 1: Análisis y Diseño | PCs de desarrollo, herramienta de diagramación (StarUML/draw.io), herramienta de wireframing |
| Fases 2-6: Desarrollo (BE/FE) | PCs de desarrollo, entorno Docker local, repositorio GitHub, Postman para pruebas API |
| Fase 7: Testing y QA | PCs de desarrollo, dispositivos móviles reales para pruebas de escaneo QR y responsividad |
| Fase 8: Despliegue | Servidor VPS, dominio web, certificados SSL/TLS (Let's Encrypt) |

### Realizar una asociación de fases y recursos humanos que deben intervenir en cada fase

| Fase del Proyecto | Recursos Humanos |
|---|---|
| Todas las fases de desarrollo | Los dos alumnos desarrolladores como ejecutores principales de toda la lógica de negocio, base de datos e interfaces |
| Hitos de revisión (fin de cada fase) | El tutor del proyecto para la revisión del trabajo realizado y validación del cumplimiento de los objetivos parciales |
| Fase de Testing y Despliegue | Ambos alumnos en colaboración para la realización de pruebas cruzadas y corrección de errores detectados |
| Entrega final | Tutor para la revisión y evaluación del cumplimiento de todos los requerimientos establecidos al inicio |

## Aspectos fiscales y laborales

**Obligaciones en materia de Protección de Datos (RGPD / LOPD-GDD):**

El sistema VeriTix tratará datos personales de los usuarios registrados (nombre, apellidos,
dirección de correo electrónico y número de teléfono), lo que lo convierte en responsable del
tratamiento en los términos del Reglamento General de Protección de Datos (RGPD) de la Unión
Europea y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos
digitales (LOPD-GDD). Esto implica las siguientes obligaciones:

- Informar a los usuarios, en el momento del registro, sobre el tratamiento de sus datos,
  la finalidad, la base legal y sus derechos (acceso, rectificación, supresión, portabilidad y
  oposición) mediante una política de privacidad accesible.
- Implementar medidas técnicas y organizativas adecuadas para garantizar la seguridad
  de los datos (cifrado de contraseñas con bcrypt, comunicaciones cifradas con SSL/TLS,
  acceso restringido por roles).
- No ceder los datos a terceros sin consentimiento explícito del usuario, salvo que exista
  una obligación legal.
- Mantener un registro de actividades de tratamiento si se superan los umbrales
  establecidos por la normativa.

**Aspectos fiscales:**

El sistema está diseñado para registrar todas las transacciones de compra de tickets con su
importe correspondiente. En un escenario de comercialización real, el sistema se integra con
Stripe como pasarela de pago legalmente reconocida para la facturación de los servicios. Las
transacciones estarían sujetas al Impuesto sobre el Valor Añadido (IVA) según la normativa fiscal
vigente en España, siendo aplicable el tipo general del 21% sobre la comisión de servicio cobrada
por la plataforma.

**Prevención de Riesgos Laborales:**

Al tratarse de un proyecto de desarrollo de software, los principales riesgos laborales son los
propios del trabajo con pantallas de visualización de datos (PVD): fatiga visual, problemas
posturales y trastornos musculoesqueléticos derivados de largas horas de trabajo frente al
ordenador. Para su prevención se seguirán las recomendaciones del Real Decreto 488/1997
sobre disposiciones mínimas de seguridad relativas al trabajo con equipos que incluyen pantallas
de visualización, incluyendo pausas periódicas, correcta iluminación del puesto de trabajo y uso
de mobiliario ergonómico.

## Viabilidad económica

### Realizar un presupuesto económico del proyecto

| Concepto | Descripción | Coste Estimado |
|---|---|---|
| Desarrollo (Fases I-VI) | 14-18 semanas de trabajo de dos desarrolladores junior a 300€/semana por alumno (estimación académica) | ~9.000€ (coste real de mercado) |
| Coste real del proyecto | Al ser un proyecto académico ejecutado por los propios alumnos, el coste de desarrollo es 0€ | 0€ |
| Dominio web | Registro de dominio .com o .es por un año | ~15€/año |
| Servidor VPS (producción) | VPS básico 2vCPU / 4GB RAM en proveedor cloud (ej. Hetzner, DigitalOcean) | ~10€/mes |
| Licencias de software | Uso exclusivo de tecnologías Open Source: NestJS, Nuxt, Prisma, PostgreSQL, Docker | 0€ |
| Certificado SSL | Let's Encrypt (gratuito) para HTTPS en producción | 0€ |
| Servicio de email (Resend) | Plan gratuito de Resend para envío de notificaciones durante el desarrollo | 0€ |
| **TOTAL lanzamiento inicial** | | **~135€ (primer año)** |

### Identificar la financiación necesaria

Dado que el proyecto se ejecuta en un contexto académico y los costes de desarrollo son
absorbidos por el propio trabajo de los alumnos, la financiación necesaria para el lanzamiento
inicial es mínima (alrededor de 135€ para el primer año, correspondientes al dominio y el servidor
VPS). Esta cantidad es perfectamente asumible mediante autofinanciación por parte de los
propios emprendedores sin necesidad de recurrir a financiación externa.

En un escenario de comercialización real, la plataforma podría adoptar un modelo de negocio de
comisión por ticket vendido (entre el 5% y el 10% del precio de la entrada), lo que generaría
ingresos desde el primer evento gestionado y permitiría amortizar rápidamente los costes de
infraestructura escalada.

### Detallar posibles ayudas y subvenciones

Para la fase de comercialización del proyecto, podrían solicitarse las siguientes ayudas y
subvenciones:

- Programas de emprendimiento tecnológico para jóvenes ofrecidos por las Cámaras de
  Comercio locales y las Comunidades Autónomas, que incluyen a menudo formación,
  mentoring y ayudas económicas para la fase de arranque.
- Líneas de financiación del ENISA (Empresa Nacional de Innovación) dirigidas a
  empresas de base tecnológica en fase semilla o de arranque.
- Convocatorias de subvenciones para la digitalización de empresas del sector cultural y
  del entretenimiento, en el marco de los fondos europeos Next Generation EU y los Planes
  de Recuperación, Transformación y Resiliencia.
- Programas de incubación de startups tecnológicas de universidades e institutos
  politécnicos, que pueden proveer infraestructura, mentoría y conexiones con potenciales
  inversores.

## Modelo de solución

### Modelado de la solución

**Arquitectura General del Sistema**

VeriTix adopta una arquitectura desacoplada cliente-servidor organizada como un monorepo,
donde dos aplicaciones independientes se comunican exclusivamente a través de una API REST
con formato JSON. Esta separación de responsabilidades garantiza que el backend pueda
evolucionar de forma independiente del frontend y viceversa, y permite que en el futuro la misma
API pueda ser consumida por aplicaciones móviles nativas u otros clientes.

| Aspecto | Backend (NestJS 11) | Frontend (Vue 3 / Nuxt 4) |
|---|---|---|
| Responsabilidad principal | Lógica de negocio, API REST, acceso a BD, seguridad | Interfaz de usuario, experiencia del usuario, consumo de API |
| Framework | NestJS 11 con TypeScript | Vue 3 con Nuxt 4 y TypeScript |
| Puerto de desarrollo | 3001 | 3000 |
| Comunicación | Expone endpoints REST con autenticación JWT | Consume la API del backend con Bearer Token |
| ORM / BD | Prisma 7 + PostgreSQL | N/A (no accede directamente a la BD) |
| Módulos principales | auth, users, events, ticket-types, orders, tickets, webhooks, notifications, queues, artists, venues, genres, concert-formats, cache | auth, catálogo público de eventos, panel admin, perfil de usuario |

**Stack Tecnológico Detallado**

| Capa | Tecnología | Versión / Notas |
|---|---|---|
| Framework Backend | NestJS + TypeScript | v11, arquitectura modular |
| ORM | Prisma | v7, Type-safe, migraciones automáticas |
| Base de Datos | PostgreSQL | v15+, transacciones ACID |
| Caché | Redis | Cache de consultas frecuentes con TTLs (2 min / 5 min / 1 hora) |
| Colas | BullMQ | Procesamiento asíncrono de recordatorios y tareas diferidas |
| Framework Frontend | Vue 3 + Nuxt 4 | App Router, SSR/SPA |
| Estilos | Tailwind 4 + Nuxt UI | Utility-first CSS framework |
| Autenticación | JWT (access token 15 min + refresh token 7 días) | Cookie HTTP-only con rotación, jti almacenado en BD |
| Hash de contraseñas | bcrypt | Salt rounds: 12 |
| Generación QR | qrcode (npm) | Código QR en base64 sobre hash SHA único |
| Pagos | Stripe Checkout + Webhooks | Confirmación asíncrona vía webhook |
| Notificaciones email | Resend | Verificación, confirmación orden, reembolso, recordatorios |
| Contenerización | Docker + Docker Compose | Entorno reproducible |
| Servidor web (prod.) | NGINX | Reverse proxy + SSL termination |
| Control de versiones | Git + GitHub | Monorepo único |

**Estructura de Módulos del Backend**

El backend de NestJS 11 está organizado en módulos independientes siguiendo el patrón de
inyección de dependencias propio del framework, lo que facilita el testing unitario y el
mantenimiento:

- **Módulo `auth`:** Gestiona el registro, el inicio de sesión, la verificación de email, el
  refresco de token y el cierre de sesión. Expone los endpoints `POST /api/v1/auth/register`,
  `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` y
  `GET /api/v1/auth/verify-email`. Implementa el sistema de refresh token rotativo con
  identificador único (`jti`) almacenado en la tabla `refresh_tokens`.
- **Módulo `users`:** Gestión del perfil propio del usuario autenticado y administración de
  usuarios por parte del administrador.
- **Módulo `events`:** CRUD completo de eventos (`GET /api/v1/events`, `POST /api/v1/events`,
  `PATCH /api/v1/events/:id`, `DELETE /api/v1/events/:id`). Incluye listado público con
  filtros y paginación, publicación, cancelación y estadísticas. Protegido por guards de rol
  (`creator`, `admin`).
- **Módulo `ticket-types`:** Permite a los creadores definir múltiples tipos de ticket para un
  mismo evento (nombre, descripción, precio, cantidad disponible).
- **Módulo `orders`:** Gestiona la lógica de compra. Implementa la transacción atómica que
  verifica la disponibilidad y reserva el stock. Crea la sesión de Stripe Checkout y devuelve
  la URL de pago al frontend.
- **Módulo `webhooks`:** Procesa los eventos de Stripe (`checkout.session.completed`,
  cancelaciones, reembolsos) de forma asíncrona. Tras confirmación de pago, genera los
  tickets con hash único SHA.
- **Módulo `tickets`:** Expone el historial de tickets del comprador y el endpoint de validación
  por hash. Implementa el marcado irreversible de tickets como `USED`.
- **Módulo `notifications`:** Envío de emails transaccionales mediante Resend: verificación de
  cuenta, confirmación de orden, notificación de reembolso y recordatorios de eventos.
- **Módulo `queues`:** Gestión de colas con BullMQ y Redis para el procesamiento diferido
  de recordatorios de eventos próximos.
- **Módulo `artists`:** CRUD de artistas con relación a eventos.
- **Módulo `venues`:** CRUD de recintos con información de localización y aforo.
- **Módulo `genres`:** Catálogo de géneros musicales.
- **Módulo `concert-formats`:** Catálogo de formatos de concierto.
- **Módulo `cache`:** Capa de caché con Redis, con claves estructuradas y TTLs diferenciados
  por tipo de recurso.

**Modelo de Datos (Entidades Principales)**

Las entidades principales del sistema y sus relaciones son las siguientes:

- **`users`:** Almacena los datos del usuario (`id`, `email`, `passwordHash`, `name`, `phone`,
  `role`, `isEmailVerified`, `createdAt`). El campo `role` es un enumerado con los valores
  `BUYER`, `CREATOR`, `VALIDATOR` y `ADMIN`.
- **`refresh_tokens`:** Almacena los refresh tokens activos con su identificador único (`jti`),
  `userId`, `expiresAt` y `revokedAt`, permitiendo la rotación e invalidación selectiva.
- **`venues`:** Recintos donde se celebran los eventos (`id`, `name`, `address`, `city`,
  `country`, `capacity`).
- **`concert_formats`:** Catálogo de formatos de concierto (festival, concierto, etc.).
- **`genres`:** Catálogo de géneros musicales.
- **`artists`:** Artistas o grupos musicales (`id`, `name`, `bio`, `imageUrl`).
- **`events`:** Almacena los datos del evento (`id`, `name`, `description`, `creatorId`,
  `venueId`, `concertFormatId`, `maxCapacity`, `eventDate`, `status`, `currency`, `createdAt`).
  El campo `status` es un enumerado (`DRAFT`, `PUBLISHED`, `FINISHED`, `CANCELLED`).
- **`event_artists`:** Tabla intermedia para la relación N:M entre eventos y artistas.
- **`ticket_types`:** Define los tipos de ticket de un evento (`id`, `eventId`, `name`,
  `description`, `price`, `totalQuantity`, `availableQuantity`).
- **`orders`:** Registra cada intento de compra (`id`, `buyerId`, `status`, `stripeSessionId`,
  `totalAmount`, `currency`, `createdAt`). El estado puede ser `PENDING`, `COMPLETED`,
  `CANCELLED` o `REFUNDED`.
- **`order_items`:** Detalle de cada línea de una orden (`id`, `orderId`, `ticketTypeId`,
  `quantity`, `unitPrice`).
- **`tickets`:** Representa una entrada individual generada tras la confirmación del pago
  (`id`, `orderId`, `ticketTypeId`, `eventId`, `buyerId`, `hash`, `status`, `validatedAt`,
  `validatedBy`, `createdAt`). El campo `hash` contiene el identificador único SHA del ticket.
  El campo `status` es un enumerado (`ACTIVE`, `USED`, `CANCELLED`).
- **`payments`:** Registro del pago asociado a una orden (`id`, `orderId`, `stripePaymentIntentId`,
  `amount`, `currency`, `status`).

**Flujo Principal de Compra de un Ticket**

El flujo de compra sigue los siguientes pasos:

1. El usuario comprador (`buyer`) autenticado selecciona un evento y un tipo de ticket en el
   frontend (Nuxt 4) y envía la solicitud de compra al backend (`POST /api/v1/orders`).
2. El backend (NestJS 11) verifica el token JWT, el rol del usuario y la disponibilidad del tipo
   de ticket dentro de una transacción atómica de base de datos (`prisma.$transaction()`).
3. Si hay disponibilidad, Prisma 7 decrementa en la cantidad solicitada el campo
   `availableQuantity` del `TicketType` y crea el registro de la `Order` con estado `PENDING`,
   todo dentro de la misma transacción atómica.
4. El backend crea una sesión de Stripe Checkout y devuelve la URL de pago al frontend.
5. El usuario completa el pago en la plataforma de Stripe.
6. Stripe envía el evento `checkout.session.completed` al endpoint de webhooks del backend
   (`POST /api/v1/webhooks/stripe`).
7. El módulo de webhooks procesa el evento: actualiza el estado de la `Order` a `COMPLETED`,
   genera los tickets individuales con un hash único SHA por ticket y notifica al comprador
   por correo electrónico mediante Resend.

**Arquitectura de Seguridad**

- **Autenticación JWT:** Todos los endpoints protegidos requieren un access token JWT válido
  en la cabecera `Authorization: Bearer <token>`. El token tiene una caducidad de 15 minutos.
  El refresh token se almacena en una cookie HTTP-only con duración de 7 días y se rota
  en cada uso, invalidando el token anterior mediante su `jti` en la tabla `refresh_tokens`.
- **Autorización por Roles:** Los guards de NestJS (`RolesGuard`) verifican que el rol del
  usuario coincide con los roles permitidos para cada endpoint (por ejemplo, solo los usuarios
  con rol `creator` o `admin` pueden crear eventos).
- **Encriptación de Passwords:** Las contraseñas se almacenan como hash generado con
  bcrypt con un salt de 12 rondas.
- **QR Antifalsificación:** El contenido de cada código QR es un hash único generado con SHA
  a partir de los datos del ticket (id del ticket + id del evento + timestamp + valor aleatorio).
  Cada hash es irrepetible y está almacenado en la base de datos, por lo que un QR
  modificado externamente no coincidirá con ningún registro válido.
- **Transacciones Atómicas:** Las operaciones de compra utilizan `prisma.$transaction()`
  para garantizar que la verificación de disponibilidad y la creación del pedido son
  operaciones atómicas, evitando condiciones de carrera que podrían resultar en sobreventa.
- **Variables de Entorno Validadas:** Las variables de entorno críticas se validan al arranque
  del servidor mediante un esquema Joi definido en `env.validation.ts`, impidiendo que la
  aplicación inicie con configuración incompleta.

**Mapa Topológico del Despliegue en Producción**

| Componente | Tecnología | Puerto | Descripción |
|---|---|---|---|
| Reverse Proxy | NGINX | 80 / 443 | Enruta el tráfico HTTPS hacia los servicios internos y gestiona los certificados SSL/TLS |
| Frontend | Nuxt 4 (Node.js) | 3000 (interno) | Servidor SSR de Nuxt, sirve las páginas y activos estáticos |
| Backend | NestJS 11 (Node.js) | 3001 (interno) | API REST, lógica de negocio y conexión a la base de datos |
| Base de Datos | PostgreSQL 15 | 5432 (interno) | Motor de base de datos relacional. No expuesto al exterior |
| Caché / Colas | Redis | 6379 (interno) | Caché de consultas y broker de colas BullMQ |
| Contenedorización | Docker Compose | N/A | Orquesta los servicios anteriores en contenedores aislados |

### Detalle de los puntos que se van a controlar para validar el proyecto

Para verificar que el proyecto cumple con todos los requisitos establecidos, se definen los
siguientes puntos de control que serán comprobados durante la fase de testing:

- **Integridad del QR:** El hash almacenado en el campo `hash` del ticket debe coincidir con
  el hash decodificado del QR presentado en la validación. Se verificará que no se puede
  validar un QR modificado o generado externamente.
- **Unicidad de Acceso (Anti-Duplicado):** Una vez validado un ticket por primera vez, su
  estado debe cambiar de `ACTIVE` a `USED` de forma irreversible en la base de datos. Un
  segundo intento de validación del mismo QR debe devolver el estado `USED` con la fecha
  y hora de la primera validación, sin permitir el acceso.
- **Consistencia de Stock (Anti-Sobreventa):** El sistema no debe permitir la venta de más
  tickets que la cantidad máxima configurada para cada tipo de ticket (`availableQuantity`).
  Se realizarán pruebas de concurrencia para verificar que las transacciones atómicas de
  Prisma previenen la sobreventa incluso bajo carga simultánea de múltiples compradores.
- **Control de Acceso por Roles:** Las rutas de creación y edición de eventos deben responder
  con un error HTTP 403 (Forbidden) cuando son accedidas por usuarios con un rol no
  autorizado (por ejemplo, un `buyer` intentando crear un evento). La ruta de validación QR
  solo debe ser accesible para usuarios con rol `validator` o `admin`.
- **Registro de Auditoría:** Cada validación exitosa debe registrar en la base de datos la fecha
  y hora exacta de la validación (`validatedAt`) y el identificador del validador que realizó el
  escaneo (`validatedBy`), permitiendo una trazabilidad completa para auditoría.
- **Notificación por Email tras la Compra:** Tras completar una compra exitosa (confirmación
  del webhook de Stripe), el comprador debe recibir en su correo electrónico un mensaje de
  confirmación de orden con los datos del evento, en un tiempo máximo de 60 segundos.
