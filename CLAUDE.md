# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CRM Analytics Academy** — a free, open-source learning site for Salesforce CRM Analytics (data prep, SAQL, dashboards, bindings, Einstein Discovery). Live at **crmanalytics.imswarnil.com**, hosted on **Cloudflare Workers** (prerendered pages served as static assets, a small Worker for the dynamic routes) and deployed by GitHub Actions (`deploy-cloudflare.yml`). GitHub: **imswarnil/CRM-Analytics-Academy**.

Built on **Nuxt 4 + Nuxt Content 3 + Nuxt UI v4 + Tailwind CSS 4**, styled in the Blueprint design system (see "Theming & branding"). It is a **markdown-driven site**: every docs page is prerendered at build time from `content/`, not hand-written as Vue routes. On top of that sits a small dynamic layer — **Neon Postgres + Neon Auth (better-auth)** — for sign-in/sign-up, a demo account, lesson progress, submissions and an admin console. Server code lives in `server/api/**` and `server/utils/**`; the schema is in `server/db/*.sql`.

> History: an earlier Supabase layer was removed end to end, the site then ran fully static on GitHub Pages, and the dynamic layer was later rebuilt on Neon + Cloudflare. The README holds the current low-level design.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@11.9.0`). Do **not** use npm.

```bash
pnpm install        # deps (runs `nuxt prepare` via postinstall)
pnpm dev            # dev server → http://localhost:3000
pnpm build          # production build (also runs prerender)
pnpm preview        # build, then run the Worker bundle locally with wrangler dev
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

### ⚠️ Build traps (each one took the deploy down once)
- **`h3` must be 1.x everywhere.** `h3` is a direct dependency and aliased in `nuxt.config.ts` (`alias.h3`) because modules that import it without declaring it get whatever pnpm hoists — once that was devtools' h3 2.x, and every content query, prerender and hydration broke (`event.req.headers.get is not a function`; in dev, "Maximum call stack size exceeded").
- **Prerender memory.** `server/plugins/devtools-plugin-leak.ts` empties `__VUE_DEVTOOLS_PLUGINS__` after each response; without it vue-i18n leaked a whole app per prerendered page and the build died past 12 GB. Redirect sources and double-locale paths are in `nitro.prerender.ignore` — crawled, they nested into thousands of phantom routes. Translated `/raw/<locale>/*.md` are written as static files by `scripts/build-search-index.mjs`, not prerendered.
- **Translated UI strings are validated.** `translate.mjs` refuses a message that does not compile, adds `<`, `@`, `|` or `$`, or changes `{placeholders}` (vue-i18n fails the build on those). Keep symbols like ▲ out of translatable strings — put them in the template.

### Lint style (enforced)
`@nuxt/eslint` stylistic rules in `nuxt.config.ts`: **no comma-dangle**, **1tbs** brace style, 2-space indent. TypeScript interfaces: **one member per line, no comma/semicolon delimiter** between members (inline `{ a: X, b: Y }` on one line fails `member-delimiter-style`). `pnpm lint --fix` handles most issues.

## Architecture

