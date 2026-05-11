# Desarrollo sostenible

## ODS relevantes para la actividad profesional

Hemos seleccionado tres Objetivos de Desarrollo Sostenible (ODS) que se vinculan de forma directa y tangible con la actividad profesional del desarrollo de aplicaciones web, especialmente en el contexto del proyecto VeriTix.

### ODS 9 — Industria, innovación e infraestructura

La creación de software robusto, escalable y bien documentado contribuye directamente a la innovación tecnológica y a fortalecer la infraestructura digital sobre la que opera la economía moderna. En el día a día del desarrollador, esto se traduce en adoptar prácticas como el control de versiones, las pruebas automatizadas, la integración continua (CI/CD) y la documentación técnica.

**Relación con el proyecto VeriTix:** El sistema de gestión de incidencias ha sido diseñado con una arquitectura modular donde la lógica de negocio, la persistencia de datos y la capa de presentación están claramente diferenciadas. Esto permite evolucionar y escalar el sistema sin necesidad de reescribir componentes existentes. La API documentada facilita la integración con otros servicios y el código bien estructurado reduce el tiempo de onboarding para nuevos miembros del equipo.

### ODS 12 — Producción y consumo responsables

La eficiencia en el desarrollo de software implica reducir el consumo de recursos computacionales, optimizar las consultas a la base de datos, minimizar el peso de las interfaces web y favorecer tecnologías que extiendan la vida útil de los equipos. Elegir soluciones con bajo impacto energético sin sacrificar funcionalidad es una decisión profesional que genera valor tanto económico como ambiental.

**Relación con el proyecto VeriTix:** El módulo de incidencias centraliza la información en una base de datos, lo que reduce significativamente el uso de papel y la redundancia en comunicaciones. El almacenamiento optimizado y las consultas eficientes disminuyen el consumo de recursos del servidor. Una interfaz ligera —con CSS y JavaScript minimalistas— implica menos datos transferidos, menor procesamiento en el cliente y, por tanto, menor huella de carbono asociada al uso del sistema.

### ODS 13 — Acción por el clima

El sector tecnológico representa un porcentaje creciente del consumo energético global, desde los centros de datos hasta los dispositivos de los usuarios finales. Como profesionales del desarrollo web, tenemos responsabilidad sobre la eficiencia del software que construimos: código mal optimizado genera más cálculos, más transmisión de datos y más energía consumida. La acción climática en nuestro ámbito empieza con decisiones de diseño y arquitectura.

**Relación con el proyecto VeriTix:** VeriTix contribuye a la acción climática al reemplazar procesos manuales (formularios en papel, llamadas telefónicas, correos electrónicos desorganizados) por un sistema digital centralizado. Cada ticket resuelto digitalmente evita desplazamientos, impresiones y búsquedas infructuosas. Además, al facilitar la gestión eficiente de las incidencias de mantenimiento, el sistema contribuye a que los equipos respondan más rápido, evitando que pequeños problemas se conviertan en situaciones que requieran intervenciones más intensivas en recursos.

---

## Análisis de riesgos y oportunidades

| ODS        | Oportunidades                                                                                                                                                                                                | Riesgos                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ODS 9**  | Mejorar la competitividad profesional con prácticas modernas (CI/CD, testing, documentación); aumentar la calidad y durabilidad del software; facilitar la colaboración en equipos distribuidos.             | Depender excesivamente de herramientas propietarias o servicios en la nube poco interoperables; obsolescencia rápida por no actualizarse a estándares emergentes.                                 |
| **ODS 12** | Reducir costos operativos con código eficiente; mejorar la experiencia del usuario con interfaces más rápidas y ligeras; posicionarse como profesional consciente del impacto ambiental del software.        | Invertir en optimizaciones prematuras que compliquen el mantenimiento sin un beneficio real; generar deuda técnica al priorizar velocidad de desarrollo sobre calidad.                            |
| **ODS 13** | Diferenciarse profesionalmente como desarrollador con criterio de sostenibilidad; influir en las decisiones de infraestructura de los proyectos; contribuir a la reducción efectiva de emisiones del sector. | Greenwashing: adoptar etiquetas de sostenibilidad sin cambios reales; priorizar únicamente lo tecnológico olvidando el impacto social y económico; infraestimar el coste real del software lento. |

---

## Acciones para retos ambientales y sociales

### Ámbito profesional

- **Optimizar el rendimiento web:** Minimizar el peso de CSS y JavaScript, comprimir imágenes, implementar lazy loading y usar caché efectivo. Cada kilobyte evitado reduce transmisiones de datos y consumo energético en servidores y dispositivos.
- **Adoptar metodologías DevOps:** Implementar CI/CD para detectar errores tempranamente, automatizar despliegues y reducir revisiones manuales. Esto no solo mejora la calidad del software sino que disminuye el consumo energético al evitar ejecuciones redundantes en entornos de pruebas.
- **Diseñar APIs y consultas eficientes:** Una consulta mal optimizada puede ejecutarse miles de veces al día consumiendo recursos de CPU y memoria innecesariamente. Documentar los patrones de acceso a datos y establecer estándares de rendimiento ayuda a largo plazo.
- **Favorecer software libre:** Priorizar herramientas con licencias abiertas reduce la dependencia de proveedores y fomenta la transparencia. Proyectos con comunidad activa suelen ser más eficientes y con mejor soporte a largo plazo.
