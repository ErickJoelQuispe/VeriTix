# Documentación de VeriTix

Este directorio está separado en dos módulos claros:

## 1) Markdown puro (`docs/markdown/`)

Solo archivos `.md` de documentación funcional/técnica (sin scripts ni configuración de compilación).

- [`markdown/STATUS.md`](./markdown/STATUS.md)
- [`markdown/ARCHITECHTURE.md`](./markdown/ARCHITECHTURE.md)
- [`markdown/API.md`](./markdown/API.md)
- [`markdown/DATABASE.md`](./markdown/DATABASE.md)
- [`markdown/REQUIREMENTS.md`](./markdown/REQUIREMENTS.md)
- [`markdown/tfg.md`](./markdown/tfg.md)
- [`markdown/doc2.md`](./markdown/doc2.md)
- [`markdown/Latex.md`](./markdown/Latex.md) (histórico de conversación)

## 2) Módulo LaTeX (`docs/latex/`)

Contiene todo el tooling para generar PDF académico desde Markdown:

- `src/` → capítulos fuente
- `filters/` → transformaciones Lua para limpiar Markdown
- `template.tex` → plantilla LaTeX
- `metadata.yml` → metadatos globales
- `build.sh` + `Makefile` → build/clean/erd
- `assets/` → recursos gráficos estáticos del PDF
- `build/assets/` → diagramas ER generados por Prisma (PNG)
- `build/` → salida de compilación

Guía operativa: [`docs/latex/README.md`](./latex/README.md).

## Regla de fuente de verdad

1. **Código del repo** (backend/frontend/prisma)
2. `docs/markdown/tfg.md` para alcance/roadmap explícito
3. Documentación como síntesis operativa

Si hay contradicción entre documentación y código, **manda el código**.
