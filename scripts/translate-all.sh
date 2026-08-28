#!/usr/bin/env bash
# Translate every locale, one at a time.
#
# Deliberately sequential with a pause between locales: the LibreTranslate box is
# a 2-vCPU VPS, and running the locales back-to-back at higher concurrency has
# already taken it down once (it needed a manual reboot). The manifest records
# progress per file, so this is safe to interrupt and re-run — it picks up where
# it left off.
set -u
cd "$(dirname "$0")/.."

# Accept either "es fr" or "es,fr" — the workflow passes a comma-separated
# string, and without this the whole list would be handled as one locale in a
# single process, which is exactly the pattern that overloads the server.
# Load the endpoint from the gitignored .env when present, so a local run needs
# no exported variables. The URL is deliberately not in this repository — see
# scripts/i18n.config.mjs.
[ -f .env ] && set -a && . ./.env && set +a

if [ -z "${LIBRETRANSLATE_URL:-}" ]; then
  echo "LIBRETRANSLATE_URL is not set. Put it in .env (see .env.example)." >&2
  exit 1
fi

LOCALES="$(echo "${*:-fr de pt ja zh hi ar ru bn ur es}" | tr ',' ' ')"
PAUSE="${PAUSE:-30}"

for locale in $LOCALES; do
  echo "=== $(date '+%H:%M:%S') $locale ==="

  # Wait for the server to be reachable before leaning on it again.
  for attempt in $(seq 1 30); do
    code=$(curl -s -m 20 -o /dev/null -w "%{http_code}" \
      "${LIBRETRANSLATE_URL}/frontend/settings")
    [ "$code" = "200" ] && break
    echo "    server unreachable ($code), waiting… ($attempt/30)"
    sleep 60
  done

  node scripts/translate.mjs --only=content --locales="$locale"
  status=$?
  # 2 = some files fell back to English; they stay out of the manifest and get
  # retried on the next pass, so it is not a reason to stop.
  if [ $status -ne 0 ] && [ $status -ne 2 ]; then
    echo "!!! $locale exited $status — stopping"
    exit $status
  fi

  sleep "$PAUSE"
done

echo "=== $(date '+%H:%M:%S') all locales done ==="
