#!/usr/bin/env bash
# Genera todos los íconos PWA a partir de un PNG fuente.
# Uso:  ./generate-icons.sh <ruta-al-logo.png>
# Req:  macOS sips (incluido en el sistema)

SOURCE="${1}"

if [ -z "$SOURCE" ]; then
  echo "Error: debes pasar la ruta al logo PNG."
  echo "Uso: ./generate-icons.sh assets/logo.png"
  exit 1
fi

if [ ! -f "$SOURCE" ]; then
  echo "Error: no se encontró el archivo '$SOURCE'"
  exit 1
fi

DEST="assets/icons"
mkdir -p "$DEST"

SIZES=(72 96 128 144 152 180 192 384 512)

echo "Generando íconos desde: $SOURCE"
for SIZE in "${SIZES[@]}"; do
  OUT="$DEST/icon-${SIZE}.png"
  sips -z "$SIZE" "$SIZE" "$SOURCE" --out "$OUT" > /dev/null
  echo "  ✓ ${SIZE}x${SIZE}  →  $OUT"
done

echo ""
echo "Listo. Íconos guardados en $DEST/"
