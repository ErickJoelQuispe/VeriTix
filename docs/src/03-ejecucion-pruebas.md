# Ejecución del proyecto y pruebas

## Riesgos de ejecución del proyecto

### Identificación de riesgos del proyecto

| ID | Riesgo | Probabilidad | Impacto |
|---|---|---|---|
| R01 | Retrasos en el desarrollo por complejidad técnica no estimada (especialmente en la integración con Stripe Checkout, la generación de QR y las transacciones atómicas) | Media | Alto |
| R02 | Pérdida de datos o corrupción de la base de datos durante el desarrollo o el despliegue | Baja | Muy Alto |
| R03 | Vulnerabilidades de seguridad no detectadas en el sistema de autenticación JWT o en la generación de hashes QR | Baja | Muy Alto |
| R04 | Problemas de rendimiento y escalabilidad bajo alta concurrencia en el momento de apertura de venta de entradas | Media | Alto |
| R05 | Incompatibilidades entre versiones de librerías del stack tecnológico (NestJS 11, Prisma 7, Nuxt 4) | Media | Medio |
| R06 | Cambios en los requisitos del proyecto durante el desarrollo que requieran refactorizaciones significativas | Baja | Medio |

### Creación de plan de prevención de riesgos

- **R01 — Retrasos por complejidad:** Se reserva un buffer de tiempo del 15-20% en la
  planificación de las fases más complejas. Se dedicará tiempo inicial a crear prototipos o
  pruebas de concepto (PoC) de los componentes más críticos (integración Stripe, webhook
  processing) antes de integrarlos en el sistema principal.
- **R02 — Pérdida de datos:** Se configurarán copias de seguridad automáticas diarias de la
  base de datos PostgreSQL. El uso de Prisma con un sistema de migraciones controladas
  evita cambios destructivos accidentales en el esquema.
- **R03 — Vulnerabilidades de seguridad:** Se realizarán revisiones de seguridad del código
  en los módulos de autenticación y generación de QR. Las claves secretas
  (`JWT_SECRET`, `JWT_REFRESH_SECRET`) nunca se almacenarán en el código fuente,
  sino en variables de entorno validadas al arranque mediante un esquema Joi en
  `env.validation.ts`.
- **R04 — Problemas de rendimiento:** Se realizarán pruebas de carga con herramientas
  como Artillery o k6 para simular múltiples compradores concurrentes. Se implementarán
  índices en la base de datos en los campos de búsqueda más frecuentes y se utilizará
  Redis como capa de caché para las consultas de catálogo.
- **R05 — Incompatibilidades:** Se fijarán las versiones de todas las dependencias en los
  archivos `package.json` y se utilizará Docker para garantizar que el entorno de desarrollo
  es idéntico para ambos desarrolladores y al entorno de producción.
- **R06 — Cambios en requisitos:** Se mantendrán reuniones de seguimiento periódicas con
  el tutor para validar el avance y detectar posibles cambios de alcance de forma temprana,
  minimizando su impacto.

## Documentación de ejecución

### Necesidades legales

Para la puesta en marcha del proyecto VeriTix en su fase de desarrollo y pruebas académicas
no se requieren permisos administrativos de obra ni licencias de actividad, al tratarse de un
servicio digital. Sin embargo, para una eventual comercialización se deberán considerar los
siguientes aspectos normativos:

- **Protección de Datos:** Como ya se indicó en el punto 2.2, el tratamiento de datos
  personales de los usuarios (nombre, email, teléfono) obliga al cumplimiento del RGPD y
  la LOPD-GDD, incluyendo el registro de actividades de tratamiento y la publicación de
  una política de privacidad.
- **Ley de Servicios de la Sociedad de la Información (LSSI-CE):** La plataforma, al operar
  como servicio de comercio electrónico, deberá incluir los datos de identificación del
  prestador del servicio, las condiciones generales de contratación y la política de cookies.
- **Pasarela de Pago:** La integración con Stripe Checkout cumple con el estándar de
  seguridad PCI-DSS para el manejo de datos de tarjetas bancarias, ya que en ningún
  momento los datos de la tarjeta del comprador pasan por los servidores de VeriTix.

### Ejecución del proyecto

**Ficheros de configuración principales:**

- **`docker-compose.yml` (raíz del monorepo):** Orquesta los servicios de PostgreSQL,
  Redis, backend (NestJS 11) y frontend (Nuxt 4) en contenedores Docker. Define las redes
  internas, los volúmenes de datos persistentes para la base de datos y las variables de
  entorno de cada servicio.
- **`.env` (backend):** Contiene las variables de entorno del backend:
  - `DATABASE_URL`: Cadena de conexión de Prisma a PostgreSQL.
  - `JWT_SECRET`: Clave para la firma de los access tokens JWT.
  - `JWT_REFRESH_SECRET`: Clave para la firma de los refresh tokens.
  - `AES_SECRET_KEY`: Clave para operaciones criptográficas adicionales.
  - `FRONTEND_URL`: URL base del frontend, usada en los emails y la configuración de CORS.
  - `STRIPE_SECRET_KEY`: Clave secreta de la API de Stripe.
  - `STRIPE_WEBHOOK_SECRET`: Secreto para verificar la autenticidad de los webhooks de Stripe.
  - `REDIS_HOST`: Host del servidor Redis.
  - `REDIS_PORT`: Puerto del servidor Redis (por defecto 6379).
  - `REDIS_PASSWORD`: Contraseña de autenticación de Redis.
  - `RESEND_API_KEY`: Clave de la API de Resend para el envío de emails transaccionales.
  - `EMAIL_FROM`: Dirección de remitente para los correos enviados por el sistema.
  - `PORT`: Puerto del servidor backend (por defecto 3001).
