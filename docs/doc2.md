PROYECTO FIN DE CICLO
DAM/DAW
VeriTix
Fase: [Número: nombre de fase]
[Erick Quispe – Juan Rangel]

Los documentos, elementos gráficos, vídeos, transparencias y otros recursos didácticos incluidos en este
contenido pueden contener imprecisiones técnicas o errores tipográficos. Periódicamente se realizan cambios
en el contenido. Fomento Ocupacional FOC SL puede realizar en cualquier momento, sin previo aviso, mejoras
y/o cambios en el contenido
Es responsabilidad del usuario el cumplimiento de todas las leyes de derechos de autor aplicables. Ningún
elemento de este contenido (documentos, elementos gráficos, vídeos, transparencias y otros recursos
didácticos asociados), ni parte de este contenido puede ser reproducida, almacenada o introducida en un
sistema de recuperación, ni transmitida de ninguna forma ni por ningún medio (ya sea electrónico, mecánico,
por fotocopia, grabación o de otra manera), ni con ningún propósito, sin la previa autorización por escrito de
Fomento Ocupacional FOC SL.
Este contenido está protegido por la ley de propiedad intelectual e industrial. Pertenecen a Fomento
Ocupacional FOC SL los derechos de autor y los demás derechos de propiedad intelectual e industrial sobre
este contenido.
Sin perjuicio de los casos en que la ley aplicable prohíbe la exclusión de la responsabilidad por daños, Fomento
Ocupacional FOC SL no se responsabiliza en ningún caso de daños indirectos, sean cuales fueren su
naturaleza u origen, que se deriven o de otro modo estén relacionados con el uso de este contenido.
© 2023 Fomento Ocupacional FOC SL todos los derechos reservados.

Índice
No table of contents entries found.

FOMENTO OCUPACIONAL FOC ®
1. Estudio inicial previo a la realización del
proyecto
1.1. Clasificar las empresas del sector por sus características
organizativas y el tipo de producto o servicio que ofrecen
El sector de gestión de eventos y ticketing digital engloba a un amplio espectro de organizaciones
que se pueden clasificar según sus características organizativas y el tipo de producto o servicio
que ofrecen:
Organizadores de Eventos
Empresas, instituciones públicas o privadas y asociaciones que necesitan una plataforma
centralizada para la creación, configuración y gestión profesional de sus actos. Dentro de esta
categoría encontramos desde grandes promotoras musicales y empresas de entretenimiento,
hasta pymes del sector MICE (Meetings, Incentives, Conferences and Exhibitions),
ayuntamientos que gestionan eventos culturales y organizaciones deportivas. Su necesidad
principal es disponer de un panel de control unificado que les permita configurar aforos, tipos de
entrada y precios, así como obtener estadísticas en tiempo real.
Plataformas distribuidoras de Tickets
Empresas especializadas en la venta automatizada y distribución digital de entradas, como
Ticketmaster, Eventbrite o Fever, cuyo modelo de negocio se basa en cobrar una comisión por
cada entrada vendida. Estas plataformas actúan como intermediarias entre el organizador y el
comprador final, y requieren infraestructuras robustas capaces de soportar picos de demanda
muy elevados en el momento de apertura de venta de entradas para eventos de gran afluencia.
Empresas de Seguridad y Logística de Acceso
Entidades que proveen el personal y las herramientas tecnológicas para el control de acceso y
validación de identidad en los puntos de entrada a los recintos. Estas empresas requieren
dispositivos y software ágiles que permitan escanear y verificar cientos de entradas por minuto,
minimizando las colas y garantizando que no se produzcan accesos duplicados o fraudulentos.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 4

FOMENTO OCUPACIONAL FOC ®
1.2. Poner un ejemplo de estructura organizativa para una
empresa del sector
Una empresa típica del sector, por ejemplo una ticketera digital de tamaño mediano, presentaría
la siguiente estructura organizativa:
 Dirección General: Responsable de la estrategia empresarial, relaciones institucionales
y toma de decisiones de alto nivel.
 Departamento de Operaciones: Gestión de la plataforma, relación con los organizadores
y supervisión de los recintos asociados.
 Departamento de Ventas y Marketing: Captación de nuevos eventos y organizadores, así
como la promoción de tickets a los compradores finales a través de canales digitales.
 Departamento Técnico (IT): Desarrollo y mantenimiento de la infraestructura web, la base
de datos y los sistemas de seguridad. Incluye equipos de backend, frontend, DevOps y
ciberseguridad.
 Departamento de Atención al Cliente: Gestión de incidencias, reclamaciones y soporte
tanto a organizadores como a compradores.
 Personal de Campo y Validación: Responsables del despliegue de dispositivos de
escaneo y del control de aforo en el lugar del evento el día del mismo.
1.3. Identificar las necesidades demandas que cubre el proyecto y
asociarlas con las necesidades del cliente.
El proyecto VeriTix da respuesta a las siguientes problemáticas reales del sector, asociando cada
una con la necesidad concreta de los diferentes perfiles de cliente:
 Gestión desorganizada: Resuelve la falta de una plataforma centralizada para los
organizadores, que actualmente deben combinar hojas de cálculo, correo electrónico y
herramientas no especializadas para gestionar sus eventos.
 Fraude y falsificación: Mitiga el riesgo de duplicación y falsificación de entradas mediante
la generación de códigos QR únicos con hash criptográfico, que no pueden ser
replicados.
 Control de aforo en tiempo real: Satisface la necesidad de los organizadores de realizar
un seguimiento instantáneo de la disponibilidad de plazas, previniendo la sobreventa
mediante el uso de transacciones atómicas en la base de datos.
 Costos operativos elevados: Elimina la necesidad de imprimir, distribuir y gestionar
entradas físicas, así como la logística de envío, reduciendo significativamente los costos
para el organizador.
 Experiencia de usuario deficiente: Proporciona a los compradores una experiencia de
compra digital ágil desde cualquier dispositivo, con entrega instantánea del ticket en
formato PDF por correo electrónico.
1.4. Descripción del proyecto.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 5

