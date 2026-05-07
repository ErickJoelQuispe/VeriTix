#!/usr/bin/env bash
# ============================================================
#  VeriTix — Build script: Markdown → PDF (estilo FOC)
#  Uso:
#    ./docs/build.sh           → compila todo
#    ./docs/build.sh --watch   → recompila al guardar (requiere inotifywait)
# ============================================================

set -e

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$DOCS_DIR/src"
OUT_DIR="$DOCS_DIR/out"
TEMPLATE="$DOCS_DIR/template.tex"
METADATA="$DOCS_DIR/metadata.yml"
OUTPUT="$OUT_DIR/memoria.pdf"

# Colores para la terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

build() {
  echo -e "${YELLOW}▶ Compilando VeriTix → PDF...${NC}"

  # Verificar dependencias
  if ! command -v pandoc &>/dev/null; then
    echo -e "${RED}✗ pandoc no encontrado. Instalá con: sudo pacman -S pandoc${NC}"
    exit 1
  fi
  if ! command -v xelatex &>/dev/null; then
    echo -e "${RED}✗ xelatex no encontrado. Instalá con: sudo pacman -S texlive-xetex texlive-lang-spanish${NC}"
    exit 1
  fi

  # Crear out/ si no existe
  mkdir -p "$OUT_DIR"

  # Obtener archivos .md ordenados
  SRC_FILES=$(ls "$SRC_DIR"/*.md 2>/dev/null | sort)

  if [ -z "$SRC_FILES" ]; then
    echo -e "${RED}✗ No hay archivos .md en docs/src/${NC}"
    echo "  Creá al menos uno: docs/src/01-estudio-inicial.md"
    exit 1
  fi

  echo "  Archivos fuente:"
  for f in $SRC_FILES; do
    echo "    • $(basename "$f")"
  done

  # Compilar
  pandoc $SRC_FILES \
    --from markdown+smart+pipe_tables+fenced_code_blocks \
    --metadata-file="$METADATA" \
    --template="$TEMPLATE" \
    --pdf-engine=xelatex \
    --toc \
    --number-sections \
    --highlight-style=tango \
    -o "$OUTPUT"

  echo -e "${GREEN}✓ PDF generado: $OUTPUT${NC}"
}

watch_mode() {
  if ! command -v inotifywait &>/dev/null; then
    echo -e "${RED}✗ inotifywait no encontrado. Instalá con: sudo pacman -S inotify-tools${NC}"
    exit 1
  fi

  echo -e "${YELLOW}👁  Modo watch activo — editá tus .md y el PDF se recompila solo${NC}"
  echo "  Presioná Ctrl+C para salir."
  echo ""

  build

  while true; do
    inotifywait -q -e modify,create,delete \
      "$SRC_DIR"/*.md \
      "$METADATA" \
      "$TEMPLATE" 2>/dev/null

    echo ""
    echo -e "${YELLOW}⟳ Cambio detectado, recompilando...${NC}"
    build
  done
}

# ── Main ────────────────────────────────────────────────────
case "${1:-}" in
  --watch|-w)
    watch_mode
    ;;
  *)
    build
    ;;
esac
