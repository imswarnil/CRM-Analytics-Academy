#!/bin/zsh
# Installs the CRMA Kit templates into Final Cut Pro (copies only; nothing of yours is deleted
# except an older copy of the same CRMA-* folder, which is replaced).
# Works from wherever this folder lives: double-click it in Finder, or run content-creation/kit/Install.command.
cd "$(dirname "$0")"
DEST="$HOME/Movies/Motion Templates.localized"
for kind in Titles Transitions Generators Effects; do
  mkdir -p "$DEST/$kind.localized"
  for folder in "Motion Templates/$kind.localized"/*/; do
    name="$(basename "$folder")"
    rm -rf "${DEST:?}/${kind:?}.localized/${name:?}"
    cp -R "$folder" "$DEST/$kind.localized/$name"
    echo "installed  $kind › $name"
  done
done
echo
echo "Done. Open Final Cut Pro — the categories are in the Titles, Transitions, Generators and Effects browsers."
echo "(If a browser does not show them, quit and reopen Final Cut Pro.)"
for font in "Schibsted Grotesk" "IBM Plex Mono"; do
  if ! ls ~/Library/Fonts /Library/Fonts 2>/dev/null | grep -qi "${font// /}"; then
    echo "!  Font not found: $font — install it from fonts.google.com, or titles fall back to Helvetica."
  fi
done
[[ -t 0 ]] && read -k 1 "?Press any key to close."
exit 0