FOMENTO OCUPACIONAL FOC ®
VeriTix es un sistema web integral desarrollado como aplicación monorepo que digitaliza todo el
ciclo de vida de un evento: desde el registro del creador y la configuración del evento con
múltiples tipos de tickets y precios diferenciados, pasando por la venta en tiempo real con control
automático de stock, hasta la compra por parte del usuario y la validación final mediante escaneo
QR en el punto de acceso.
El sistema está estructurado en dos aplicaciones independientes que se comunican a través de
una API REST: un backend desarrollado con Nest.js y TypeScript que contiene toda la lógica de
negocio, y un frontend desarrollado con Vue 3 y Nuxt 3 que proporciona las interfaces de usuario
adaptadas a cada perfil. La persistencia de datos se gestiona con PostgreSQL como motor de
base de datos y Prisma ORM como capa de acceso a datos, garantizando seguridad de tipos
(Type Safety) y facilitando las migraciones. La autenticación se implementa mediante JSON Web
Tokens (JWT) y el sistema de roles controla el acceso a las distintas funcionalidades.
El sistema contempla cuatro perfiles de usuario diferenciados: compradores, creadores de
eventos, validadores y administradores, cada uno con sus propias vistas y permisos dentro de la
aplicación.
1.5. Justificar el tipo de proyecto elegido para dar solución al
problema.
Se ha elegido una aplicación web full-stack con arquitectura desacoplada (backend API REST +
frontend SPA/SSR) por los siguientes motivos técnicos y de negocio:
 Automatización total del proceso: La aplicación web elimina la intervención manual en las
fases de venta, distribución y validación de tickets, reduciendo el margen de error humano
al mínimo.
 Accesibilidad universal: Al ser una aplicación web, tanto los organizadores para gestionar
sus eventos como los compradores para adquirir sus entradas pueden acceder desde
cualquier dispositivo (móvil, tablet u ordenador) sin necesidad de instalar ningún software
adicional.
 Seguridad robusta: El uso de transacciones atómicas en la base de datos (propiedades
ACID de PostgreSQL) previene la sobreventa incluso en escenarios de alta concurrencia.
La encriptación de los códigos QR con firma digital previene la falsificación.
 Escalabilidad: La arquitectura de servicios independientes (Nest.js + Nuxt 3) permite
escalar el backend y el frontend de forma independiente según la demanda, lo que es
especialmente relevante en los picos de venta de eventos de gran popularidad.
 Mantenibilidad: El uso de TypeScript de extremo a extremo y de frameworks con
convenciones bien establecidas (Nest.js para el backend, Vue/Nuxt para el frontend)
facilita el mantenimiento del código y la incorporación de nuevos desarrolladores.
1.6. Características principales del proyecto elegido.
 Gestión de Roles diferenciados: La plataforma contempla perfiles específicos para
compradores (buyer), creadores de eventos (creator), personal de validación (validator)
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 6

FOMENTO OCUPACIONAL FOC ®
y administradores del sistema (admin), cada uno con acceso exclusivo a las
funcionalidades que le corresponden.
 Venta en Tiempo Real con control de inventario: Sistema de compra con actualización
dinámica de la disponibilidad por tipo de ticket (VIP, General, Estudiante, etc.),
respaldado por transacciones atómicas que impiden la sobreventa incluso bajo carga
concurrente.
 Validación QR ágil: Sistema de escaneo mediante la cámara del dispositivo móvil con
respuesta visual instantánea (verde para Válido, amarillo para Ya usado, rojo para
Inválido), que permite un flujo de acceso eficiente.
 Distribución Multicanal de tickets: Los tickets se generan en formato digital con código
QR único y cifrado, y pueden descargarse en formato PDF para su presentación tanto en
pantalla como impreso.
 Panel de administración con estadísticas: Los organizadores y administradores disponen
de un panel con métricas en tiempo real sobre tickets vendidos, aforo restante y registros
de validaciones.
 Notificaciones por correo electrónico: El sistema envía automáticamente los tickets en
PDF al comprador tras completar la transacción, a través de un servicio SMTP integrado.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 7

FOMENTO OCUPACIONAL FOC ®
2. Identificación de necesidades y diseño del
proyecto
2.1. Estudio inicial y planificación del proyecto
2.1.1. Identificar las fases del proyecto y su contenido.
 Fase 1 — Análisis y Diseño (Semanas 1-2): Definición detallada de los requerimientos
funcionales y no funcionales, diseño del modelo de Entidad/Relación de la base de datos,
diseño de los diagramas de casos de uso y elaboración de los wireframes de las
principales interfaces de usuario. También se define el contrato de la API REST
(endpoints, métodos, parámetros de entrada y salida).
 Fase 2 — Autenticación y Usuarios (Semanas 3-4): Implementación del módulo de
registro, inicio de sesión mediante JWT y gestión de perfiles de usuario. Configuración
de Prisma ORM con PostgreSQL y definición del esquema de la base de datos.
Implementación del sistema de roles y guards en el backend.
 Fase 3 — Gestión de Eventos (Semanas 5-7): Desarrollo del CRUD completo de eventos
y tipos de ticket en el backend. Implementación de las interfaces de creación, listado y
detalle de eventos en el frontend con Nuxt 3. Control de capacidades y validaciones de
negocio.
 Fase 4 — Sistema de Tickets (Semanas 8-11): Implementación de la lógica de compra
con transacciones atómicas, generación de códigos QR con hash criptográfico, envío de
notificaciones por correo con el PDF del ticket y visualización del historial de tickets del
comprador.
 Fase 5 — Módulo de Validación (Semanas 12-13): Desarrollo de la interfaz de escaneo
QR para dispositivos móviles, implementación de la lógica de verificación en el backend
y registro de los accesos validados.
 Fase 6 — Panel de Administración (Semana 14): Desarrollo del panel de estadísticas en
tiempo real para organizadores y administradores, con métricas de ventas y control de
aforo.
 Fase 7 — Testing y QA (Semanas 15-16): Elaboración de pruebas unitarias e integración
para los módulos críticos del backend. Pruebas de carga y rendimiento. Pruebas de
usuario en los flujos principales.
 Fase 8 — Despliegue y Documentación (Semanas 17-18): Configuración del entorno de
producción en servidor VPS, despliegue con Docker, configuración de NGINX y SSL/TLS.
Redacción de los manuales de usuario, instalación y administración.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 8

FOMENTO OCUPACIONAL FOC ®
2.1.2. Especificar los objetivos del proyecto.
 Proporcionar una plataforma web centralizada que permita a cualquier organizador crear
y gestionar eventos con múltiples tipos de tickets y control de aforo automatizado.
 Automatizar el proceso completo de venta y distribución de tickets digitales, eliminando
