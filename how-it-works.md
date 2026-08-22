# How CRM Analytics Academy works

A field guide to the whole project — what runs where, how a request becomes a
page, and how each feature is wired together. See `CLAUDE.md` for the terse
build-instructions version of this; this doc is the narrative walkthrough.

## 1. The stack, in one paragraph

**Nuxt 4** (Vue 3) renders the site. **Nuxt Content 3** turns markdown files
in `content/` into pages at build time. **Nuxt UI v4** + **Tailwind CSS 4**
provide the design system (Salesforce-flavored theme). **There is no
backend** — no database, no auth, no user state. Every page is prerendered to
static HTML at build time and served from **GitHub Pages**. The only server
code left is `server/routes/raw/[...slug].md.get.ts`; it's a Nitro route, but
it gets prerendered too, so each lesson ships as a real `.md` file under
`/raw/` for AI agents and crawlers. **pnpm** is the package manager; there's
no test runner, so `pnpm lint` + `pnpm typecheck` + `pnpm build` are the
verification gates.

One fact shapes a lot of the architecture: Nuxt Content compiles markdown **at
build time**, not at request time — and now there is no runtime at all. So
markdown content is fast and cacheable, but nothing in production can create or
edit a `.md` file. Publishing means committing a file and pushing — which is
exactly what a curriculum site wants: content is reviewable, diffable, and
translatable in git.

The site previously carried a Supabase layer (accounts, progress tracking,
graded quizzes, comments, feedback, guestbook, certificates, an admin
moderation panel, and a file-writing Content Studio). All of it was removed.
`dbms.md` records the complete schema that ran it, plus a single-table design
if any of it is ever wanted back.

## 2. Content (`content/`)

### 2a. Docs — the curriculum

```
content/<locale>/<NN.module>/<NN.lesson>.md
```

- 8 locales: `en` (default, unprefixed) + `es fr de pt ja zh hi`.
- Numeric prefixes (`3.creating-datasets`, `4.grain-lookups-and-joins.md`)
  set both the on-disk sort order and the site navigation order.
- Each module folder has a `.navigation.yml` with `title`/`icon`, overriding
  the folder name in the sidebar.