### Content pipeline (the docs)
- `content/<locale>/<NN.module>/<NN.lesson>.md` — numeric prefixes set ordering and are **always two digits** (`01.`, `02.` … `10.`); `.navigation.yml` per dir overrides `title`/`icon`. The padding is not cosmetic: prefixes sort as strings, so a single-digit `10.revops-analytics` lands between `1.` and `2.` in the sidebar. Pad any new module or lesson, and pad it in every locale — `.translation-manifest.json` keys are `<locale>:<path>`, so a rename there must be remapped or the pipeline re-translates the file. 12 locales: `en` (default, unprefixed) + `es fr de pt ja zh hi ar ru bn ur`; `ar` and `ur` are RTL. **Only `content/en/` is written by hand** — see "Translation pipeline" below.
- `content.config.ts` — the `docs` collection schema. Frontmatter supports: `title`, `description`, optional `links[]` (header buttons), `video` (`{ id, start, end }` — a YouTube clip embedded at the top), and `interview[]` (`{ q, a }` — model Q&A rendered after the body, also emitted as FAQPage JSON-LD).
- `app/pages/[...slug].vue` — the single catch-all rendering any docs page (`docs` layout, `UPage`/`UContentToc`). It maps the localized route → content path, renders the video, body, and interview Q&A, and falls back to the English page when a locale is untranslated.
- `app/pages/index.vue` — landing page. Other top-level `app/pages/*.vue` are hand-written (about, resources, contribute, roadmap, changelog, sponsor, datasets, privacy, terms).
- **Showcase**: community dashboard write-ups under `content/showcase/**` (a separate `showcase` collection, not localized). Each entry carries a screenshot, `kpis[]` (name + formula + why), `recipe[]` (build steps), `datasets[]` and `techniques[]`. `domain`/`difficulty`/`techniques` drive client-side filters on `app/pages/showcase/index.vue`; detail at `app/pages/showcase/[slug].vue`. Screenshots go in `public/showcase/`.
- There is **no blog** — it was replaced by `content/resources/` in commit `54095d1`.
- **Nuxt Studio** (`nuxt-studio` module; Payload in `cms/` is now the primary editor, see below) serves an in-browser markdown editor at `/_studio`, committing to `main` through a GitHub OAuth app. The hosted nuxt.studio service is gone, so the old `content.preview` config must not come back. Sign-in needs two Worker secrets, `STUDIO_GITHUB_CLIENT_ID` and `STUDIO_GITHUB_CLIENT_SECRET` (see `.env.example`); without them `/_studio` answers 404 "No authentication provider found"; publishing only works in a production build.
- **People, authors and credits.** `content/people/<slug>.yml` is the `people` data collection (excluded from `docs`): name, role (`instructor | maintainer | blogger | creator | community`), avatar, headline, links. English lesson frontmatter `authors: [slug]` (none ⇒ the owner, `swarnil-singhai`) renders as chips under the title and Person `author` JSON-LD; `credits: [{ kind: video|post|article|image|dataset, title, author, authorUrl?, url, license?, note? }]` renders "Credits & sources" + `citation`; `video.author/authorUrl/title` credits someone else's YouTube video ("Video by …", `isBasedOn`). Translations inherit all three from the English doc at render time (`useLessonCredits`). Everyone appears on `/instructors`. Validation rules live in `shared/utils/lessonContent.ts` and must stay in step with `content.config.ts`. ⚠️ `gate-content.mjs` stubs drop `authors`/`credits`, so Pro lessons show the default author until its keep-list includes them.
- **In-browser editor (`/admin → Content`)** reads `main` via GitHub GraphQL and writes via the Git Data API (`server/utils/content-{git,course,publish,reorder,studio}.ts`). Admins commit to main; role `instructor` (migration `012`, linked to a person in `app.instructor_profile`) edits only lessons listing them in `authors`, and saves go to a `lesson/<slug>-<id>` branch + PR for the review queue. A reorder renames English files, the same paths in every locale and the `.translation-manifest.json` keys in one commit. The editor never writes outside `content/` and the manifest.
- To add a lesson, add a markdown file under `content/` (see the `new-lesson` skill). Do **not** create a Vue file. New pages must be link-reachable from `/` to be prerendered (`nitro.prerender.crawlLinks`).

### Static-first constraints
- The curriculum stays prerendered: content pages must not gain fetches that can't run at build time. Dynamic behavior belongs on the private routes (`/dashboard`, `/submit`, `/admin`, `/api/**`), which are excluded from the prerender via `privateRoutes` in `nuxt.config.ts`.
- `nitro.preset: 'cloudflare_module'`; `wrangler.jsonc` serves `.output/public` as static assets and only misses reach the Worker. Auth state is resolved server-side per request (`server/utils/auth.ts`), never trusted from the client.
- Publishing content = commit a markdown file and push to `main`. `.github/workflows/deploy-cloudflare.yml` deploys; `deploy.yml` (GitHub Pages, `NITRO_PRESET=github_pages`) is a manual-dispatch rollback path that builds the static-only bundle without auth.

