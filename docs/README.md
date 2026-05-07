# Documentación técnica de VeriTix

## Fuente de verdad (regla principal)

1. **Código del repo** (backend, frontend, Prisma)
2. `docs/tfg.md` **solo** para alcance/roadmap explícito
3. Esta carpeta `docs/` como síntesis operativa

Si hay contradicción entre documentación y código, **manda el código**.

## Índice

- [`STATUS.md`](./STATUS.md): snapshot actual del proyecto (implementado hoy, deudas y estado por áreas).
- [`ARCHITECHTURE.md`](./ARCHITECHTURE.md): arquitectura real frontend/backend, boundaries, auth, flujos y configuración.
- [`API.md`](./API.md): rutas internas de frontend (Nitro) y rutas backend (Nest) con contratos principales.
- [`DATABASE.md`](./DATABASE.md): modelo actual de base de datos desde `backend/prisma/schema.prisma`.
- [`ERD.md`](./ERD.md): representación textual/tabular del ERD alineada al schema actual.
- [`REQUIREMENTS.md`](./REQUIREMENTS.md): requerimientos funcionales implementados vs pendientes (pendientes solo según `docs/tfg.md`).
- [`tfg.md`](./tfg.md): marco funcional/académico base y definición explícita de futuro.

## Cómo usar esta documentación

- Empezá por `STATUS.md` para entender dónde está parado el proyecto.
- Si vas a tocar arquitectura o integración, seguí con `ARCHITECHTURE.md` y `API.md`.
- Si vas a tocar datos, usá `DATABASE.md`.
- Si querés contrastar alcance funcional (hoy vs pendiente), usá `REQUIREMENTS.md`.

## Convención de verificación

Cada documento referencia paths reales cuando aporta evidencia (por ejemplo `backend/src/modules/...`, `frontend/server/api/...`, `backend/prisma/schema.prisma`).
