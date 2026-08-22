<h1 align="center">CRM Analytics Academy</h1>

<p align="center">
  A free, open-source curriculum for mastering <strong>Salesforce CRM Analytics</strong> —
  data prep, SAQL, dashboards, bindings, and Einstein Discovery.
</p>

<p align="center">
  <a href="https://crmanalytics.imswarnil.com"><strong>🌐 Live site</strong></a> ·
  <a href="https://crmanalytics.imswarnil.com/foundations"><strong>📚 Start learning</strong></a> ·
  <a href="https://crmanalytics.imswarnil.com/contribute"><strong>🤝 Contribute</strong></a>
</p>

<p align="center">
  <a href="https://github.com/imswarnil/CRM-Analytics-Academy/actions/workflows/deploy.yml"><img src="https://github.com/imswarnil/CRM-Analytics-Academy/actions/workflows/deploy.yml/badge.svg" alt="Deploy status"></a>
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&labelColor=020420" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/Nuxt%20UI-v4-00DC82?logo=nuxt&labelColor=020420" alt="Nuxt UI v4">
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&labelColor=1c1c1c" alt="Tailwind 4">
  <img src="https://img.shields.io/badge/Static-prerendered-0176D3?labelColor=1c1c1c" alt="Static">
  <img src="https://img.shields.io/badge/i18n-8%20locales-5B21B6?labelColor=1c1c1c" alt="8 locales">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT">
</p>

<p align="center">
  <img src="./.github/screenshot.png" alt="CRM Analytics Academy home page" width="800">
</p>

## Why this exists

Salesforce CRM Analytics (formerly Wave / Einstein Analytics / Tableau CRM) is
well documented in pieces and poorly documented as a path. This is the path:
six sections that go from "what is a dataset" to shipping a faceted dashboard
and talking about it in an interview — free, open source, and with no sign-up.

## The curriculum

| # | Section | Covers |
|---|---------|--------|
| 1 | [Foundations](https://crmanalytics.imswarnil.com/foundations) | What CRM Analytics is, how data becomes a secure dataset, the platform's building blocks |
| 2 | [Setup & User Provisioning](https://crmanalytics.imswarnil.com/setup) | Licences, permission sets, the Integration and Security users, row-level predicates |
| 3 | [Creating Datasets](https://crmanalytics.imswarnil.com/creating-datasets) | Grain, lookups vs joins, Dataset Builder, recipes, the sync layer |
| 4 | [Lenses & Explorations](https://crmanalytics.imswarnil.com/lenses-and-explorations) | Explorer mode, SAQL behind a chart, the Fields panel, Conversational Analytics |
| 5 | [Designing Dashboards](https://crmanalytics.imswarnil.com/designing-dashboards) | Faceting, conditional formatting, KPI rows, links that carry filters |
| 6 | [Collaboration](https://crmanalytics.imswarnil.com/collaboration) | Sharing, subscriptions, notifications, watchlists, driving adoption |

Each section is video-led — lessons pair a clip from a real training session
with a written article — and closes with an interview-prep study sheet.

## Features

- 📚 **Content-driven curriculum** — lessons are Markdown under `content/`, organised into sections.
- 🌍 **8 locales** — `en` `es` `fr` `de` `pt` `ja` `zh` `hi` (UI strings; lesson bodies are English for now, falling back gracefully).
- 🎬 **Video-led lessons** — a custom player with no YouTube branding; the iframe is only created on click, so nothing preloads.
- 💬 **Interview prep** — model Q&A per section, also emitted as `FAQPage` structured data.
- 📝 **Blog** — original and curated posts, authored as Markdown under `content/blog/`.
- 🧩 **Machine-readable** — every page as raw Markdown at `/raw/…`, plus `llms.txt` and `llms-full.txt` for AI agents.
- ⚡ **Fully static** — no database, no accounts, no server state. 239 pages prerendered at build time.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | **Nuxt 4** (Vue 3, Nitro) |
| Content | **@nuxt/content 3** (Markdown, SQLite at build time) |
| UI | **Nuxt UI v4** + **Tailwind CSS 4** |
| i18n | **@nuxtjs/i18n** (8 locales) |
| SEO | `nuxt-og-image`, `nuxt-llms`, JSON-LD structured data |
| Hosting | **GitHub Pages**, deployed by **GitHub Actions** |

There is no backend. The site used to run on Supabase (accounts, progress,
quizzes, comments, moderation); that layer was removed in favour of a purely
static site. The full data model — and a single-table design for bringing it
back — is documented in **[`dbms.md`](./dbms.md)**.

## Quick start

Requires **Node.js 22.5+** (the content layer uses `node:sqlite`) and **pnpm**.

```bash
git clone https://github.com/imswarnil/CRM-Analytics-Academy.git
cd CRM-Analytics-Academy
pnpm install
pnpm dev                  # → http://localhost:3000
```

Verify before committing (there's no test runner):

```bash
pnpm lint
pnpm typecheck
pnpm generate             # catches SSR/prerender issues dev mode doesn't
```

> **Tip:** if the docs sidebar looks empty in dev, the local content DB went stale — run `rm -rf .data && pnpm dev`.

## Environment variables

Only one, and it's optional locally — copy `.env.example` to `.env` (gitignored):

| Variable | Purpose |
|----------|---------|
| `NUXT_PUBLIC_SITE_URL` | Public site URL, used for OG images when prerendering. |

## Project structure

```
content/                 Lessons (Markdown), per locale → per section
  blog/                  Blog posts (not localized)
app/
  pages/                 Routes incl. the [...slug] catch-all for docs
  components/            Header, footer, ads, MDC content components
  composables/           Ad slots, JSON-LD, PWA install
server/routes/raw/       Any page as raw Markdown, for AI agents
.github/workflows/       GitHub Pages deploy
dbms.md                  Data model reference (historical + single-table design)
how-it-works.md          Narrative architecture walkthrough
```

## Adding a lesson

Add a Markdown file — never a `.vue` file:

```
content/en/<NN.section>/<NN.lesson>.md
```

Numeric prefixes set the ordering; `.navigation.yml` in each section folder sets
its sidebar title and icon. New pages must be link-reachable from `/` to be
prerendered.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`: install → lint →
typecheck → `pnpm generate` → publish `.output/public` to GitHub Pages.

Two files are load-bearing and the workflow asserts both before uploading:

- **`.nojekyll`** (emitted by `nitro.preset: 'github_pages'`) — without it GitHub
  runs Jekyll, which ignores underscore-prefixed directories and would strip all
  of `_nuxt/`, deploying the site with no CSS or JS.
- **`public/CNAME`** — pins the custom domain; if it's missing from the output
  the domain resets to `*.github.io`.

## Contributing

Contributions are welcome — add a lesson, translate content, suggest a resource,
or improve the code. See the full guide at
**[/contribute](https://crmanalytics.imswarnil.com/contribute)**.

## License

[MIT](./LICENSE) © Swarnil Singhai