### Raw markdown + LLM surface
Same `docs` collection, exposed to AI agents/crawlers two ways:
- `server/routes/raw/[...slug].md.get.ts` — any page as raw markdown at `/raw/<path>.md`.
- `nuxt-llms` (`llms:` in `nuxt.config.ts`) — generates `llms.txt` from `contentFilters` by path prefix. **When docs sections change, update `LLM_SECTIONS`.**
- `server/routes/mcp.{get,post}.ts` — a read-only MCP server at `/mcp` (`list_curriculum`, `search_lessons`, `get_lesson`). It searches `public/ask-index.json`, which `pnpm ask:index` (`scripts/build-search-index.mjs`) generates during `pnpm build`; the file is gitignored.

### Theming & branding — "Blueprint"
The whole UI follows the Blueprint design language (the handoff folder it came from is not in the repo; `app/assets/css/main.css` and `app/components/bp/` are the reference now). Engineering-drawing language: paper/ink, graph paper, crosshair crop marks, rulers, hard offset shadows, square corners, mono eyebrows ("FIG. 01 —", "SHEET 02 /"). Keep new UI in that language.
- `app/assets/css/main.css` — the tokens (`--paper`, `--card`, `--ink`, `--ink2`, `--line`, `--navy`, `--signal`, `--tide`, `--frost`, `--ice`, `--glow`, dark mode in `.dark`), the `blueprint` / `glow` / `ink` ramps behind Nuxt UI's colours, and the utilities: `graph-paper`, `graph-paper-fine`, `graph-paper-navy`, `hatch`, `hatch-signal`, `ruler`, `eyebrow`, `mono-label`, `crosshair`, `bp-h1/h2/h3`, `bp-lead`, `bp-player`, `bp-prose` (§-numbered h2s). Colour by token (`text-(--ink)`, `bg-(--ice)`), never by hex.
- `app/app.config.ts` — Nuxt UI slot overrides (square, 1.5px ink borders, hard shadows on solid buttons). `primary: blueprint`, `secondary: glow`, `neutral: ink`.
- `app/components/bp/*` — the drawing primitives: `BpPageHeader` (sheet header), `BpFigure` (captioned crosshair frame + ruler), `BpBarChart`, `BpDonut`, `BpCourseContents` (the player sidebar), `BpShowcaseThumb`, `BpDrawing`, `BpPolaroid` / `BpPolaroidWall`, `BpTimeline`.
- The lesson page is a **player**: `app/layouts/docs.vue` is the grid (lesson + 360px sticky course contents, collapsible to a 60px donut rail — remembered in the `bp-contents-collapsed` cookie; a slideover below 1024px). `app/pages/[...slug].vue` renders the header, media figure, prev / mark complete / next, the course timeline and the body.
- Lesson length, kind and access for every route come from `app/data/lesson-meta.json`, generated by `scripts/gate-content.mjs` (read via `useLessonMeta()`).
- ⚠️ Tailwind's scanner skips `[...slug].vue` (it reads the brackets as a glob class), so utilities used only there were never generated. `main.css` names those files in explicit `@source` lines — keep them if you add another bracketed page.
- OG images: `nuxt-og-image` (`zeroRuntime`), template `app/components/OgImage/Docs.takumi.vue`.
- Promo slots: `PromoSlot.global.vue` (registered globally — the `.global` suffix is what lets the slots injected into lesson bodies resolve) shows the month's **sponsor** (one per calendar month, $99, booked self-serve on `/sponsor`, built in `/sponsor/studio`, tables in `server/db/010_sponsors.sql`) or the house placeholder; each placement maps to a format (leaderboard / square / text) in `app/utils/promo.ts`. AdSense is off — it only loads when built with `NUXT_PUBLIC_PROMO_NETWORK=adsense` (`utils/promoNetwork.ts`, `promo/Network.vue`). Serving routes are `/api/placement/*`, sponsor routes `/api/partner/*`, creative images `/media/brand/*` — never "ad" or "sponsor" in a URL a lesson page requests. **Do not name files, components or CSS classes with "ad"/"adsense"/"AdUnit"**: ad blockers refuse to load a module whose URL matches, and a lesson page that imports it fails to render at all — that is why it is `PromoSlot`, `usePromoSlot`, `utils/promo.ts`, `.promo-slot`, and why its CSS lives in `main.css` rather than a scoped `<style>`. Third-party scripts load at `tagPosition: 'bodyClose'` with preconnect hints — keep it that way.

