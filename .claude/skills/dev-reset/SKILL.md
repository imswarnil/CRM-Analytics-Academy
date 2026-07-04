---
name: dev-reset
description: Cleanly restart the Nuxt dev server, clearing the flaky Nuxt Content SQLite cache. Use whenever the docs navigation is empty, /raw pages 500, or you see "no such table: _content_docs".
---

# Dev reset

The `@nuxt/content` native SQLite dev database (`.data/content/contents.sqlite`) goes stale/corrupt across restarts. Symptoms: **empty docs navigation sidebar**, `/raw/*.md` returning 500, or `no such table: _content_docs` in the server log. The application code is fine — a clean restart regenerates the DB.

## Steps

1. Stop any running dev server and clear the content cache:
   ```bash
   pkill -f "nuxt dev"; rm -rf .data .nuxt/content
   ```
2. Start fresh:
   ```bash
   pnpm dev
   ```
3. Warm the content DB and confirm it's healthy (should return `200`, not `500`):
   ```bash
   sleep 3 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/raw/en/saql.md
   ```
4. If it still fails, also clear `.nuxt` and reinstall prepare:
   ```bash
   pkill -f "nuxt dev"; rm -rf .data .nuxt && pnpm dev
   ```

Note: `pnpm build`/`pnpm typecheck` can also wipe `.data`, so re-run this after those if the dev server was up.
