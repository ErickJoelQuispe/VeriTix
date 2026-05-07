# Estudio inicial previo a la realización del proyecto

## Clasificar las empresas del sector por sus características organizativas y el tipo de producto o servicio que ofrecen

El sector de gestión de eventos y ticketing digital engloba a un amplio espectro de organizaciones
que se pueden clasificar según sus características organizativas y el tipo de producto o servicio
que ofrecen:

### Organizadores de Eventos

Empresas, instituciones públicas o privadas y asociaciones que necesitan una plataforma
centralizada para la creación, configuración y gestión profesional de sus actos. Dentro de esta
categoría encontramos desde grandes promotoras musicales y empresas de entretenimiento,
hasta pymes del sector MICE (Meetings, Incentives, Conferences and Exhibitions),
ayuntamientos que gestionan eventos culturales y organizaciones deportivas. Su necesidad
principal es disponer de un panel de control unificado que les permita configurar aforos, tipos de
entrada y precios, así como obtener estadísticas en tiempo real.

### Plataformas distribuidoras de Tickets

Empresas especializadas en la venta automatizada y distribución digital de entradas, como
Ticketmaster, Eventbrite o Fever, cuyo modelo de negocio se basa en cobrar una comisión por
cada entrada vendida. Estas plataformas actúan como intermediarias entre el organizador y el
comprador final, y requieren infraestructuras robustas capaces de soportar picos de demanda
muy elevados en el momento de apertura de venta de entradas para eventos de gran afluencia.

### Empresas de Seguridad y Logística de Acceso

Entidades que proveen el personal y las herramientas tecnológicas para el control de acceso y
validación de identidad en los puntos de entrada a los recintos. Estas empresas requieren
dispositivos y software ágiles que permitan escanear y verificar cientos de entradas por minuto,
minimizando las colas y garantizando que no se produzcan accesos duplicados o fraudulentos.

## Poner un ejemplo de estructura organizativa para una empresa del sector

Una empresa típica del sector, por ejemplo una ticketera digital de tamaño mediano, presentaría
la siguiente estructura organizativa:

- **Dirección General:** Responsable de la estrategia empresarial, relaciones institucionales
  y toma de decisiones de alto nivel.
- **Departamento de Operaciones:** Gestión de la plataforma, relación con los organizadores
  y supervisión de los recintos asociados.
- **Departamento de Ventas y Marketing:** Captación de nuevos eventos y organizadores, así
  como la promoción de tickets a los compradores finales a través de canales digitales.
- **Departamento Técnico (IT):** Desarrollo y mantenimiento de la infraestructura web, la base
  de datos y los sistemas de seguridad. Incluye equipos de backend, frontend, DevOps y
  ciberseguridad.
- **Departamento de Atención al Cliente:** Gestión de incidencias, reclamaciones y soporte
  tanto a organizadores como a compradores.
- **Personal de Campo y Validación:** Responsables del despliegue de dispositivos de
  escaneo y del control de aforo en el lugar del evento el día del mismo.

## Identificar las necesidades demandas que cubre el proyecto y asociarlas con las necesidades del cliente

El proyecto VeriTix da respuesta a las siguientes problemáticas reales del sector, asociando cada
una con la necesidad concreta de los diferentes perfiles de cliente:

- **Gestión desorganizada:** Resuelve la falta de una plataforma centralizada para los
  organizadores, que actualmente deben combinar hojas de cálculo, correo electrónico y
  herramientas no especializadas para gestionar sus eventos.
- **Fraude y falsificación:** Mitiga el riesgo de duplicación y falsificación de entradas mediante
  la generación de códigos QR únicos con hash criptográfico, que no pueden ser replicados.
- **Control de aforo en tiempo real:** Satisface la necesidad de los organizadores de realizar
  un seguimiento instantáneo de la disponibilidad de plazas, previniendo la sobreventa
  mediante el uso de transacciones atómicas en la base de datos.
- **Costos operativos elevados:** Elimina la necesidad de imprimir, distribuir y gestionar
  entradas físicas, así como la logística de envío, reduciendo significativamente los costos
  para el organizador.
- **Experiencia de usuario deficiente:** Proporciona a los compradores una experiencia de
  compra digital ágil desde cualquier dispositivo, con entrega instantánea de la confirmación
  de compra por correo electrónico.

## Descripción del proyecto