### Payload CMS (`cms/`)
Authoring happens in **Payload 3** (a small Next.js app in `cms/`, its own pnpm project — the site's build never installs it). The site never reads Payload at runtime: content still reaches it as markdown under `content/`, so prerendering, the Pro gating and the translation pipeline are unchanged.
- Database: the site's Neon `DATABASE_URL`, in Payload's **own `payload` schema** — it never touches `app` or `neon_auth`. Uploads go to `public/cms-media/` unless the `S3_*` (R2) variables are set. Config in `cms/.env` (see `cms/.env.example`).
- Collections: `sections` (a folder under `content/en`), `lessons` (English only; body stored verbatim as markdown so MDC blocks survive), `showcase`, `resources`, `media`, `users`. Frontmatter the schema does not model is kept in each record's `extra` JSON, so the round trip is lossless.
- `pnpm cms:dev` → http://localhost:3100/admin (create the first admin user there).
- `pnpm cms:import` loads `content/` into Payload (upserts on file path; safe to re-run).
- `pnpm cms:pull` writes Payload back to `content/`; `pnpm cms:pull:dry` lists what would change. A file is rewritten only when what the site parses from it changes — never for YAML formatting — because every rewritten English file is re-translated into 11 languages. Records deleted in Payload are reported, not deleted from disk.
- Publishing = `pnpm cms:pull`, review the diff, commit, push (the translate and deploy workflows take it from there).
- Test mode: Payload runs locally only for now; it is not deployed.

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

## Pro lessons, payments, video and comments

- **Pro lessons.** Mark a lesson `access: pro` in its **English** frontmatter; every translation follows. `scripts/gate-content.mjs` (run by `pnpm build`) moves the full body into `server/assets/gated/<locale>/<route>.json` and writes a public stub (title, navigation, teaser) into `.gated-stubs/`; `content.config.ts` excludes the real files and reads the stubs instead, because the content collection ships to the browser as `dump.docs.sql`. The body is served only by `/api/lesson/<locale>/<route>` after `hasPro()`. `pnpm build` ends with `scripts/verify-gating.mjs`, which decodes the dumps and fails the build if any hidden text is public. Admins toggle access in `/admin → Lessons & Pro`, which commits the frontmatter change to GitHub.
- **Payments: Dodo Payments.** `/pricing` → `POST /api/billing/checkout` → Dodo hosted checkout → `POST /api/billing/webhook` (Standard Webhooks signature, replay-guarded by `app.webhook_event`) grants/revokes `app.entitlement`. The return redirect grants nothing. Worker secrets: `MY_DODO_API_KEY`, `DODO_WEBHOOK_SECRET`, `DODO_ENV` (`test` until you switch to live), and one product id per plan — `DODO_PRODUCT_PRO_MONTHLY`, `DODO_PRODUCT_PRO_ANNUAL` (the featured plan), `DODO_PRODUCT_TEAM_SEAT` (`/teams`), `DODO_PRODUCT_SPONSOR_MONTH` (`/sponsor`), and the legacy `DODO_PRODUCT_PRO_LIFETIME`. A plan whose id is unset answers 503 "This plan is not available yet" at checkout, so a silent 503 on `/pricing` or `/teams` is a missing secret, not a bug.
- **Video: Mux, one video per lesson.** Frontmatter `mux: <playbackId>` (a single id) on the English lesson; every locale plays the same asset (`LessonPlayer`, `<mux-player>`). Languages are captions, not recordings: `content-transcripts/en/<route>.vtt` is synced from Mux's auto-generated English captions (`pnpm captions`, and the daily `captions.yml`), `translate.mjs --only=transcripts` makes the other 11 (cue text only, timings byte-identical), and gate-content publishes free lessons' to `public/transcripts/` and keeps Pro lessons' in `server/assets/gated-transcripts/` (served by `/api/transcript` after `hasPro()`). The player turns on the reader's caption language and shows a searchable, click-to-seek transcript panel. An old per-language `mux` map still parses but only `en` is used. Free lessons use public playback ids; Pro lessons use signed ids and need `MUX_SIGNING_KEY_ID` / `MUX_SIGNING_KEY_SECRET` on the Worker.
- **Inline Pro blocks.** `::pro … ::` in a free lesson gates just that part (text, tables, `:::lesson-video{mux="…"}`) with the same machinery: gate-content moves each block into `server/assets/gated-blocks/`, the public stub gets `::pro-locked{…}` (counts only), `/api/lesson-block/<locale>/<route>?n=` returns it after `hasPro()`, and verify-gating probes it. Components nested inside `::pro` use **three colons**; two fail the build. A translation whose block count differs from English is withheld (that locale shows the English page) until re-translated. Locked lessons and locked blocks share one card, `CourseProLockedCard` (copy under `pro.*`).
- **Comments.** `app.comment` (`server/db/006_comments.sql`), one level of replies, keyed by the locale-stripped lesson path. Moderated in `/admin → Comments`.
- Migrations in `server/db/*.sql` are applied by hand against Neon, in order.

## Languages, search engines and video uploads

- **First-visit language.** `app/plugins/locale-auto.client.ts` picks a locale once: the browser's languages first (a supported one wins, English included), then the country from `/api/geo` (Cloudflare `cf.country`) only when no browser language is supported. India and Pakistan are deliberately unmapped. It stores the pick in the i18n module's `i18n_redirected` cookie; the header switcher (`setLocale`) overrides it. It never runs for bots, private routes or English-only pages — every locale must stay its own crawlable URL.
- **Structured data.** `usePageSchema()` gives every hand-written page a typed WebPage + BreadcrumbList linked to the site graph (`ORG_ID`, `WEBSITE_ID` in `app.vue`). Lessons build their own in `[...slug].vue` (TechArticle, LearningResource, HowTo, FAQ), with `workTranslation` / `translationOfWork` between the 12 language versions and paywall markup (`.bp-paywalled`) on Pro lessons. Structured data must match the page: no invented prices, addresses or ratings.
- **IndexNow.** `scripts/indexnow.mjs` (key file in `public/`) runs after every deploy and submits the URLs the push changed; a manual `workflow_dispatch` deploy submits the whole sitemap. Google does not take IndexNow — it uses the sitemap and Search Console.
- **Producing a lesson video.** `pnpm video <stage> <route>` — `script` (deterministic; `--with-claude` only writes a prompt file), `voice` (`heygen` | `local-clone` | `file`; **no default/system TTS**), `avatar` (`heygen` | `none`), `motion` (scaffolds a HyperFrames project, never renders), `edit` (edit.json + captions.srt + PREMIERE.md for the Premiere MCP), `upload` (Mux with generated English captions; writes `mux:`), `captions`. Work files in `.data/video/<route>/`. HeyGen or any cloud service runs only when the owner selects it. Config `video/video.config.json`, guide `video/README.md`, env `HEYGEN_API_KEY`, `MUX_TOKEN_ID`/`MUX_TOKEN_SECRET` (else the `mux login` CLI). `pnpm mux:lesson <route> <file>` is the upload stage's short form. `pnpm video test` runs the offline VTT/::pro checks.

## Leads, teams and the PWA

- **Leads.** Every business form (the sales form at `/teams#contact`, `/instructors`, `/nominate`, `/sponsor`) posts to `POST /api/leads` → `app.lead` in Neon. Business types require a company email (`server/utils/freeEmailDomains.ts`); every lead is enriched from its domain (`server/utils/urlMeta.ts`, also exposed as `GET /api/url-meta` for favicons/link previews) and forwarded to n8n → Salesforce with an HMAC signature (`server/utils/n8n.ts`; workflow + setup in `integrations/n8n/`). Worked in `/admin → Leads`. Secrets: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` (unset ⇒ leads queue as `not_configured`).
- **Teams.** Self-serve seats (3–50, $180/seat/yr, Dodo test product, company-domain emails) on `/teams`; the buyer owns the team at `/team`, invites via copyable links (`app.team*`, migration `008`); `hasPro()` covers team members; Admins can also **grant** Pro to a company in `/admin → Teams` (migration `013`): seats, an end date, members by email (existing accounts join at once, others get invite links) and optional auto-join for verified addresses on the domain; granted and bought teams share the same `hasPro()` path. Enterprise and invoicing go through the sales form at `/teams#contact`.
- **Retired 2026-10-05**: `/jobs`, `/companies`, `/leaderboard`, `/ask`, `/training`, `/sales`, `/contact`, `/implementation` and the experts network (`/experts`, `/experts/join`). They 301 via `RETIRED` in `nuxt.config.ts`; do not reintroduce them. The `app.inquiry` table and migration `004` are read-only history (the inquiries API and admin tab were removed on 2026-10-05); `014_drop_experts.sql` undoes `011`, which was deleted with the network.
- **Pricing.** Free $0 · Pro Monthly $12 · Pro Annual $96 (featured) · Team Seat $180/yr · Enterprise custom. Old $9 monthly / $99 lifetime purchases stay honoured; lifetime is no longer sold. **Pro (and team) users see no ads** — PromoSlot renders nothing for them.
- **PWA.** `public/manifest.webmanifest` + icons + screenshots, offline fallback `public/offline.html`, service worker per `app/plugins/sw.client.ts`. Head links live in `nuxt.config.ts`.
- **Operator docs.** `/admin → Guide` (component `AdminGuide.vue`) is the end-to-end "how do I run this" manual; keep it truthful when workflows change.

## Environment variables

Local values live in a **gitignored `.env`** (`.env.example` documents the shape). Production secrets live on the Worker (`wrangler secret put`): Neon (`DATABASE_URL`, `NEON_AUTH_*`), admin (`ADMIN_EMAILS`, `GITHUB_CONTENT_TOKEN`), Studio OAuth, Dodo (above) and, once added, Mux signing keys.

## Conventions
- Links: use `useLocalePath()` / `localePath('/path')` for internal links (i18n prefixing). New user-facing strings go in `i18n/locales/en.json` **only** — `pnpm translate --only=ui` fills in the other 11 and preserves existing translations. `fallbackLocale` is `en` (`i18n/i18n.config.ts`), so a key missing from another locale shows English; only a key missing from `en.json` renders as the raw key. Private pages (`/team`, `/join`, `/sponsor/studio`, `/admin`) and the `ENGLISH_ONLY` pages (`/pricing`, `/teams`, `/nominate`) are English-only by design.
- JSON-LD `inLanguage`, the canonical link and `og:locale` are all derived from the active locale (`app/app.vue`). Don't hardcode `'en'` — every locale prerenders its own copy of each page.
- All data is either markdown frontmatter or a static array in the page that uses it (e.g. the curated list in `app/pages/resources.vue`).

## The project/ folder
`project/` holds Swarnil's local Salesforce project material (org metadata, dashboard JSON,
SAQL scratch files). It is **outside the build**: not in `content/`, not linked from any
page, so neither Nuxt Content nor the prerender crawler sees it. The repo is public — see
`project/README.md` for what must be sanitised before committing.

## Notes
- `README.md` is the low-level design (architecture, request flows, data model, API routes); `content-assets/` holds the reusable brand, background and video-editing assets.
- Memory note `project_crm_academy.md` describes project context — verify against the actual files before relying on it.
