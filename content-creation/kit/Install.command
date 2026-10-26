#!/bin/zsh
# Installs the CRMA Kit templates into Final Cut Pro (copies only; nothing of yours is deleted
# except an older copy of the kit: the CRMA folder, and the CRMA-* folders it used to be split into).
# Works from wherever this folder lives: double-click it in Finder, or run content-creation/kit/Install.command.
# Each browser gets ONE category, CRMA, with the templates grouped inside it (Slides, Lessons, Lower Thirds …).
cd "$(dirname "$0")"
DEST="$HOME/Movies/Motion Templates.localized"
for kind in Titles Transitions Generators Effects; do
  mkdir -p "$DEST/$kind.localized"
  for old in "$DEST/$kind.localized"/CRMA-*(N/); do
    rm -rf "${old:?}"
    echo "removed    $kind › $(basename "$old")  (now inside CRMA)"
  done
  rm -rf "${DEST:?}/${kind:?}.localized/CRMA"
  cp -R "Motion Templates/$kind.localized/CRMA" "$DEST/$kind.localized/CRMA"
  echo "installed  $kind › CRMA  ($(find "Motion Templates/$kind.localized/CRMA" -name '*.mo??' | wc -l | tr -d ' ') templates)"
done
echo
echo "Done. Open Final Cut Pro — the CRMA category is in the Titles, Transitions, Generators and Effects browsers."
echo "(If a browser does not show them, quit and reopen Final Cut Pro.)"
for font in "Schibsted Grotesk" "IBM Plex Mono"; do
  if ! ls ~/Library/Fonts /Library/Fonts 2>/dev/null | grep -qi "${font// /}"; then
    echo "!  Font not found: $font — install it from fonts.google.com, or titles fall back to Helvetica."
  fi
done
[[ -t 0 ]] && read -k 1 "?Press any key to close."
exit 0
