#!/usr/bin/env bash
# Local LibreTranslate, installed inside this repo (.libretranslate/, gitignored).
#
#   bash scripts/libretranslate.sh setup   # once: Python venv + the eleven en→xx models (~1 GB)
#   bash scripts/libretranslate.sh start   # start on 127.0.0.1:5055, wait until ready
#   bash scripts/libretranslate.sh stop
#   bash scripts/libretranslate.sh run -- <cmd…>   # start, run the command, always stop
#
# `pnpm translate` uses `run`, so editing English markdown and running
# `pnpm build` (or `pnpm translate`) is all it takes. Nothing is hosted.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$ROOT/.libretranslate"
PORT="${LT_PORT:-5055}"
PIDFILE="$DIR/server.pid"
LOG="$DIR/server.log"
# Only English is ever a source: install just the eleven en→xx models
# (Argos codes; LibreTranslate exposes zh as zh-Hans).
TARGETS="es fr de pt ja zh hi ar ru bn ur"

# Models and caches live inside the repo folder, not in ~/.local.
export XDG_DATA_HOME="$DIR/data" XDG_CACHE_HOME="$DIR/cache" XDG_CONFIG_HOME="$DIR/config"
export ARGOS_PACKAGES_DIR="$DIR/data/argos-translate/packages"

ready() { curl -sf "http://127.0.0.1:$PORT/languages" >/dev/null 2>&1; }

setup() {
  command -v uv >/dev/null || { echo "Install uv first: brew install uv"; exit 1; }
  mkdir -p "$DIR"
  [ -x "$DIR/venv/bin/libretranslate" ] || {
    uv venv --python 3.11 "$DIR/venv"
    uv pip install --python "$DIR/venv/bin/python" libretranslate
  }
  # Download only en→xx (the server's own --update-models fetches both
  # directions of every pair, twice the size). Already-installed ones are skipped.
  "$DIR/venv/bin/python" - $TARGETS <<'PY'
import sys
import argostranslate.package as pkg
pkg.update_package_index()
available = pkg.get_available_packages()
installed = {(p.from_code, p.to_code) for p in pkg.get_installed_packages()}
for to in sys.argv[1:]:
    if ('en', to) in installed:
        print(f'  en→{to} already installed'); continue
    match = next((p for p in available if p.from_code == 'en' and p.to_code == to), None)
    if not match:
        print(f'  en→{to}: no model in the Argos index'); continue
    print(f'  en→{to} downloading…', flush=True)
    pkg.install_from_path(match.download())
PY
  echo "LibreTranslate is installed in .libretranslate/"
}

start() {
  ready && { echo "LibreTranslate already running on :$PORT"; return; }
  [ -x "$DIR/venv/bin/libretranslate" ] || setup
  "$DIR/venv/bin/libretranslate" --host 127.0.0.1 --port "$PORT" \
    --disable-web-ui --threads "${LT_THREADS:-4}" "$@" >"$LOG" 2>&1 &
  echo $! >"$PIDFILE"
  printf 'Starting LibreTranslate'
  for _ in $(seq 1 900); do
    ready && { echo " ready on :$PORT"; return; }
    kill -0 "$(cat "$PIDFILE")" 2>/dev/null || { echo; echo "LibreTranslate exited — see $LOG"; tail -20 "$LOG"; exit 1; }
    printf '.'; sleep 2
  done
  echo; echo "LibreTranslate did not become ready — see $LOG"; exit 1
}

stop() {
  [ -f "$PIDFILE" ] && kill "$(cat "$PIDFILE")" 2>/dev/null || true
  rm -f "$PIDFILE"
}

case "${1:-}" in
  setup) setup ;;
  start) shift; start "$@" ;;
  stop) stop ;;
  run)
    shift; [ "${1:-}" = "--" ] && shift
    started=0
    ready || { start; started=1; }
    trap '[ $started = 1 ] && stop' EXIT
    LIBRETRANSLATE_URL="http://127.0.0.1:$PORT" "$@"
    ;;
  *) sed -n '2,10p' "$0"; exit 1 ;;
esac
