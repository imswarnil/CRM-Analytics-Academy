---
name: ship-check
description: Pre-deploy verification for CRM Analytics Academy — runs lint, typecheck, and the production build (translation + search index + llms.txt + prerender), and flags anything that would break the Cloudflare deploy. Use before committing/pushing or deploying.
---

# Ship check

Run the full verification the project supports (there's no test runner). Do this before pushing to `main` — a push to `main` deploys to Cloudflare Workers (`deploy-cloudflare.yml`). Translations are NOT made in CI: build locally first so they are committed with the English change.

## Steps

1. **Lint** (auto-fix trivial issues first):
   ```bash
   pnpm lint --fix && pnpm lint
   ```
   Watch for: comma-dangle, 1tbs brace style, and TS `member-delimiter-style` (interfaces need one member per line).
2. **Typecheck**:
   ```bash
   pnpm typecheck
   ```
3. **Production build** (catches SSR/prerender issues dev misses):
   ```bash
   rm -rf .data && pnpm build
   ```
   `pnpm build` runs `scripts/prebuild.mjs` — local LibreTranslate translation of whatever English changed (skipped in CI or with `SKIP_TRANSLATE=1`), `lesson-meta.mjs`, `build-search-index.mjs` (search, MCP index, llms.txt, /raw) — then `nuxt build` with prerender. Prerender crawls from `/` — new pages must be link-reachable. Private routes (`/dashboard`, `/admin`, `/submit`) are never prerendered.
   Commit the translated `content/<locale>/`, `i18n/locales/*.json` and `.translation-manifest.json` with the change.
4. **Smoke-test the build locally** (optional but recommended):
   ```bash
   pnpm preview   # wrangler dev on the Worker bundle; secrets from .dev.vars
   ```
5. If dev was running, it may have wiped `.data` — run the `dev-reset` skill before returning to dev work.

## Gotchas
- Lesson pages are static, but auth, progress, analytics, comments and the admin console run on the Worker and need its secrets (`wrangler secret put …`; the names are in `.env.example`). A missing secret degrades to a 503 on that feature, not a broken build.
- Three build traps that each took the deploy down once are listed in CLAUDE.md (h3 1.x alias, prerender memory, validated translations) — read them before touching `nuxt.config.ts` or the translation scripts.
- Never commit `.env` (it's gitignored). Verify with `git status` before committing.
