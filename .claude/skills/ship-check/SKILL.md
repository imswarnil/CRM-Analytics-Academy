---
name: ship-check
description: Pre-deploy verification for CRM Analytics Academy — runs lint, typecheck, and a production build, and flags anything that would break on Vercel. Use before committing/pushing or deploying.
---

# Ship check

Run the full verification the project supports (there's no test runner). Do this before pushing to `main` / deploying to Vercel.

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
- Env: the build needs `.env` present (Gemini + `CRMA_*` Supabase keys). Vercel has them set.
- The `SUPABASE_SERVICE_KEY is deprecated` warning is non-blocking.
- Never commit `.env` (it's gitignored). Verify with `git status` before committing.