- `content.config.ts` defines the `docs` collection schema: `title`,
  `description` (built into Nuxt Content's `page` type), plus custom fields —
  `links[]` (header buttons), `video` (a YouTube clip: id/start/end), and
  `interview[]` (model Q&A rendered after the body).
- **One Vue file renders every docs page**: `app/pages/[...slug].vue`. It
  maps the localized route to a content path, fetches the page via
  `queryCollection('docs')`, and renders: breadcrumb → header → video embed →
  `ContentRenderer` (the markdown body) → interview prep → prev/next surround
  links. It also builds `TechArticle` + `BreadcrumbList` (+ `VideoObject` /
  `FAQPage` when applicable) JSON-LD for SEO.
- To add a lesson you add a markdown file — never a `.vue` file. New pages
  must be reachable by a link from `/` or they won't get prerendered
  (`nitro.prerender.crawlLinks`).
- Reusable content components available inside the markdown body via MDC
  syntax: `::note`, `::tip`, `::lesson-cards`, `::lesson-links`,
  `::lesson-steps`.
- The same collection is also exposed to AI agents/crawlers: any page as raw
  markdown at `/raw/<path>.md` (`server/routes/raw/[...slug].md.get.ts`), and
  `llms.txt` generated from it via the `nuxt-llms` module (`llms:` block in
  `nuxt.config.ts` — update `sections` there when docs sections change).

### 2b. Blog (`content/blog/`)

Also markdown, but **not** locale-prefixed — one collection, `blog`, sourced
from `content/blog/**` (excluded from the `docs` collection so the two don't
double-ingest each other). Frontmatter:

- `title`, `description`, `coverUrl`, `tags[]`, `status` (`draft`/
  `published` — drafts are simply excluded from the index/detail query, no
  special build step), `publishedAt`.
- `isExternal` marks a **curated** post — pointing at someone else's article.
  Curated posts require `sourceUrl` + `authorName`, render a visible credit
  line, and set `rel="canonical"` back to the original so this site doesn't
  compete with the source in search. `excerptOnly` (default `true`) means:
  host a summary here, link out for the full piece.
- Public pages: `app/pages/blog/index.vue` (tag-filterable list) and
  `app/pages/blog/[slug].vue` (detail — 404s if the slug is missing or still
  a draft), both querying the `blog` collection directly with
  `queryCollection`.

### 2c. Authoring

There is no authoring GUI. Write the markdown file, commit, push. An earlier
iteration had a Content Studio (an admin-gated GUI that wrote real markdown
files to disk via `node:fs`, usable only under `pnpm dev` since the production
filesystem was read-only); it was removed along with the rest of the
authenticated surface. The `new-lesson` skill in `.claude/skills/` scaffolds
the frontmatter if you want a starting point.

## 3. Request lifecycle, top to bottom

A docs page (`crmanalytics.imswarnil.com/setup/licenses-and-permission-sets`):

1. **Build time** (GitHub Actions): `pnpm generate` runs Nuxt Content's build
   step, which parses every file under `content/` into a queryable collection
   and prerenders every page reachable by crawling links from `/`
   (`nitro.prerender.crawlLinks`). Output lands in `.output/public`.
2. **Request**: GitHub Pages serves the prerendered HTML as a plain file.
   Nothing is computed per-request — there is no server process at all.
3. On the client, Nuxt hydrates and `app/pages/[...slug].vue` takes over for
   subsequent client-side navigations. It resolves each route to a content
   path (`routeToContentPath`, aware of the 8 locale codes) and — if the
   locale-specific page doesn't exist yet — falls back to the English version
   rather than 404ing a reader whose language switcher points somewhere
   untranslated.

Because no page makes an authenticated fetch, every route is prerenderable,
and the whole site is static HTML plus a hydration bundle.

## 4. i18n

`i18n/locales/*.json`, one JSON per locale, no fallback — every user-facing
nav string has to be added to **all 8** files or a locale will show a raw
translation key. Internal links must go through `useLocalePath()` /
`localePath('/path')` so the locale prefix is applied correctly (the default
`en` locale is unprefixed; others aren't).

## 5. Theming, SEO, ads

- `app/app.config.ts` — Nuxt UI runtime config: `primary: salesforce`,
  `neutral: cloud`, header/footer/TOC links.
- `app/assets/css/main.css` — global CSS + Tailwind `@theme`.
- OG images generated per-page via `nuxt-og-image` (`zeroRuntime` — computed
  at build, not per-request) using the `OgImage/Docs.takumi.vue` template.
- `AdUnit.vue` renders Google AdSense at named placements (`headerBanner`,
  `endOfArticle`, `relatedPosts`, `sidebarSquare`, `footer`); docs pages also
  auto-inject an ad between body sections (`injectInArticleAds`).
- Third-party scripts (AdSense, gtag) are declared with
  `tagPosition: 'bodyClose'` and preceded by `preconnect`/`dns-prefetch`
  hints, so they don't compete with the critical CSS/JS during first paint.

## 6. Environment & commands

`.env` (gitignored) carries a single optional variable,
`NUXT_PUBLIC_SITE_URL`, used for OG images when prerendering. There are no
runtime secrets — nothing to leak, nothing to rotate.

```bash
pnpm install         # deps
pnpm dev             # dev server
pnpm generate        # static build for GitHub Pages → .output/public
pnpm build           # same thing under the github_pages preset
pnpm preview         # preview the production build
pnpm lint            # eslint . (run after every edit)
pnpm typecheck       # nuxt typecheck
```

No test runner exists — lint + typecheck + a real `pnpm build` are the only
verification available, so a `pnpm build` is worth running for anything with
runtime (not just type-level) behavior, since it catches SSR/prerender
issues dev mode doesn't.

**Common gotcha**: `@nuxt/content`'s dev-mode SQLite cache
(`.data/content/contents.sqlite`) goes stale across restarts — symptoms are
an empty docs nav sidebar or `no such table: _content_docs`. Fix:
`pkill -f "nuxt dev"; rm -rf .data && pnpm dev` (see the `dev-reset` skill).

## 7. Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main` (and on manual
dispatch): install → `pnpm lint` → `pnpm typecheck` → `pnpm generate` →
`upload-pages-artifact` → `deploy-pages`. Concurrency group `pages` with
`cancel-in-progress: false`, so a push landing mid-deploy queues rather than
getting dropped.

Two files make or break a Pages deploy, and the workflow asserts both exist
before uploading:

- **`.output/public/.nojekyll`** — emitted by `nitro.preset: 'github_pages'`.
  Without it GitHub runs Jekyll over the output, which ignores every
  underscore-prefixed directory. That means all of `_nuxt/` disappears and the
  site deploys with no CSS or JS.
- **`.output/public/CNAME`** — comes from `public/CNAME`, containing
  `crmanalytics.imswarnil.com`. GitHub reads this to keep the custom domain
  bound; if it goes missing the domain resets to `*.github.io` on deploy.

`404.html` is generated automatically and is what Pages serves for unknown
paths. `nitro.prerender.autoSubfolderIndex: false` writes `about.html` rather
than `about/index.html`; Pages resolves `/about` to it, so extensionless URLs
work either way.

DNS: the apex/subdomain record must point at GitHub Pages, not Vercel — a
`CNAME` for `crmanalytics` → `imswarnil.github.io`. Enable **Settings → Pages →
Source: GitHub Actions** on the repo, and tick *Enforce HTTPS* once the
certificate provisions.
