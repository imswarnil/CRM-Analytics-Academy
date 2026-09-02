#!/usr/bin/env bash
# Runs `nuxt dev` so that it dies with its terminal.
#
# `nuxt dev` spawns a child process that is the actual HTTP server. When the
# terminal (or VS Code terminal tab) closes, that child is often reparented and
# keeps holding port 3000 for days. Here we give nuxt its own process group and
# kill the whole group on any exit signal — including SIGHUP, which is what a
# closing terminal sends.
set -uo pipefail

# works whether invoked via `pnpm dev` or directly as `bash scripts/dev.sh`
PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/node_modules/.bin:$PATH"

child=""

# /ask and the MCP route read public/ask-index.json, which is generated (and
# gitignored). Build it up front so a fresh checkout's dev server has it.
node "$(dirname "${BASH_SOURCE[0]}")/build-search-index.mjs" || true

cleanup() {
  trap - EXIT INT TERM HUP
  if [ -n "$child" ]; then
    kill -TERM -- "-$child" 2>/dev/null
    # give nuxt a moment to shut down cleanly, then make sure it is gone
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      kill -0 -- "-$child" 2>/dev/null || return 0
      sleep 0.2
    done
    kill -KILL -- "-$child" 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM HUP

set -m # job control: the background job becomes its own process group leader
nuxt dev "$@" &
child=$!
set +m

wait "$child"
