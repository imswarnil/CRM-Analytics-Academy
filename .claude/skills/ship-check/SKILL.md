---
name: ship-check
description: Pre-deploy verification for CRM Analytics Academy — runs lint, typecheck, and a static build, and flags anything that would break on GitHub Pages. Use before committing/pushing or deploying.
---

# Ship check

Run the full verification the project supports (there's no test runner). Do this before pushing to `main` — a push to `main` deploys to GitHub Pages.

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
   Should end with `✨ Build complete!`. Prerender crawls from `/` — new pages must be link-reachable.
4. **Smoke-test the build locally** (optional but recommended):
   ```bash
   node .output/server/index.mjs   # then open http://localhost:3000
   ```
5. If dev was running, it may have wiped `.data` — run the `dev-reset` skill before returning to dev work.

## Gotchas
- The site is fully static — there are no runtime secrets. `.env` only carries `NUXT_PUBLIC_SITE_URL`.
- Never commit `.env` (it's gitignored). Verify with `git status` before committing.
