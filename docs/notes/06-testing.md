# Guion — Testing

## Contexto para el presentador

Esta diapositiva muestra la cobertura y estrategia de pruebas. Es importante destacar las pruebas de concurrencia porque son las más relevantes para un sistema de venta de entradas.

## Qué decir

"VeriTix se probó en tres niveles para cubrir distintos riesgos.

Primero, pruebas unitarias que verifican funciones y servicios de forma aislada. En el backend cubrimos auth, eventos, órdenes, tickets y webhooks.

Segundo, pruebas de integración y end-to-end que ejecutan flujos completos contra una base de datos real y un servidor de pruebas. Por ejemplo, la suite de órdenes verifica que un comprador autenticado pueda crear una orden, que un usuario no autenticado reciba error, que no se puedan comprar más entradas del límite por persona, y que nadie pueda ver órdenes de otro usuario.

Tercero, las pruebas de concurrencia y carga. Estas son las más importantes para un sistema de venta de entradas. Lanzamos múltiples compradores simultáneamente intentando comprar el mismo tipo de entrada, y verificamos que la suma total de tickets vendidos no exceda el stock disponible. Esta prueba demuestra que el sistema maneja picos de demanda sin sobrevender.

En el frontend tenemos 80 pruebas con Vitest distribuidas en dos categorías: 44 unitarias que verifican funciones de formateo, filtros y mapeo de datos, y 36 pruebas de Nuxt que verifican la lógica de autenticación, peticiones a la API y middlewares de ruta."

## Tiempo estimado

2–3 minutos