- **`.env` (frontend / Nuxt 4):** Contiene las variables de entorno del frontend:
  `NUXT_PUBLIC_API_BASE_URL` (URL base de la API del backend) y otras configuraciones
  específicas de Nuxt.
- **`prisma/schema.prisma` (backend):** Define el esquema completo de la base de datos con
  el lenguaje de definición de esquemas de Prisma (PSL), incluyendo los modelos `User`,
  `RefreshToken`, `Venue`, `ConcertFormat`, `Genre`, `Artist`, `Event`, `EventArtist`,
  `TicketType`, `Order`, `OrderItem`, `Ticket` y `Payment` con sus campos, tipos,
  relaciones y restricciones.

**Características técnicas de la implementación:**

- El backend de NestJS 11 implementa el patrón de inyección de dependencias (IoC) propio
  del framework, con módulos, servicios y controladores claramente separados. Todos los
  endpoints están documentados automáticamente con Swagger/OpenAPI, accesible en
  `/api/docs`.
- El frontend de Nuxt 4 utiliza los composables de Nuxt para el consumo de la API, con
  lógica de autenticación que gestiona el access token JWT. Los middlewares de Nuxt
  protegen las rutas del panel de administración según el rol del usuario.
- Prisma 7 genera tipos TypeScript a partir del esquema de la base de datos, garantizando
  type safety en todas las consultas del backend.
- La lógica de compra de tickets utiliza `prisma.$transaction()` para ejecutar la verificación
  de disponibilidad y la creación de la orden como una operación atómica indivisible,
  previniendo la sobreventa bajo carga concurrente.
- La autenticación implementa un esquema de doble token: el access token (15 min) se
  envía en la cabecera `Authorization`, y el refresh token (7 días) se almacena en una
  cookie HTTP-only. Cada vez que se refresca, el token anterior se invalida en la tabla
  `refresh_tokens` mediante su `jti`, impidiendo su reutilización.
- Las notificaciones de email se gestionan de forma asíncrona: los emails de verificación
  se envían de forma inmediata; los recordatorios de eventos próximos se encolan en
  BullMQ con Redis y se procesan por workers en segundo plano.
- La capa de caché con Redis almacena los resultados de las consultas más frecuentes
  (listado de eventos: TTL 2 min; catálogos de artistas/géneros/formatos: TTL 5 min;
  detalle de evento: TTL 1 hora), reduciendo la carga sobre la base de datos.

### Manuales finales

**Manual de Usuario:**

Se elaborará un manual de usuario que describirá paso a paso las operaciones principales para
cada perfil: cómo registrarse e iniciar sesión, cómo crear y publicar un evento (para creadores),
cómo buscar y comprar un ticket (para compradores), cómo escanear y validar un QR (para
validadores) y cómo acceder al panel de administración y estadísticas (para administradores).
Incluirá capturas de pantalla de las principales vistas de la aplicación.

**Manual de Instalación:**

Se documentará el procedimiento completo de instalación del entorno de desarrollo local
(prerrequisitos: Node.js v20+, Docker Desktop, Git), el proceso de clonado del repositorio, la
configuración de las variables de entorno a partir de los archivos `.env.example`, la ejecución de
las migraciones de Prisma (`prisma migrate dev`) y el arranque de todos los servicios con Docker
Compose. Se incluirá también el proceso de despliegue en un servidor VPS de producción con
NGINX.

**Manual de Configuración y Administración:**

Se documentará la configuración de las variables de entorno críticas (`JWT_SECRET`,
`JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `DATABASE_URL`, `REDIS_HOST`), el proceso de creación del primer
usuario administrador, la gestión de las migraciones de base de datos con Prisma Migrate, el
procedimiento de realización de copias de seguridad de PostgreSQL y la consulta de los logs de
la aplicación a través de Docker.

## Incidencias

### Definir un protocolo para resolución de incidencias

#### Recopilación de información

Ante cualquier incidencia reportada por un usuario o detectada en el sistema, se recopilará la
siguiente información de forma sistemática: descripción detallada del problema y pasos para
reproducirlo, perfil del usuario afectado (rol, navegador, dispositivo), fecha y hora exacta en que
se produjo la incidencia, mensajes de error visibles en la interfaz y, si están disponibles, los logs
del servidor (backend y base de datos) correspondientes al momento del error.

#### Posible solución

Una vez recopilada la información, se procederá a la clasificación de la incidencia según su
criticidad (crítica, alta, media o baja) y su naturaleza (bug funcional, problema de rendimiento,
incidencia de seguridad, problema de usabilidad). Se identificará el módulo afectado, se
reproducirá el error en el entorno de desarrollo y se procederá a la implementación de la
corrección, seguida de las pruebas de regresión necesarias para asegurar que la solución no
introduce nuevos problemas.

#### Registro

Todas las incidencias se registrarán en el sistema de gestión de issues del repositorio GitHub
del proyecto, incluyendo: título descriptivo, descripción completa con pasos de reproducción,
clasificación de severidad, módulo/componente afectado, estado (abierta, en progreso, resuelta,
cerrada), commit o pull request con la solución aplicada y fecha de resolución. Este registro
servirá como historial de mantenimiento y como fuente de conocimiento para la resolución de
incidencias futuras similares.