la necesidad de entradas físicas y reduciendo los costos operativos asociados a su
producción y envío.
 Garantizar el control de acceso a los eventos mediante un sistema de validación QR
antifraude, que detecte y prevenga el uso duplicado o falsificado de entradas.
 Optimizar el control de aforo con actualizaciones de disponibilidad instantáneas y
prevención de sobreventa mediante transacciones atómicas en la base de datos.
 Implementar un sistema de autenticación y gestión de roles que garantice que cada perfil
de usuario (comprador, creador, validador, administrador) acceda exclusivamente a las
funcionalidades que le corresponden.
 Proporcionar una experiencia de usuario intuitiva y accesible desde cualquier dispositivo,
tanto para la gestión del evento por parte del organizador como para la compra por parte
del asistente.
2.1.3. Especificar recursos hardware y software.
Recursos Hardware:
 Ordenadores de desarrollo: Mínimo procesador de 4 núcleos, 8 GB de RAM y 100 GB de
almacenamiento SSD para ejecutar el entorno de desarrollo completo (Docker con
PostgreSQL, backend Nest.js y frontend Nuxt 3) de forma simultánea.
 Dispositivos móviles: Smartphones con cámara para realizar las pruebas de escaneo de
códigos QR y verificar la responsividad de las interfaces en pantallas pequeñas.
 Servidor de producción: VPS (Servidor Privado Virtual) con un mínimo de 2 vCPU, 4 GB
de RAM y 50 GB de almacenamiento SSD para alojar la aplicación en producción.
Recursos Software — Stack Tecnológico:
 Backend: Nest.js con TypeScript como framework principal para el desarrollo de la API
REST. Prisma ORM como capa de acceso a datos con PostgreSQL como motor de base
de datos relacional.
 Frontend: Vue 3 con Nuxt 3 como framework SSR/SPA y Tailwind CSS para el sistema
de diseño y estilos de la interfaz de usuario.
 Autenticación y Seguridad: JSON Web Tokens (JWT) con Passport.js para la
autenticación. Bcrypt para el hash de contraseñas. Librería qrcode para la generación de
códigos QR y AES-256 para su encriptación.
 Herramientas de desarrollo: Visual Studio Code como editor de código, Docker y Docker
Compose para la orquestación del entorno de desarrollo y producción, Git con GitHub
para el control de versiones, y Postman para las pruebas de la API REST.
 Testing: Jest para las pruebas unitarias e integración del backend, y Vitest para el
frontend.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 9

FOMENTO OCUPACIONAL FOC ®
2.1.4. Especificar recursos materiales y personales.
Recursos Materiales:
 Equipos informáticos de desarrollo con las especificaciones indicadas en el punto
anterior.
 Conexión a internet estable para el acceso a repositorios, documentación técnica y
servicios en la nube.
 Dominio web para el despliegue de la aplicación en producción (coste aproximado de
15€/año).
 Servidor VPS para el entorno de producción (coste aproximado de 10€/mes).
Recursos Personales:
 Dos desarrolladores full-stack (alumnos del ciclo DAW/DAM), encargados conjuntamente
de la implementación del backend, el frontend, la base de datos y el despliegue de la
aplicación.
 Tutor/Mentor del proyecto, responsable de la supervisión técnica y pedagógica del
