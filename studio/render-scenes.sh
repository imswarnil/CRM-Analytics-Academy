#!/bin/sh
# Render every comp in a scenes project to H.264 previews with aerender.
#   sh studio/render-scenes.sh studio/out/motion/joins.aep
# Writes studio/out/motion/<project>/<comp>.mp4 (and a contact sheet per comp
# if ffmpeg is installed). Quit nothing: aerender runs alongside the app.
set -e
AEP="$1"
[ -f "$AEP" ] || { echo "usage: sh studio/render-scenes.sh <project.aep>"; exit 1; }
AER="$(ls -d /Applications/Adobe\ After\ Effects\ */aerender | tail -1)"
OUT="$(dirname "$AEP")/$(basename "$AEP" .aep)"
mkdir -p "$OUT"
for COMP in "01 Join — the idea" "02 Lookup — no match" "03 Left join — fan-out" "04 Inner join" "05 Outer join" "06 The fix — aggregate first"; do
  "$AER" -project "$AEP" -comp "$COMP" -OMtemplate "H.264 - Match Render Settings - 15 Mbps" -output "$OUT/$COMP.mp4" || \
  "$AER" -project "$AEP" -comp "$COMP" -output "$OUT/$COMP.mov"
  if command -v ffmpeg >/dev/null; then
    F="$(ls "$OUT/$COMP".m* | head -1)"
    ffmpeg -loglevel error -y -i "$F" -vf "fps=1/2,scale=480:-1,tile=4x2" -frames:v 1 "$OUT/$COMP — sheet.png"
  fi
done
echo "Previews in $OUT"
