# Guion — Stack tecnológico

## Contexto para el presentador

Esta diapositiva muestra las tecnologías elegidas. El objetivo es justificar cada decisión técnica de forma que el tribunal entienda que no son elecciones arbitrarias.

## Qué decir

"Cada tecnología se eligió por un motivo concreto.

En el backend usamos NestJS con TypeScript porque nos da una estructura modular clara: eventos, órdenes, pagos, cada uno en su propio módulo. El tipado fuerte de TypeScript nos evita errores tontos en desarrollo.

La base de datos es PostgreSQL, un motor relacional maduro con soporte transaccional sólido. No queríamos una base de datos NoSQL porque nuestros datos tienen relaciones complejas: un ticket pertenece a una orden, que pertenece a un usuario, que pertenece a un evento.

Usamos Prisma como ORM porque genera el cliente de base de datos automáticamente a partir del esquema. Esto elimina errores de escritura manual en consultas y nos da visibilidad completa del modelo de datos.

En el frontend elegimos Nuxt 4 con Vue 3. Es un framework moderno que nos permite renderizado híbrido: algunas páginas se renderizan en servidor para mejor SEO, otras son aplicaciones de una sola página para experiencia fluida.

Los estilos son con Tailwind CSS y Nuxt UI, un sistema de diseño basado en utilidades que agiliza la creación de interfaces consistentes sin escribir CSS personalizado.

Para pagos usamos Stripe, que es la plataforma más reconocida del mercado y nos evita tener que implementar lógica compleja de facturación desde cero. Los webhooks de Stripe son los que confirman los pagos.

Y todo el entorno se ejecuta en contenedores Docker. Con un solo comando se levantan base de datos, backend y frontend sin instalar nada manualmente."

## Tiempo estimado

3–4 minutos
