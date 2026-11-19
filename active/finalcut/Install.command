#!/bin/zsh
# Builds the CRMA kit and copies it into ~/Movies/Motion Templates.localized,
# where Final Cut Pro finds it. Everything sits under ONE category, CRMA, in
# each browser:
#   Titles      › CRMA › Lower Thirds, Lessons
#   Transitions › CRMA
#   Generators  › CRMA
# Older kits installed as "Custom - …" folders are removed so nothing is split.
# Quit Final Cut Pro first, or restart it afterwards.
set -e
cd "${0:A:h}"
python3 -B make_kit.py
DEST="$HOME/Movies/Motion Templates.localized"
for kind in Titles Transitions Generators; do
  mkdir -p "$DEST/$kind.localized"
  rm -rf "$DEST/$kind.localized/CRMA"
  find "$DEST/$kind.localized" -maxdepth 1 -name 'Custom - *' -exec rm -rf {} + 2>/dev/null || true
  cp -R "kit/Motion Templates/$kind.localized/CRMA" "$DEST/$kind.localized/" 2>/dev/null || true
  n=$(find "$DEST/$kind.localized/CRMA" \( -name '*.moti' -o -name '*.motr' -o -name '*.motn' \) 2>/dev/null | wc -l | tr -d ' ')
  echo "  $kind › CRMA: $n templates"
done
echo "Installed. Open Final Cut Pro → Titles, Transitions or Generators → CRMA."
