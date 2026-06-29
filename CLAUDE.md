# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

CRM Analytics Academy — a documentation/learning site. The codebase is currently the **Nuxt UI Docs template** (Nuxt 4 + Nuxt Content + Nuxt UI v4 + Tailwind CSS 4), not yet rebranded; most config still carries the template's default `docs-template.nuxt.dev` strings. Treat those defaults (title, llms domain, GitHub links in `app/app.config.ts`) as placeholders to replace, not as load-bearing values.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@11.9.0`); an untracked `package-lock.json` exists but pnpm is canonical.

```bash
pnpm install        # install deps (runs `nuxt prepare` via postinstall)
pnpm dev            # dev server at http://localhost:3000
pnpm build          # production build
pnpm preview        # preview the production build locally
pnpm lint           # eslint .
pnpm typecheck      # nuxt typecheck (vue-tsc)
```

There is **no test runner** configured — `lint` and `typecheck` are the only verification steps. After editing, run both.

ESLint uses `@nuxt/eslint` with stylistic rules enforced in `nuxt.config.ts`: **no comma-dangle** (`commaDangle: 'never'`) and **1tbs brace style**. Indentation is 2-space (`.editorconfig`).

## Architecture

This is a **content-driven** site: pages come from markdown in `content/`, not from hand-written Vue route components.

### Content pipeline
- `content/` holds the docs as numbered markdown dirs (`1.getting-started/`, `2.essentials/`, `3.ai/`). The numeric prefix sets ordering; `.navigation.yml` per dir overrides title/icon.
- `content.config.ts` defines two collections: `landing` (only `index.md`) and `docs` (everything else). The `docs` schema permits an optional `links` array in frontmatter (rendered as buttons in the page header).
- `app/pages/[...slug].vue` is the single catch-all that renders any `docs` page via `queryCollection('docs').path(route.path)`, using the `docs` layout and Nuxt UI `UPage`/`UContentToc` components. `app/pages/index.vue` renders the landing page.
- To add a page, add a markdown file under `content/` — do **not** create a Vue file.

### Raw markdown + LLM/MCP surface
The site exposes its own content to AI agents three ways, all reading the same `docs` collection:
- `server/routes/raw/[...slug].md.get.ts` — serves any page as raw markdown at `/raw/<path>.md` (via `minimark/stringify`). Injects an h1 + blockquote when the source lacks a leading heading.
- `server/mcp/tools/list-pages.ts` and `get-page.ts` — MCP tools (registered by `@nuxtjs/mcp-toolkit` through the global `defineMcpTool` helper). `get-page` fetches full content by re-requesting the `/raw/...md` route. MCP server name is set under `mcp:` in `nuxt.config.ts`.
- `nuxt-llms` (config under `llms:` in `nuxt.config.ts`) generates `llms.txt` from `contentFilters` over the `docs` collection by path prefix. **When content sections change, update these `sections`/`contentFilters`.**

### Theming & branding
- `app/app.config.ts` — runtime UI config: Nuxt UI `colors` (currently `primary: green`), header/footer/TOC links, `seo.siteName`. This is the main place to rebrand.
- `app/assets/css/main.css` — global CSS / Tailwind `@theme` customizations.
- OG images: `nuxt-og-image` with `zeroRuntime: true`; the template is `app/components/OgImage/Docs.takumi.vue`, invoked via `defineOgImage('Docs', ...)` in `[...slug].vue`.

### Build/render notes
- Static-ish: `nitro.prerender` crawls links from `/` (`crawlLinks: true`), so new pages must be reachable by link to be prerendered.
- `@nuxt/content` uses the **native SQLite connector** (`content.experimental.sqliteConnector: 'native'`).
- `NUXT_PUBLIC_SITE_URL` (`.env.example`) is used for absolute OG image URLs during `nuxt generate`.

## Notes
- A persistent memory note (`project_crm_academy.md`) describes a more elaborate *planned* stack (Docus v4, `@anthropic-ai/sdk` AI assistant, i18n in 5 languages, `content/1.courses/` etc.). **None of that exists in the code yet** — verify against the actual files before relying on it.