trabajo, la revisión del cumplimiento de los requisitos y la validación de los entregables
en cada hito del proyecto.
2.1.5. Realizar una asociación de fases y recursos materiales que
deben intervenir en cada fase
Fase del Proyecto Recursos Materiales
Fase 1: Análisis y Diseño PCs de desarrollo, herramienta de diagramación
(StarUML/draw.io), herramienta de wireframing
Fases 2-6: Desarrollo (BE/FE) PCs de desarrollo, entorno Docker local,
repositorio GitHub, Postman para pruebas API
Fase 7: Testing y QA PCs de desarrollo, dispositivos móviles reales
para pruebas de escaneo QR y responsividad
Fase 8: Despliegue Servidor VPS, dominio web, certificados SSL/TLS
(Let's Encrypt)
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 10

FOMENTO OCUPACIONAL FOC ®
2.1.6. Realizar una asociación de fases y recursos humanos que
deben intervenir en cada fase
Fase del Proyecto Recursos Humanos
Todas las fases de desarrollo Los dos alumnos desarrolladores como
ejecutores principales de toda la lógica de
negocio, base de datos e interfaces
Hitos de revisión (fin de cada fase) El tutor del proyecto para la revisión del trabajo
realizado y validación del cumplimiento de los
objetivos parciales
Fase de Testing y Despliegue Ambos alumnos en colaboración para la
realización de pruebas cruzadas y corrección de
errores detectados
Entrega final Tutor para la revisión y evaluación del
cumplimiento de todos los requerimientos
establecidos al inicio
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 11

FOMENTO OCUPACIONAL FOC ®
2.2. Aspectos fiscales y laborales
Obligaciones en materia de Protección de Datos (RGPD / LOPD-GDD):
El sistema VeriTix tratará datos personales de los usuarios registrados (nombre, apellidos,
dirección de correo electrónico y número de teléfono), lo que lo convierte en responsable del
tratamiento en los términos del Reglamento General de Protección de Datos (RGPD) de la Unión
Europea y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos
digitales (LOPD-GDD). Esto implica las siguientes obligaciones:
 Informar a los usuarios, en el momento del registro, sobre el tratamiento de sus datos,
la finalidad, la base legal y sus derechos (acceso, rectificación, supresión, portabilidad y
oposición) mediante una política de privacidad accesible.
 Implementar medidas técnicas y organizativas adecuadas para garantizar la seguridad
de los datos (cifrado de contraseñas con bcrypt, comunicaciones cifradas con SSL/TLS,
acceso restringido por roles).
 No ceder los datos a terceros sin consentimiento explícito del usuario, salvo que exista
una obligación legal.
 Mantener un registro de actividades de tratamiento si se superan los umbrales
establecidos por la normativa.
Aspectos fiscales:
El sistema está diseñado para registrar todas las transacciones de compra de tickets con su
importe correspondiente. En un escenario de comercialización real, el sistema debería integrarse
con una pasarela de pago legalmente reconocida (como Stripe o PayPal) para la facturación de
los servicios. Las transacciones estarían sujetas al Impuesto sobre el Valor Añadido (IVA) según
la normativa fiscal vigente en España, siendo aplicable el tipo general del 21% sobre la comisión
de servicio cobrada por la plataforma.
Prevención de Riesgos Laborales:
Al tratarse de un proyecto de desarrollo de software, los principales riesgos laborales son los
propios del trabajo con pantallas de visualización de datos (PVD): fatiga visual, problemas
posturales y trastornos musculoesqueléticos derivados de largas horas de trabajo frente al
ordenador. Para su prevención se seguirán las recomendaciones del Real Decreto 488/1997
sobre disposiciones mínimas de seguridad relativas al trabajo con equipos que incluyen pantallas
de visualización, incluyendo pausas periódicas, correcta iluminación del puesto de trabajo y uso
de mobiliario ergonómico.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 12

|     |     | FOMENTO OCUPACIONAL FOC ®  |
| --- | --- | -------------------------- |

2.3. Viabilidad económica

2.3.1. Realizar un presupuesto económico del proyecto.

| Concepto  | Descripción  | Coste Estimado  |
| --------- | ------------ | --------------- |
Desarrollo (Fase I-VI)  14-18 semanas de trabajo de  ~9.000€ (coste real de
|     | dos desarrolladores junior a  | mercado)  |
| --- | ----------------------------- | --------- |
300€/semana por alumno
(estimación académica)
| Coste real del proyecto  | Al ser un proyecto académico  | 0€  |
| ------------------------ | ----------------------------- | --- |
ejecutado por los propios
alumnos, el coste de desarrollo
es 0€
| Dominio web  | Registro de dominio .com o .es  | ~15€/año  |
| ------------ | ------------------------------- | --------- |
por un año
Servidor VPS (producción)  VPS básico 2vCPU / 4GB RAM  ~10€/mes
en proveedor cloud (ej. Hetzner,
DigitalOcean)
| Licencias de software  | Uso exclusivo de tecnologías  | 0€  |
| ---------------------- | ----------------------------- | --- |
Open Source: Nest.js, Nuxt,
Prisma, PostgreSQL, Docker
| Certificado SSL  | Let's Encrypt (gratuito) para  | 0€  |
| ---------------- | ------------------------------ | --- |
HTTPS en producción
| Servicio SMTP (emails)  | Plan gratuito de Resend o  | 0€  |
| ----------------------- | -------------------------- | --- |
Mailgun para envío de tickets
por correo durante el desarrollo
| TOTAL lanzamiento inicial  |     | ~135€ (primer año)  |
| -------------------------- | --- | ------------------- |

|     |     |     |
| --- | --- | --- |
[NOMBRE DEL ALUMNO] [CICLO]  PÁGINA 13

FOMENTO OCUPACIONAL FOC ®
2.3.2. Identificar la financiación necesaria.
Dado que el proyecto se ejecuta en un contexto académico y los costes de desarrollo son
absorbidos por el propio trabajo de los alumnos, la financiación necesaria para el lanzamiento
inicial es mínima (alrededor de 135€ para el primer año, correspondientes al dominio y el servidor
VPS). Esta cantidad es perfectamente asumible mediante autofinanciación por parte de los
propios emprendedores sin necesidad de recurrir a financiación externa.
En un escenario de comercialización real, la plataforma podría adoptar un modelo de negocio de
comisión por ticket vendido (entre el 5% y el 10% del precio de la entrada), lo que generaría
ingresos desde el primer evento gestionado y permitiría amortizar rápidamente los costes de
infraestructura escalada.
2.3.3. Detallar posibles ayudas y subvenciones
Para la fase de comercialización del proyecto, podrían solicitarse las siguientes ayudas y
subvenciones:
 Programas de emprendimiento tecnológico para jóvenes ofrecidos por las Cámaras de
Comercio locales y las Comunidades Autónomas, que incluyen a menudo formación,
mentoring y ayudas económicas para la fase de arranque.
 Líneas de financiación del ENISA (Empresa Nacional de Innovación) dirigidas a
empresas de base tecnológica en fase semilla o de arranque.
 Convocatorias de subvenciones para la digitalización de empresas del sector cultural y
del entretenimiento, en el marco de los fondos europeos Next Generation EU y los Planes
de Recuperación, Transformación y Resiliencia.
 Programas de incubación de startups tecnológicas de universidades e institutos
politécnicos, que pueden proveer infraestructura, mentoría y conexiones con potenciales
inversores.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 14

|     |     | FOMENTO OCUPACIONAL FOC ®  |
| --- | --- | -------------------------- |

2.4. Modelo de solución

2.4.1. Modelado de la solución:

Arquitectura General del Sistema
VeriTix adopta una arquitectura desacoplada cliente-servidor organizada como un monorepo,
donde dos aplicaciones independientes se comunican exclusivamente a través de una API REST
con formato JSON. Esta separación de responsabilidades garantiza que el backend pueda
evolucionar de forma independiente del frontend y viceversa, y permite que en el futuro la misma
API pueda ser consumida por aplicaciones móviles nativas u otros clientes.

| Aspecto  | Backend (Nest.js)  | Frontend (Vue 3 / Nuxt 3)  |
| -------- | ------------------ | -------------------------- |
Responsabilidad  Lógica de negocio, API REST,  Interfaz de usuario, experiencia del
| principal  | acceso a BD, seguridad  | usuario, consumo de API  |
| ---------- | ----------------------- | ------------------------ |
Framework  Nest.js con TypeScript  Vue 3 con Nuxt 3 y TypeScript
| Puerto de desarrollo  | 3001  | 3000  |
| --------------------- | ----- | ----- |
Comunicación  Expone endpoints REST con  Consume la API del backend con
|     | autenticación JWT  | Bearer Token  |
| --- | ------------------ | ------------- |
ORM / BD  Prisma ORM + PostgreSQL  N/A (no accede directamente a la
BD)
Módulos principales  auth, events, ticket-types, tickets,  auth, dashboard/events,
|     | validation  | dashboard/tickets, validator  |
| --- | ----------- | ----------------------------- |

|     |     |     |
| --- | --- | --- |
[NOMBRE DEL ALUMNO] [CICLO]  PÁGINA 15

|     |     | FOMENTO OCUPACIONAL FOC ®  |
| --- | --- | -------------------------- |

Stack Tecnológico Detallado

| Capa  | Tecnología  | Versión / Notas  |
| ----- | ----------- | ---------------- |
Framework Backend  Nest.js + TypeScript  v10+, arquitectura modular
| ORM  | Prisma ORM  | Type-safe, migraciones  |
| ---- | ----------- | ----------------------- |
automáticas
| Base de Datos       | PostgreSQL      | v15+, transacciones ACID     |
| ------------------- | --------------- | ---------------------------- |
| Framework Frontend  | Vue 3 + Nuxt 3  | App Router, SSR/SPA          |
| Estilos             | Tailwind CSS    | Utility-first CSS framework  |
Autenticación  JWT + Passport.js  Tokens con expiración de 24h
| Hash de contraseñas  | bcrypt               | Salt rounds: 12       |
| -------------------- | -------------------- | --------------------- |
| Generación QR        | qrcode (npm)         | Código QR en base64   |
| Generación PDF       | jsPDF + html2canvas  | Ticket en formato A4  |
Contenerización  Docker + Docker Compose  Entorno reproducible
| Servidor web (prod.)  | NGINX  | Reverse proxy + SSL  |
| --------------------- | ------ | -------------------- |
termination
| Control de versiones  | Git + GitHub  | Monorepo único  |
| --------------------- | ------------- | --------------- |

|     |     |     |
| --- | --- | --- |
[NOMBRE DEL ALUMNO] [CICLO]  PÁGINA 16

FOMENTO OCUPACIONAL FOC ®
Estructura de Módulos del Backend
El backend de Nest.js está organizado en módulos independientes siguiendo el patrón de
inyección de dependencias propio del framework, lo que facilita el testing unitario y el
mantenimiento:
 Módulo auth: Gestiona el registro, el inicio de sesión y la validación de tokens JWT.
Expone los endpoints POST /auth/register y POST /auth/login. Implementa las estrategias
de Passport.js y los guards de autenticación y autorización por roles.
 Módulo events: CRUD completo de eventos (GET /events, POST /events, PATCH
/events/:id, DELETE /events/:id). Incluye las validaciones de negocio como la
comprobación de que no se reduce la capacidad por debajo del número de tickets ya
vendidos. Protegido por guards de rol (creator, admin).
 Módulo ticket-types: Permite a los creadores definir múltiples tipos de ticket para un
mismo evento (nombre, descripción, precio, cantidad disponible). Valida que la suma de
las cantidades no supere la capacidad máxima del evento.
 Módulo tickets: Gestiona la lógica de compra. Implementa la transacción atómica que
verifica la disponibilidad, crea el registro del ticket en la base de datos, genera el hash
SHA-256 cifrado con AES-256 y genera el código QR. Expone los endpoints POST
/tickets/buy y GET /tickets/my-tickets.
 Módulo validation: Recibe el contenido escaneado de un QR, lo desencripta, busca el
ticket en la base de datos, verifica su estado y lo marca como 'used' de forma irreversible
si es la primera validación. Expone el endpoint POST /validation/scan y GET
/validation/stats para las estadísticas del evento.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 17

FOMENTO OCUPACIONAL FOC ®
Modelo de Datos (Entidades Principales)
Las entidades principales del sistema y sus relaciones son las siguientes:
 User: Almacena los datos del usuario (id, email, password_hash, name, phone, role,
created_at). El campo role es un enumerado con los valores buyer, creator, validator y
admin. Un usuario puede ser creador de múltiples eventos y comprador de múltiples
tickets.
 Event: Almacena los datos del evento (id, name, description, creator_id, max_capacity,
event_date, location, status, created_at). La relación con User es de N:1 (muchos eventos
pueden tener un mismo creador). El campo status es un enumerado (draft, published,
finished, cancelled).
 TicketType: Define los tipos de ticket de un evento (id, event_id, name, description, price,
total_quantity, available_quantity). La relación con Event es de N:1 (un evento puede
tener muchos tipos de ticket).
 Ticket: Representa una entrada individual adquirida (id, event_id, ticket_type_id,
buyer_id, hash, qr_code_url, status, validated_at, validated_by, created_at). La relación
con User (comprador) y con TicketType es de N:1. El campo hash contiene el identificador
único cifrado que se almacena en el QR. El campo status es un enumerado (active, used,
cancelled).
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 18

FOMENTO OCUPACIONAL FOC ®
Flujo Principal de Compra de un Ticket
El flujo de compra sigue los siguientes pasos de forma resumida:
 El usuario comprador (buyer) autenticado selecciona un evento y un tipo de ticket en el
frontend (Nuxt 3) y envía la solicitud de compra al backend.
 El backend (Nest.js) verifica el token JWT, el rol del usuario y la disponibilidad del tipo de
ticket seleccionado dentro de una transacción de base de datos.
 Si hay disponibilidad, Prisma ORM decrementa en una unidad el contador de
available_quantity del TicketType y crea el registro del Ticket con un hash único (SHA-
256 del id del ticket + id del evento + timestamp + valor aleatorio), todo dentro de la misma
transacción atómica.
 El backend genera el código QR a partir del hash cifrado con AES-256 y lo devuelve al
frontend junto con los datos del ticket.
 El frontend muestra el ticket al usuario y el servicio de email envía automáticamente el
ticket en formato PDF al correo electrónico del comprador.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 19

FOMENTO OCUPACIONAL FOC ®
Arquitectura de Seguridad
 Autenticación JWT: Todos los endpoints protegidos requieren un token JWT válido en la
cabecera Authorization: Bearer <token>. El token contiene el id del usuario, su email y su
rol, y tiene una caducidad de 24 horas.
 Autorización por Roles: Los guards de Nest.js (RolesGuard) verifican que el rol del
usuario que realiza la petición coincide con los roles permitidos para cada endpoint (por
ejemplo, solo los usuarios con rol creator o admin pueden crear eventos).
 Encriptación de Passwords: Las contraseñas se almacenan en la base de datos como un
hash generado con bcrypt con un salt de 12 rondas, por lo que no pueden ser
recuperadas en texto plano.
 QR Cifrado Anti-Falsificación: El contenido de cada código QR es un hash único generado
con SHA-256 y posteriormente cifrado con AES-256 usando una clave secreta
almacenada en variables de entorno. Esto hace que cada QR sea único, no predecible y
no falsificable sin acceso a la clave secreta.
 Transacciones Atómicas: Las operaciones de compra de tickets utilizan transacciones de
Prisma para garantizar que la verificación de disponibilidad y la creación del ticket son
operaciones atómicas, evitando condiciones de carrera que podrían resultar en
sobreventa.
Mapa Topológico del Despliegue en Producción
Componente Tecnología Puerto Descripción
Reverse Proxy NGINX 80 / 443 Enruta el tráfico HTTPS hacia
los servicios internos y gestiona
los certificados SSL/TLS
Frontend Nuxt 3 (Node.js) 3000 (interno) Servidor SSR de Nuxt, sirve las
páginas y activos estáticos
Backend Nest.js (Node.js) 3001 (interno) API REST, lógica de negocio y
conexión a la base de datos
Base de Datos PostgreSQL 15 5432 (interno) Motor de base de datos
relacional. No expuesto al
exterior.
Contenedorización Docker Compose N/A Orquesta los cuatro servicios
anteriores en contenedores
aislados
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 20

FOMENTO OCUPACIONAL FOC ®
2.4.2. Detalle de los puntos que se van a controlar para validar el
proyecto.
Para verificar que el proyecto cumple con todos los requisitos establecidos, se definen los
siguientes puntos de control que serán comprobados durante la fase de testing:
 Integridad del QR: El contenido del código QR escaneado, una vez desencriptado, debe
coincidir exactamente con el hash almacenado en la base de datos para el ticket
correspondiente. Se verificará que no se puede validar un QR modificado o generado
externamente.
 Unicidad de Acceso (Anti-Duplicado): Una vez validado un ticket por primera vez, su
estado debe cambiar de 'active' a 'used' de forma irreversible en la base de datos. Un
segundo intento de validación del mismo QR debe devolver el estado 'already_used' con
la fecha y hora de la primera validación, sin permitir el acceso.
 Consistencia de Stock (Anti-Sobreventa): El sistema no debe permitir la venta de más
tickets que la capacidad máxima configurada para cada tipo de ticket (available_quantity).
Se realizarán pruebas de concurrencia para verificar que las transacciones atómicas de
Prisma previenen la sobreventa incluso bajo carga simultánea de múltiples compradores.
 Control de Acceso por Roles: Las rutas de creación y edición de eventos deben responder
con un error HTTP 403 (Forbidden) cuando son accedidas por usuarios con un rol no
autorizado (por ejemplo, un buyer intentando crear un evento). La ruta de validación QR
solo debe ser accesible para usuarios con rol validator o admin.
 Registro de Auditoría: Cada validación exitosa debe registrar en la base de datos la fecha
y hora exacta de la validación (validated_at) y el identificador del validador que realizó el
escaneo (validated_by), permitiendo una trazabilidad completa para auditoría.
 Envío de Tickets por Email: Tras completar una compra exitosa, el comprador debe recibir
en su correo electrónico un mensaje con el ticket en formato PDF adjunto, conteniendo
el código QR único y los datos del evento, en un tiempo máximo de 60 segundos.
 Descarga de Ticket en PDF: El frontend debe permitir al comprador descargar su ticket
en formato PDF desde la sección 'Mis Tickets', con el código QR claramente visible y los
datos del evento correctamente formateados.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 21

FOMENTO OCUPACIONAL FOC ®
3. Ejecución del proyecto y pruebas
3.1. Riesgos de ejecución del proyecto
3.1.1. Identificación de riesgos del proyecto.
ID Riesgo Probabilidad Impacto
R01 Retrasos en el desarrollo por complejidad técnica Media Alto
no estimada (especialmente en la generación y
cifrado de QR y las transacciones atómicas)
R02 Pérdida de datos o corrupción de la base de Baja Muy Alto
datos durante el desarrollo o el despliegue
R03 Vulnerabilidades de seguridad no detectadas en Baja Muy Alto
el sistema de autenticación JWT o en el cifrado
de los QR
R04 Problemas de rendimiento y escalabilidad bajo Media Alto
alta concurrencia en el momento de apertura de
venta de entradas
R05 Incompatibilidades entre versiones de librerías Media Medio
del stack tecnológico (Nest.js, Prisma, Nuxt 3)
R06 Cambios en los requisitos del proyecto durante el Baja Medio
desarrollo que requieran refactorizaciones
significativas
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 22

FOMENTO OCUPACIONAL FOC ®
3.1.2. Creación de plan de prevención de riesgos.
 R01 — Retrasos por complejidad: Se reserva un buffer de tiempo del 15-20% en la
planificación de las fases más complejas. Se dedicará tiempo inicial a crear prototipos o
pruebas de concepto (PoC) de los componentes más críticos antes de integrarlos en el
sistema principal.
 R02 — Pérdida de datos: Se configurarán copias de seguridad automáticas diarias de la
base de datos PostgreSQL. El uso de Prisma con un sistema de migraciones controladas
evita cambios destructivos accidentales en el esquema.
 R03 — Vulnerabilidades de seguridad: Se realizarán revisiones de seguridad del código
en los módulos de autenticación y generación de QR. Las claves secretas
(JWT_SECRET, AES_KEY) nunca se almacenarán en el código fuente, sino en variables
de entorno gestionadas de forma segura.
 R04 — Problemas de rendimiento: Se realizarán pruebas de carga con herramientas
como Artillery o k6 para simular múltiples compradores concurrentes. Se implementarán
índices en la base de datos en los campos de búsqueda más frecuentes.
 R05 — Incompatibilidades: Se fijarán las versiones de todas las dependencias en los
archivos package.json y se utilizará Docker para garantizar que el entorno de desarrollo
es idéntico para ambos desarrolladores y al entorno de producción.
 R06 — Cambios en requisitos: Se mantendrán reuniones de seguimiento periódicas con
el tutor para validar el avance y detectar posibles cambios de alcance de forma temprana,
minimizando su impacto.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 23

FOMENTO OCUPACIONAL FOC ®
3.2. Documentación de ejecución
3.2.1. Necesidades legales
Para la puesta en marcha del proyecto VeriTix en su fase de desarrollo y pruebas académicas
no se requieren permisos administrativos de obra ni licencias de actividad, al tratarse de un
servicio digital. Sin embargo, para una eventual comercialización se deberán considerar los
siguientes aspectos normativos:
 Protección de Datos: Como ya se indicó en el punto 2.2, el tratamiento de datos
personales de los usuarios (nombre, email, teléfono) obliga al cumplimiento del RGPD y
la LOPD-GDD, incluyendo el registro de actividades de tratamiento y la publicación de
una política de privacidad.
 Ley de Servicios de la Sociedad de la Información (LSSI-CE): La plataforma, al operar
como servicio de comercio electrónico, deberá incluir los datos de identificación del
prestador del servicio, las condiciones generales de contratación y la política de cookies.
 Pasarela de Pago: Para la integración de pagos reales, será necesario contratar una
pasarela de pago certificada (como Stripe o Redsys) que cumpla con el estándar de
seguridad PCI-DSS para el manejo de datos de tarjetas bancarias.
3.2.2 Ejecución del proyecto.
Ficheros de configuración principales:
 docker-compose.yml (raíz del monorepo): Orquesta los servicios de PostgreSQL,
backend (Nest.js) y frontend (Nuxt 3) en contenedores Docker. Define las redes internas,
los volúmenes de datos persistentes para la base de datos y las variables de entorno de
cada servicio.
 .env (backend): Contiene las variables de entorno del backend: DATABASE_URL
(cadena de conexión de Prisma a PostgreSQL), JWT_SECRET (clave para la firma de
tokens JWT), AES_SECRET_KEY (clave para el cifrado de los hashes QR), PORT
(puerto del servidor, por defecto 3001) y SMTP_* (credenciales del servicio de envío de
correo).
 .env (frontend / Nuxt): Contiene las variables de entorno del frontend:
NUXT_PUBLIC_API_BASE_URL (URL base de la API del backend) y otras
configuraciones específicas de Nuxt.
 prisma/schema.prisma (backend): Define el esquema completo de la base de datos con
el lenguaje de definición de esquemas de Prisma (PSL), incluyendo los modelos User,
Event, TicketType y Ticket con sus campos, tipos, relaciones y restricciones.
Características técnicas de la implementación:
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 24

FOMENTO OCUPACIONAL FOC ®
 El backend de Nest.js implementa el patrón de inyección de dependencias (IoC) propio
del framework, con módulos, servicios y controladores claramente separados. Todos los
endpoints están documentados automáticamente con Swagger/OpenAPI, accesible en
/api/docs.
 El frontend de Nuxt 3 utiliza el composable useFetch para el consumo de la API, con un
composable personalizado useAuth para gestionar el estado de autenticación y el token
JWT en el almacenamiento local del navegador. Los middlewares de Nuxt protegen las
rutas del dashboard según el rol del usuario.
 Prisma genera tipos TypeScript a partir del esquema de la base de datos, garantizando
type safety en todas las consultas del backend.
 La lógica de compra de tickets utiliza prisma.$transaction() para ejecutar la verificación
de disponibilidad y la creación del ticket como una operación atómica indivisible.
3.2.3. Manuales finales:
Manual de Usuario:
Se elaborará un manual de usuario que describirá paso a paso las operaciones principales para
cada perfil: cómo registrarse e iniciar sesión, cómo crear y publicar un evento (para creadores),
cómo buscar y comprar un ticket (para compradores), cómo escanear y validar un QR (para
validadores) y cómo acceder al panel de administración y estadísticas (para administradores).
Incluirá capturas de pantalla de las principales vistas de la aplicación.
Manual de Instalación:
Se documentará el procedimiento completo de instalación del entorno de desarrollo local
(prerrequisitos: Node.js v18+, Docker Desktop, Git), el proceso de clonado del repositorio, la
configuración de las variables de entorno a partir de los archivos .env.example, la ejecución de
las migraciones de Prisma y el arranque de todos los servicios con Docker Compose. Se incluirá
también el proceso de despliegue en un servidor VPS de producción con NGINX.
Manual de Configuración y Administración:
Se documentará la configuración de las variables de entorno críticas (JWT_SECRET,
AES_SECRET_KEY, DATABASE_URL), el proceso de creación del primer usuario
administrador, la gestión de las migraciones de base de datos con Prisma Migrate, el
procedimiento de realización de copias de seguridad de PostgreSQL y la consulta de los logs de
la aplicación a través de Docker.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 25

FOMENTO OCUPACIONAL FOC ®
3.3. Incidencias
3.3.1. Definir un protocolo para resolución de incidencias:
3.3.1.1. Recopilación de información
Ante cualquier incidencia reportada por un usuario o detectada en el sistema, se recopilará la
siguiente información de forma sistemática: descripción detallada del problema y pasos para
reproducirlo, perfil del usuario afectado (rol, navegador, dispositivo), fecha y hora exacta en que
se produjo la incidencia, mensajes de error visibles en la interfaz y, si están disponibles, los logs
del servidor (backend y base de datos) correspondientes al momento del error.
3.3.1.2. Posible solución
Una vez recopilada la información, se procederá a la clasificación de la incidencia según su
criticidad (crítica, alta, media o baja) y su naturaleza (bug funcional, problema de rendimiento,
incidencia de seguridad, problema de usabilidad). Se identificará el módulo afectado, se
reproducirá el error en el entorno de desarrollo y se procederá a la implementación de la
corrección, seguida de las pruebas de regresión necesarias para asegurar que la solución no
introduce nuevos problemas.
3.3.1.3. Registro
Todas las incidencias se registrarán en el sistema de gestión de issues del repositorio GitHub
del proyecto, incluyendo: título descriptivo, descripción completa con pasos de reproducción,
clasificación de severidad, módulo/componente afectado, estado (abierta, en progreso, resuelta,
cerrada), commit o pull request con la solución aplicada y fecha de resolución. Este registro
servirá como historial de mantenimiento y como fuente de conocimiento para la resolución de
incidencias futuras similares.
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 26

FOMENTO OCUPACIONAL FOC ®
4. Pruebas y soporte
4.1. Crear documento con las pruebas a realizar
Se definen los siguientes tipos de pruebas que deberán ejecutarse antes de la entrega final del
proyecto:
Pruebas Unitarias (Backend):
Se implementarán pruebas unitarias con Jest para los servicios más críticos del backend,
especialmente tickets.service (lógica de compra y generación de QR) y validation.service (lógica
de verificación y marcado de tickets). Se buscará una cobertura mínima del 70% de las líneas
de código en los módulos críticos.
Pruebas de Integración (API):
Se realizarán pruebas de integración sobre los endpoints de la API REST utilizando
Postman/Jest (supertest), verificando que las respuestas HTTP son las correctas para los
distintos escenarios: solicitudes autenticadas y no autenticadas, con y sin los permisos
adecuados, con datos válidos e inválidos.
Pruebas de Carga:
Se simulará la carga concurrente de múltiples usuarios intentando comprar el último ticket
disponible de un evento para verificar que las transacciones atómicas de Prisma previenen la
sobreventa de forma correcta.
Pruebas de Seguridad:
Se verificará que no es posible acceder a los endpoints protegidos sin un token JWT válido, que
no es posible realizar acciones con un rol no autorizado y que los QR no pueden ser falsificados
o reutilizados.
Pruebas de Acceso y Usabilidad:
Se realizarán pruebas manuales de los flujos principales de cada perfil de usuario (registro,
compra, validación) desde diferentes dispositivos (móvil, tablet, escritorio) y navegadores
(Chrome, Firefox, Safari).
4.2. Registro de las pruebas realizadas
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 27

FOMENTO OCUPACIONAL FOC ®
ID Tipo Descripción de la prueba Resultado Esperado Estado
T01 Unitaria Generación de hash único para Dos compras generan Pendiente
cada ticket hashes distintos
T02 Unitaria Marcado irreversible de ticket No es posible cambiar Pendiente
como 'used' status de 'used' a 'active'
T03 Integración POST /auth/register con email HTTP 409 Conflict Pendiente
duplicado
T04 Integración POST /events sin token JWT HTTP 401 Unauthorized Pendiente
T05 Integración POST /events con rol 'buyer' HTTP 403 Forbidden Pendiente
T06 Integración POST /tickets/buy con stock = 0 HTTP 400 Bad Request Pendiente
(sin stock)
T07 Carga 10 usuarios comprando el Solo 1 compra exitosa, 9 Pendiente
último ticket simultáneamente rechazadas
T08 Seguridad Escaneo de QR manipulado HTTP 200 con status Pendiente
(hash inválido) 'invalid'
T09 Seguridad Escaneo del mismo QR dos Primera: 'valid'. Pendiente
veces Segunda: 'already_used'
T10 Acceso Flujo completo de compra en Compra completada y Pendiente
dispositivo móvil ticket visible en pantalla
T11 Acceso Descarga de ticket en PDF PDF generado Pendiente
correctamente con QR
visible
T12 Acceso Recepción de email con ticket Email recibido en menos Pendiente
tras compra de 60 segundos
T13 Red Comprobación de HTTPS en Certificado SSL válido, Pendiente
producción sin advertencias
T14 Seguridad Revisión de variables de No hay secrets en el Pendiente
entorno en producción código fuente ni en los
logs
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 28

   FOMENTO OCUPACIONAL FOC ®

T15  Copias de  Verificación de backup diario de  Backup generado y  Pendiente
| seguridad  | PostgreSQL  | restaurable  |
| ---------- | ----------- | ------------ |
correctamente

|     |     |     |
| --- | --- | --- |
[NOMBRE DEL ALUMNO] [CICLO]  PÁGINA 29

   FOMENTO OCUPACIONAL FOC ®

4.3. Evaluar que el proyecto cumple todo lo requerido.

Al finalizar el desarrollo y antes de la entrega del proyecto, se revisará punto a punto cada uno
de los objetivos y requisitos definidos en el apartado 2.1.2 para verificar su cumplimiento:

| Requisito  | Descripción  | Criterio de Verificación  | Cumplido  |
| ---------- | ------------ | ------------------------- | --------- |
OBJ-01  Plataforma centralizada para  Los usuarios con rol 'creator' pueden  Pendiente
|     | la gestión de eventos  | crear, editar y cancelar eventos  |     |
| --- | ---------------------- | --------------------------------- | --- |
desde el dashboard
OBJ-02  Arquitectura de seguridad  Los tickets se generan con hash  Pendiente
|     | con QR y firma digital  | SHA-256 cifrado con AES-256. Los  |     |
| --- | ----------------------- | --------------------------------- | --- |
QR no pueden ser falsificados
OBJ-03  Control de aforo en tiempo  La prueba T07 (carga concurrente)  Pendiente
|     | real con anti-sobreventa  | verifica que solo se vende el número  |     |
| --- | ------------------------- | ------------------------------------- | --- |
máximo de tickets configurado
OBJ-04  Módulo de autenticación y  Las pruebas T04 y T05 verifican que  Pendiente
|     | gestión de roles  | los endpoints están protegidos  |     |
| --- | ----------------- | ------------------------------- | --- |
correctamente por JWT y rol
OBJ-05  Venta y distribución  El flujo completo de compra (T10), la  Pendiente
|     | automatizada de tickets  | recepción del email (T12) y la  |     |
| --- | ------------------------ | ------------------------------- | --- |
descarga del PDF (T11) funcionan
correctamente
OBJ-06  Notificaciones por correo con  El comprador recibe el ticket en PDF  Pendiente
|     | ticket en PDF  | en su correo en menos de 60  |     |
| --- | -------------- | ---------------------------- | --- |
segundos tras la compra (T12)
OBJ-07  Interfaz de escaneo QR en  El módulo de validación funciona  Pendiente
|     | dispositivos móviles  | correctamente desde un smartphone,  |     |
| --- | --------------------- | ----------------------------------- | --- |
con resultado visible (T10)
OBJ-08  Trazabilidad completa de  Cada ticket registra su validated_at y  Pendiente
|     | cada ticket  | validated_by. Las estadísticas del  |     |
| --- | ------------ | ----------------------------------- | --- |
organizador muestran el historial de
accesos
OBJ-09  Pruebas de concurrencia y  La prueba T07 verifica la estabilidad  Pendiente
|     | sobrecarga  | del sistema bajo carga concurrente  |     |
| --- | ----------- | ----------------------------------- | --- |
en la compra del último ticket
| [NOMBRE DEL ALUMNO] [CICLO]  |     |     | PÁGINA 30  |
| ---------------------------- | --- | --- | ---------- |

FOMENTO OCUPACIONAL FOC ®
OBJ-10 Sistema de permisos Las pruebas de integración verifican Pendiente
diferenciado por rol que cada endpoint responde
correctamente a cada rol. El frontend
oculta las opciones no permitidas
[NOMBRE DEL ALUMNO] [CICLO] PÁGINA 31