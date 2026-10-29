#!/bin/sh
# Empaqueta cada skill en skills/dist/<skill>.zip, con la carpeta de la skill
# en la raíz del zip, que es lo que pide Claude al subirla (Personalizar → Skills).
set -e
cd "$(dirname "$0")"
rm -rf dist
mkdir -p dist
for dir in */; do
  name="${dir%/}"
  [ "$name" = dist ] && continue
  [ -f "$name/SKILL.md" ] || continue
  zip -qr "dist/$name.zip" "$name" -x '*.DS_Store'
  echo "dist/$name.zip"
done
