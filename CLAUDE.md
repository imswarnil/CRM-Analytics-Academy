# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CRM Analytics Academy** — a free, open-source learning site for Salesforce CRM Analytics (data prep, SAQL, dashboards, bindings, Einstein Discovery). Live at **crmanalytics.imswarnil.com**, hosted on **Cloudflare Workers** (prerendered pages served as static assets, a small Worker for the dynamic routes) and deployed by GitHub Actions (`deploy-cloudflare.yml`). GitHub: **imswarnil/CRM-Analytics-Academy**.

Built on **Nuxt 4 + Nuxt Content 3 + Nuxt UI v4 + Tailwind CSS 4**, styled as the stock Nuxt UI docs template. It is a **markdown-driven site**: every docs page is prerendered at build time from `content/`, not hand-written as Vue routes. On top of that sits a small dynamic layer — **Neon Postgres + Neon Auth (better-auth)** — for sign-in/sign-up, a demo account, lesson progress, submissions and an admin console. Server code lives in `server/api/**` and `server/utils/**`; the schema is in `server/db/*.sql`.

> History: an earlier Supabase layer was removed end to end (`dbms.md` records that era's schema — it is historical, **not** the current design), the site then ran fully static on GitHub Pages, and the dynamic layer was later rebuilt on Neon + Cloudflare. `how-it-works.md` also predates the Neon layer.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@11.9.0`). Do **not** use npm.

```bash
pnpm install        # deps (runs `nuxt prepare` via postinstall)
pnpm dev            # dev server → http://localhost:3000
pnpm build          # production build (also runs prerender)
pnpm preview        # preview the production build
pnpm lint           # eslint .   (run after editing)
pnpm typecheck      # nuxt typecheck (vue-tsc)  (run after editing)
```

There is **no test runner** — `lint` and `typecheck` are the only verification steps. Run both after edits. For anything with runtime behavior, also do a `pnpm build` (it catches SSR/prerender issues dev doesn't).

### ⚠️ Dev-server content database (common gotcha)
`@nuxt/content` (native SQLite connector) stores a dev DB at `.data/content/contents.sqlite`. It **frequently goes stale/corrupt** across restarts, producing `no such table: _content_docs` on server routes **and an empty docs navigation sidebar**. Fix = clean restart:

```bash
pkill -f "nuxt dev"; rm -rf .data && pnpm dev
```

If the docs nav or `/raw/*.md` ever looks empty/broken in dev, this is almost always the cause (the code is fine — it renders correctly on a clean build). See the `dev-reset` skill.

### Lint style (enforced)
`@nuxt/eslint` stylistic rules in `nuxt.config.ts`: **no comma-dangle**, **1tbs** brace style, 2-space indent. TypeScript interfaces: **one member per line, no comma/semicolon delimiter** between members (inline `{ a: X, b: Y }` on one line fails `member-delimiter-style`). `pnpm lint --fix` handles most issues.

## Architecture

### Content pipeline (the docs)
- `content/<locale>/<NN.module>/<NN.lesson>.md` — numeric prefixes set ordering; `.navigation.yml` per dir overrides `title`/`icon`. 12 locales: `en` (default, unprefixed) + `es fr de pt ja zh hi ar ru bn ur`; `ar` and `ur` are RTL. **Only `content/en/` is written by hand** — see "Translation pipeline" below.
- `content.config.ts` — the `docs` collection schema. Frontmatter supports: `title`, `description`, optional `links[]` (header buttons), `video` (`{ id, start, end }` — a YouTube clip embedded at the top), and `interview[]` (`{ q, a }` — model Q&A rendered after the body, also emitted as FAQPage JSON-LD).
- `app/pages/[...slug].vue` — the single catch-all rendering any docs page (`docs` layout, `UPage`/`UContentToc`). It maps the localized route → content path, renders the video, body, and interview Q&A, and falls back to the English page when a locale is untranslated.
- `app/pages/index.vue` — landing page. Other top-level `app/pages/*.vue` are hand-written (about, resources, contribute, roadmap, changelog, sponsor, datasets, privacy, terms).
- **Showcase**: community dashboard write-ups under `content/showcase/**` (a separate `showcase` collection, not localized). Each entry carries a screenshot, `kpis[]` (name + formula + why), `recipe[]` (build steps), `datasets[]` and `techniques[]`. `domain`/`difficulty`/`techniques` drive client-side filters on `app/pages/showcase/index.vue`; detail at `app/pages/showcase/[slug].vue`. Screenshots go in `public/showcase/`.
- There is **no blog** — it was replaced by `content/resources/` in commit `54095d1`.
- To add a lesson, add a markdown file under `content/` (see the `new-lesson` skill). Do **not** create a Vue file. New pages must be link-reachable from `/` to be prerendered (`nitro.prerender.crawlLinks`).

### Static-first constraints
- The curriculum stays prerendered: content pages must not gain fetches that can't run at build time. Dynamic behavior belongs on the private routes (`/dashboard`, `/submit`, `/admin`, `/api/**`), which are excluded from the prerender via `privateRoutes` in `nuxt.config.ts`.
- `nitro.preset: 'cloudflare_module'`; `wrangler.jsonc` serves `.output/public` as static assets and only misses reach the Worker. Auth state is resolved server-side per request (`server/utils/auth.ts`), never trusted from the client.
- Publishing content = commit a markdown file and push to `main`. `.github/workflows/deploy-cloudflare.yml` deploys; `deploy.yml` (GitHub Pages, `NITRO_PRESET=github_pages`) is a manual-dispatch rollback path that builds the static-only bundle without auth.

### Raw markdown + LLM surface
Same `docs` collection, exposed to AI agents/crawlers two ways:
- `server/routes/raw/[...slug].md.get.ts` — any page as raw markdown at `/raw/<path>.md`.
- `nuxt-llms` (`llms:` in `nuxt.config.ts`) — generates `llms.txt` from `contentFilters` by path prefix. **When docs sections change, update these `sections`.**

### Theming & branding
- `app/app.config.ts` — runtime UI config (colors: `primary: salesforce`, `neutral: cloud`; header/footer/TOC links).
- `app/assets/css/main.css` — global CSS / Tailwind `@theme`.
- OG images: `nuxt-og-image` (`zeroRuntime`), template `app/components/OgImage/Docs.takumi.vue`.
- Ads: Google AdSense via `AdUnit.vue` (placements: headerBanner, endOfArticle, relatedPosts, sidebarSquare, footer). Third-party scripts load at `tagPosition: 'bodyClose'` with preconnect hints — keep it that way.

### Translation pipeline
English is the source of truth; the other 11 locales are **generated**.

```bash
pnpm translate                  # only what changed
pnpm translate --locales=es,fr  # subset;  --only=ui|content, --limit=N, --force, --dry-run
```

`.github/workflows/translate.yml` runs this on every push to `main` that touches
`content/en/**` or `i18n/locales/en.json`, and commits the result back (which triggers the
deploy). It refuses to finish if the script modified anything under `content/en/`.

- `scripts/translate.mjs` — driver: block parsing, batching, retry, incremental manifest.
- `scripts/markdown-protect.mjs` — markdown ⇄ HTML with placeholder atoms. **Read the header comment before touching it**; the design is dictated by measured server behaviour (raw markdown gets corrupted, HTML tags survive, unicode sentinels are destroyed, placeholders fragment sentences).
- `scripts/i18n.config.mjs` — locale map (LibreTranslate codes differ: `zh-Hans`, `pt-BR`), glossary, native locale names.
- `.translation-manifest.json` — per-file and per-UI-key hashes of the **English** source. A file that fell back to English is deliberately left out, so the next run retries it.

Hand-fix a bad translation by editing the locale file directly — it is only regenerated when
its English source changes. See the `translate-lesson` skill for the full rationale.

## Environment variables

Local values live in a **gitignored `.env`** (`.env.example` documents the shape). There are **no secrets** — the only variable is `NUXT_PUBLIC_SITE_URL` (public site URL, used for OG images when prerendering).

## Conventions
- Links: use `useLocalePath()` / `localePath('/path')` for internal links (i18n prefixing). New user-facing strings go in `i18n/locales/en.json` **only** — `pnpm translate --only=ui` fills in the other 11 and preserves existing translations. There is no message fallback, so a key missing from a locale renders as the raw key.
- JSON-LD `inLanguage`, the canonical link and `og:locale` are all derived from the active locale (`app/app.vue`). Don't hardcode `'en'` — every locale prerenders its own copy of each page.
- All data is either markdown frontmatter or a static array in the page that uses it (e.g. the curated list in `app/pages/resources.vue`).

## The project/ folder
`project/` holds Swarnil's local Salesforce project material (org metadata, dashboard JSON,
SAQL scratch files). It is **outside the build**: not in `content/`, not linked from any
page, so neither Nuxt Content nor the prerender crawler sees it. The repo is public — see
`project/README.md` for what must be sanitised before committing.

## Notes
- `how-it-works.md` is the narrative architecture walkthrough; `dbms.md` is the data-model reference.
- Memory note `project_crm_academy.md` describes project context — verify against the actual files before relying on it.