VeriTix es un sistema web integral desarrollado como aplicación monorepo que digitaliza todo el
ciclo de vida de un evento: desde el registro del creador y la configuración del evento con
múltiples tipos de tickets y precios diferenciados, pasando por la venta en tiempo real con control
automático de stock, hasta la compra por parte del usuario y la validación final mediante escaneo
QR en el punto de acceso.

El sistema está estructurado en dos aplicaciones independientes que se comunican a través de
una API REST: un backend desarrollado con NestJS 11 y TypeScript que contiene toda la lógica de
negocio, y un frontend desarrollado con Vue 3 y Nuxt 4 que proporciona las interfaces de usuario
adaptadas a cada perfil. La persistencia de datos se gestiona con PostgreSQL como motor de
base de datos y Prisma 7 como capa de acceso a datos, garantizando seguridad de tipos
(Type Safety) y facilitando las migraciones. La autenticación se implementa mediante JSON Web
Tokens (JWT) con access token de corta duración (15 minutos) y refresh token en cookie
HTTP-only con rotación, y el sistema de roles controla el acceso a las distintas funcionalidades.

El sistema contempla cuatro perfiles de usuario diferenciados: compradores, creadores de
eventos, validadores y administradores, cada uno con sus propias vistas y permisos dentro de la
aplicación.

## Justificar el tipo de proyecto elegido para dar solución al problema

Se ha elegido una aplicación web full-stack con arquitectura desacoplada (backend API REST +
frontend SPA/SSR) por los siguientes motivos técnicos y de negocio:

- **Automatización total del proceso:** La aplicación web elimina la intervención manual en las
  fases de venta, distribución y validación de tickets, reduciendo el margen de error humano
  al mínimo.
- **Accesibilidad universal:** Al ser una aplicación web, tanto los organizadores para gestionar
  sus eventos como los compradores para adquirir sus entradas pueden acceder desde
  cualquier dispositivo (móvil, tablet u ordenador) sin necesidad de instalar ningún software
  adicional.
- **Seguridad robusta:** El uso de transacciones atómicas en la base de datos (propiedades
  ACID de PostgreSQL) previene la sobreventa incluso en escenarios de alta concurrencia.
  La unicidad de los códigos QR mediante hash criptográfico previene la falsificación.
- **Escalabilidad:** La arquitectura de servicios independientes (NestJS 11 + Nuxt 4) permite
  escalar el backend y el frontend de forma independiente según la demanda, lo que es
  especialmente relevante en los picos de venta de eventos de gran popularidad.
- **Mantenibilidad:** El uso de TypeScript de extremo a extremo y de frameworks con
  convenciones bien establecidas (NestJS para el backend, Vue/Nuxt para el frontend)
  facilita el mantenimiento del código y la incorporación de nuevos desarrolladores.

## Características principales del proyecto elegido

- **Gestión de Roles diferenciados:** La plataforma contempla perfiles específicos para
  compradores (`buyer`), creadores de eventos (`creator`), personal de validación (`validator`)
  y administradores del sistema (`admin`), cada uno con acceso exclusivo a las
  funcionalidades que le corresponden.
- **Venta en Tiempo Real con control de inventario:** Sistema de compra a través de Stripe
  Checkout con actualización dinámica de la disponibilidad por tipo de ticket (VIP, General,
  Estudiante, etc.), respaldado por transacciones atómicas que impiden la sobreventa incluso
  bajo carga concurrente.
- **Validación QR ágil:** Sistema de validación mediante hash único por ticket con respuesta
  semáforo (verde para Válido, amarillo para Ya usado, rojo para Inválido), que permite un
  flujo de acceso eficiente. El backend de validación está completamente implementado.
- **Distribución digital de tickets:** Los tickets se generan con un código QR basado en un
  hash SHA único e irrepetible por compra, accesibles desde la sección de "Mis Tickets" del
  usuario.
- **Notificaciones por correo electrónico:** El sistema envía automáticamente correos de
  confirmación de compra al comprador tras completar la transacción, a través del servicio
  Resend. Las notificaciones incluyen verificación de email, confirmación de orden, reembolso
  y recordatorios de eventos, gestionadas con colas BullMQ.
- **Catálogos enriquecidos:** El sistema incluye módulos de artistas, recintos, géneros y
  formatos de concierto que permiten enriquecer la información de cada evento con
  metadatos estructurados.
- **Cache con Redis:** El backend implementa una capa de caché con Redis para las
  consultas más frecuentes (listado de eventos, artistas, catálogos), con TTLs configurados
  por tipo de recurso para optimizar el rendimiento.
