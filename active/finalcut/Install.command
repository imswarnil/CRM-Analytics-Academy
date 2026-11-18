#!/bin/zsh
# Builds the CRMA kit and copies it into ~/Movies/Motion Templates.localized,
# where Final Cut Pro finds it (Titles / Transitions / Generators › CRMA).
# Quit Final Cut Pro first, or restart it afterwards.
set -e
cd "${0:A:h}"
python3 -B make_kit.py
DEST="$HOME/Movies/Motion Templates.localized"
for kind in Titles Transitions Generators; do
  mkdir -p "$DEST/$kind.localized"
  rm -rf "$DEST/$kind.localized/CRMA"
  cp -R "kit/Motion Templates/$kind.localized/CRMA" "$DEST/$kind.localized/" 2>/dev/null || true
done
echo "Installed. Open Final Cut Pro → Titles, Transitions, Generators → CRMA."
