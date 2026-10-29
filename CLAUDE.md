# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**CRM Analytics Academy** — a free, open-source learning site for Salesforce CRM Analytics (data prep, SAQL, dashboards, bindings, Einstein Discovery, GTM dashboards). Live at **crmanalytics.imswarnil.com**, hosted on **Cloudflare Workers** (prerendered pages served as static assets, a small Worker for the dynamic routes) and deployed by GitHub Actions (`deploy-cloudflare.yml`). GitHub: **imswarnil/CRM-Analytics-Academy**.

Built on **Nuxt 4 + Nuxt Content 3 + Nuxt UI v4 + Tailwind CSS 4**, styled in the Blueprint design system. It is a **markdown-driven site**: every docs page is prerendered at build time from `content/`. On top sits a small dynamic layer — **Neon Postgres + Neon Auth (better-auth)** — for accounts, the learner dashboard (progress, streaks, bookmarks, quizzes, badges, leaderboard), comments, community submissions, first-party analytics and the admin console. Server code is in `server/api/**` and `server/utils/**`; the whole schema is `server/db/schema.sql`.

**Free to read, funded by AdSense — plus Pro (since 2026-10-29).** Most lessons are free and ad-supported; **signed-in members see no promos at all** (`usePromoFree`, and an inline head script pauses AdSense Auto ads for them). Lessons marked `access: pro` are for Pro members. There is still **no payment processor**: `/pro` lists the products (`shared/utils/products.ts`), and "Get it" files a lead (`POST /api/leads` → `app.lead` + a Salesforce Lead by Web-to-Lead); Swarnil follows up and grants Pro in /admin → Users. Removed on 2026-10-22 and not coming back: Dodo payments, teams-as-a-product, sponsors, n8n, Payload, Mux. The course is **published section by section**: only `00.introduction` has lessons; sections 01–18 are one `comingSoon: true` page each, with a "Notify me" waitlist (`app.waitlist`, signed-in only). YouTube channel: `SITE.youtube` = https://www.youtube.com/@crmanalyticsacademy.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@11.9.0`). Do **not** use npm.

```bash
pnpm install          # deps (runs `nuxt prepare` via postinstall)
pnpm dev              # dev server → http://localhost:3000
pnpm build            # scripts/prebuild.mjs (translate locally → lesson meta → search/llms/raw) → nuxt build
pnpm preview          # build, then run the Worker bundle locally with wrangler dev
pnpm translate        # translate changed English via the local LibreTranslate (see below)
pnpm translate:setup  # once: install LibreTranslate + models into .libretranslate/
pnpm fcp <route>      # Final Cut Pro project + recording script for a lesson (content-creation/README.md)
pnpm lint             # eslint .   (run after editing)
pnpm typecheck        # nuxt typecheck (vue-tsc)  (run after editing)
```

There is **no test runner** — `lint` and `typecheck` are the only verification steps. For anything with runtime behaviour, also do a `pnpm build` (`SKIP_TRANSLATE=1 pnpm build` skips translation).

### ⚠️ Dev-server content database (common gotcha)
`@nuxt/content` (native SQLite connector) stores a dev DB at `.data/content/contents.sqlite`. It **frequently goes stale/corrupt** across restarts, producing `no such table: _content_docs` and an empty docs sidebar. Fix: `pkill -f "nuxt dev"; rm -rf .data && pnpm dev` (the `dev-reset` skill). New Tailwind arbitrary classes sometimes need a dev restart too.

### ⚠️ Build traps (each one took the deploy down once)
- **`h3` must be 1.x everywhere.** `h3` is a direct dependency and aliased in `nuxt.config.ts` (`alias.h3`) because modules that import it without declaring it get whatever pnpm hoists.
- **Prerender memory.** `server/plugins/devtools-plugin-leak.ts` empties `__VUE_DEVTOOLS_PLUGINS__` after each response. Redirect sources and double-locale paths are in `nitro.prerender.ignore`. `/raw/**/*.md`, `llms.txt` and `llms-full.txt` are written as static files by `scripts/build-search-index.mjs`, never prerendered.
- **Translated UI strings are validated.** `translate.mjs` refuses a message that does not compile, adds `<`, `@`, `|` or `$`, or changes `{placeholders}`. Keep symbols out of translatable strings.

### Lint style (enforced)
`@nuxt/eslint` stylistic rules: **no comma-dangle**, **1tbs**, 2-space indent. TS interfaces: **one member per line, no delimiter**. `pnpm lint --fix` handles most issues.

## Architecture

### Content pipeline
- `content/<locale>/<NN.module>/<NN.lesson>.md` — numeric prefixes are **always two digits** (they sort as strings). `.navigation.yml` per dir sets `title`/`icon`. 12 locales: `en` (default, unprefixed) + `es fr de pt ja zh hi ar ru bn ur`; `ar`, `ur` are RTL. **Only `content/en/` is written by hand.** Renaming a file means renaming it in every locale and remapping its `<locale>:<path>` keys in `.translation-manifest.json`.
- `content.config.ts` — collections `docs`, `resources`, `people`. `comingSoon: true` marks a section placeholder: it stays in the sidebar, curriculum and llms.txt, but `useCourse()` leaves it out of the course order and progress, and the lesson page hides mark-complete and the timeline. Publishing a section = add its lessons and delete `comingSoon` from its index. Lesson frontmatter: `title`, `description`, `links[]`, `video` (`{ id, start?, end?, title?, author?, authorUrl? }` — a **YouTube** id on the English lesson; translations borrow it), `walkthrough` (recording script), `interview[]`, `quiz[]`, `authors[]`, `credits[]`.
- `app/pages/[...slug].vue` renders any lesson (player chrome, YouTube video, walkthrough, body, quiz, interview, credits, comments, Save-for-later) and falls back to English when a locale is untranslated.
- `app/data/lesson-meta.json` (minutes / video-or-article / quiz per route) is generated by `scripts/lesson-meta.mjs` (run by `pnpm build`) and read via `useLessonMeta()`.
- **Editing**: **Nuxt Studio** at `/_studio` (GitHub OAuth app; secrets `STUDIO_GITHUB_CLIENT_ID/SECRET`) commits markdown to `main`. There is no other CMS and no in-app content editor.
- **People and credits**: `content/people/<slug>.yml`; lesson `authors` (default `swarnil-singhai`) and `credits` on the English file only (`useLessonCredits`). Everyone appears on `/instructors`. The author portrait is `public/people/swarnil-singhai.jpg` (`AUTHOR.avatar` in `app/data/author.ts`).
- New pages must be link-reachable from `/` to be prerendered (`crawlLinks`).

### Static-first constraints
- Curriculum pages stay prerendered and must not gain fetches that can't run at build time. Dynamic behaviour belongs on `/dashboard`, `/submit`, `/admin`, `/api/**` (`PRIVATE_PATHS` in `nuxt.config.ts`, never prerendered).
- `nitro.preset: 'cloudflare_module'`; `wrangler.jsonc` serves `.output/public`; only misses reach the Worker. Auth is resolved server-side per request (`server/utils/auth.ts`).
- ⚠️ **The Worker has no content database.** Any `queryCollection*` that runs on the Worker fails and logs one error *per content row* — that once used 90% of the daily Workers Logs allowance. Content queries are guarded with `import.meta.server && !import.meta.prerender && !import.meta.dev` (app.vue, error.vue, `[...slug].vue`, `interview-questions/[slug].vue`): unknown lesson/question URLs answer 404 before querying. Keep that guard on any new content page. Workers Logs is sampled at 10% (`head_sampling_rate` in `wrangler.jsonc`).
- **Keep Worker work small.** The session is only fetched when the `crma_signed_in` hint cookie exists (`useAuth().restoreSession()`), so anonymous visitors and crawlers cost no `/api/auth/get-session`; private pages still check every time via the `auth` middleware.

### LLM surface
- `scripts/build-search-index.mjs` writes `public/llms.txt` (what the course is, how to take it, every section and lesson **in learning order** with raw links), `public/llms-full.txt` (that plus every lesson's markdown, in order), `public/<locale>/llms.txt`, `public/raw/**` and the ⌘K search + MCP indexes. Sections come from the folder order — nothing to register.
- `server/routes/mcp.{get,post}.ts` — read-only MCP at `/mcp` over `public/ask-index.json`.

### Translation (local LibreTranslate)
English is the source of truth; the other 11 locales are generated **on this machine** and committed.
- `scripts/libretranslate.sh` — installs LibreTranslate (Python 3.11 via `uv`) and its models into `.libretranslate/` (gitignored), and `run`s a command with the server on 127.0.0.1:5055, stopping it afterwards.
- `pnpm translate` = `libretranslate.sh run -- node scripts/translate.mjs`; `pnpm build` calls it first unless `CI` or `SKIP_TRANSLATE` is set. CI never translates.
- `scripts/translate.mjs` (driver, incremental), `scripts/markdown-protect.mjs` (**read its header before touching it**), `scripts/i18n.config.mjs` (locale map: `zh-Hans`, `pt`), `.translation-manifest.json` (hashes of the English source).
- **Never hand-edit a translation.** Everything not English comes from LibreTranslate; fix the English source and re-run. `options` lists (quiz/exam answers) are translated too.

### Interview questions, practice exams, companies (2026-10-28)
- **Interview Q&A are content**: `content/<locale>/interview-questions/<slug>.md` (collection `interview`; frontmatter `title` = the question, `description`, `type`, `topic` = section slug, `level`, optional `company`/`role`, `source`). The body is the model answer. English is written; the build translates. `/interview-questions` groups by course section (in course order) with type/level/company filters; `[slug].vue` has QAPage JSON-LD. Upvotes are `app.interview_upvote` (by slug), counts via cached `GET /api/interview/votes`.
- Community questions are submitted at `/interview-questions/new` → `app.interview_question` (pending) → approved in /admin → `scripts/pull-interview.mjs` (run by `prebuild` locally) writes them as English files → translated → pushed.
- **Exams**: `content/<locale>/exam/<domain>.md` (collection `exam`, a `quiz[]` of `{ id, q, options, answer, topic }` per domain; `options` is translated). `build-search-index.mjs` writes `public/exam/<locale>.json` (gitignored), which `certification/[paper].vue` fetches. Paper rules live in `app/utils/exam.ts`. While a paper runs the page is in **focus mode** (`useState('exam-focus')`): no header, footer, promos or pop-ups; full-screen when allowed; leaving asks first.
- **Companies**: `app/data/companies.json` — only companies with a public source that names CRM Analytics/Tableau CRM/Einstein Analytics (customer story, case study, partner page, job post). Never add one without a source. Suggestions arrive as `/submit?type=company` (kind `resource`, `details.type = company`).

### Pro lessons, products and leads
- **Gating**: `access: pro` on the ENGLISH lesson (translations follow). `scripts/gate-content.mjs` (run by prebuild, CI too) moves each Pro body into `server/assets/gated/<locale>/<route>.json` (bundled into the Worker only) and swaps a teaser stub into the content collection (`.gated-stubs/`, `.gated-files.json` — all gitignored). `GET /api/lesson/<locale>/<route>` returns the body after `hasPro()` (`server/utils/entitlement.ts`, `app.entitlement`). The lesson page shows the teaser + `CourseProLockedCard`, or the member's full lesson via `<MDC>`. The search index, `/raw/*.md` and llms-full read the stubs. **`pnpm build` ends with `scripts/verify-gating.mjs`, which fails the build if any Pro passage is public** (it decodes the content dumps too).
- **Products** (`shared/utils/products.ts`): Pro, bootcamp, interview prep, mentoring, dashboard review, team training, consulting. Copy is i18n (`products.<id>.*`). `needsAccount` products require sign-in to request.
- **Salesforce**: `server/utils/salesforce.ts` posts each lead to Web-to-Lead for org `00Dg500000KBfkHEAT` — no credentials, no API user, nothing that can lock a Salesforce user. Custom Lead fields (product, lessons, points, source, landing, locale, user id, team size) are mapped by 15-char field id in `LEAD_FIELDS` once deployed from `salesforce/academy/`. `app.lead.sf_status` records each send. ⚠️ The org was frozen once: never script logins or bulk API calls against it.
- **Admin**: Leads tab (pipeline at list price, move new → contacted → won/lost), Pro grant/revoke per user, monetization tiles on Overview.

### Bot protection and security
- **Headers**: `SECURITY_HEADERS` in `nuxt.config.ts` (Worker responses) and `public/_headers` (static files) — HSTS, nosniff, SAMEORIGIN, a narrow CSP (`frame-ancestors`, `object-src`, `base-uri`, `form-action`; no script allow-list because AdSense needs many Google hosts). Keep the two in step.
- **CSRF**: `server/middleware/origin-check.ts` refuses state-changing `/api` requests from another origin.
- **XSS**: `useJsonLd` escapes `<`, `>`, `&` in JSON-LD; unreviewed community text is never rendered as markdown in /admin; `pull-interview.mjs` neutralises HTML and script links before community answers become pages.
- **Admin** is pinned to one account id *and* email (`server/utils/admin.ts`).
- **Dependencies**: runtime security fixes are pinned in `pnpm-workspace.yaml` `overrides` (same major only).
- `server/utils/guard.ts`: honeypot (`website` field), per-action rate limit keyed by a SHA-256 of action + client address (`app.rate_hit`, no addresses stored), and **the site's own captcha** — a proof-of-work challenge (`server/utils/pow.ts`, `GET /api/challenge`) that `<HumanCheck>` solves silently in the browser; each solution is single-use (`app.used_challenge`). No third-party captcha. The HMAC key is `CAPTCHA_SECRET` or, unset, derived from `DATABASE_URL`. Required on sign-in, sign-up, newsletter and lead forms.

### Accounts, dashboard, analytics, admin
- **Schema**: `server/db/schema.sql` (idempotent: `progress`, `quiz_attempt`, `bookmark`, `comment`, `submission`, `demo_account`, `page_view`, `event`, view `user_points`). Apply with `psql "$DATABASE_URL" -f server/db/schema.sql`. `cleanup-2026-10-22.sql` was the one-off drop of the retired tables. Neon Auth's `neon_auth."user"` uses camelCase columns (`"createdAt"`, `"emailVerified"`).
- **Dashboard** (`app/pages/dashboard.vue`) reads one request, `GET /api/progress` (completions, bookmarks, best quizzes, activity days → streak, points/rank, top-5 leaderboard), shared through `useProgress()`. The weekly goal is per-browser (localStorage); badges are computed client-side.
- **Analytics**: `app/plugins/analytics.client.ts` beacons page views, visible time on page and clicks on any `/sign-in` or `/sign-up` link to `POST /api/collect`; `useNuxtApp().$track(name, label)` records milestones (`sign_up`, `sign_in`, `lesson_complete`, `quiz_submit`, `bookmark`, …; allow-list in `collect.post.ts`). Our analytics sets no cookies and stores no IPs; bots are dropped. No Google Analytics or Clarity.
- **Conversion**: /admin → Analytics shows a per-visitor funnel (visitors → engaged → sign-up click → signed up → learning action) and sign-up rate by source and by landing page. A `?utm_source=` on any link overrides the referrer (stored as `utm:<source>`); ShareBar tags its links `utm_source=<network>&utm_medium=share`.
- **Admin**: `/admin` (Overview · Analytics · Users · Submissions · Interview Q&A · Comments; sidebar with pending counts, keys 1–6, links to Cloudflare/Neon/AdSense/Search Console/YouTube/Actions) for **one account only**: `ADMIN_EMAIL = 'imswarnil@gmail.com'` in `server/utils/admin.ts` (`requireAdmin` → 404 for anyone else). No roles table.
- Comments: one level of replies, keyed by locale-stripped path. Submissions: images to R2 (`MEDIA` binding), reviewed in `/admin`.

### Community, reach and sharing (2026-10-26)
- **Language by country**: `shared/utils/regions.ts` holds `COUNTRY_LOCALE` (country → site language; IN/PK/PH/US/UK deliberately unmapped = English) and `COUNTRY_REGION` / `REGIONS`. `locale-auto.client.ts` lets the country decide first, then the browser language; a switcher choice always wins.
- **Regional leaderboard**: `GET /api/leaderboard?scope=global|region|country` — a learner's country is where they most often read from (`app.page_view`). Dashboard tabs.
- **Project, live**: `GET /api/stats` (public aggregates, cached 10 min) → `HomeReachSection` (learners, completions, readers, countries, readers ranked by region).
- **Wall of Fame**: curated `app/data/wall-of-fame.ts` + approved `nomination` submissions (`GET /api/wall`), merged client-side by `useWall()`; on the home page (`HomeWallSection`) and `/wall-of-fame`. Nominations come through `/submit?type=nominate` (`NOMINATE_PATH`) and are approved in /admin → Submissions.
- **Sharing**: `ShareBar` (LinkedIn, X, WhatsApp, native, copy) on lessons and the wall; "Share my progress" on the dashboard. Shared links carry `utm_source=<network>&utm_medium=share`; clicks are `share` events.

### Theming & branding — "Blueprint"
Engineering-drawing language: paper/ink, graph paper, crosshair crop marks, rulers, hard offset shadows, square corners, mono eyebrows ("FIG. 01 —", "SHEET 02 /"). Keep new UI in that language.
- `app/assets/css/main.css` — tokens (`--paper`, `--card`, `--ink`, `--ink2`, `--line`, `--navy`, `--signal`, `--tide`, `--frost`, `--ice`, `--glow`; dark in `.dark`) and utilities (`graph-paper*`, `hatch`, `ruler`, `eyebrow`, `mono-label`, `crosshair`, `bp-h1/h2/h3`, `bp-lead`, `bp-prose`, `bp-card`). Colour by token, never by hex. `tokens/tokens.json` mirrors these for non-web tools — change both.
- `app/app.config.ts` — Nuxt UI overrides. `app/components/bp/*` — drawing primitives.
- The header is compact (icon-only search, YouTube, GitHub) and uses the same `--ui-container` width on every page, including the lesson player.
- ⚠️ Tailwind's scanner skips `[...slug].vue`; `main.css` names those files in `@source` lines — keep them.

### Advertising (Google AdSense)
- `nuxt.config.ts` loads `adsbygoogle.js` once (client `ca-pub-1291242080282540`) and sets the `google-adsense-account` meta; `public/ads.txt` is published.
- The inventory (slot ids, sizes, formats) is `PROMO_UNITS` in `app/utils/promo.ts`. Every unit is `<PromoSlot unit="…">` (`app/components/PromoSlot.global.vue`): Blueprint frame, reserved min-height, a fresh `<ins>` pushed on mount — pages remount on navigation, persistent layouts key it by `route.path`. In dev it shows a placeholder and requests nothing.
- Placements: in-article units spliced into lesson bodies (`withInArticlePromos`), a 160×600 under the lesson TOC, 300×250 at the foot of `BpCourseContents`, a multiplex after each lesson, a leaderboard at the bottom of content pages, and `PromoFloat` (closable bottom leaderboard, closed for the session). `promoAllowed()` excludes `/admin`, `/sign-in`, `/sign-up`, `/submit`.
- `ChannelPopup` is a timed YouTube subscribe card (45 s into a first session, then not for 30 days). **Never put an AdSense unit in a pop-up/modal** — AdSense policy forbids it; Vignette ads (AdSense Auto ads) are the compliant interstitial.
- **Never name files, components or CSS classes with "ad"/"adsense"** (filter lists block matching module URLs and the page fails to render) — that is why it is `promo`.

### Video (Final Cut Pro)
`content-creation/` (was `fcp/`) holds the Pixelmator thumbnail templates (`content-creation/thumbnails`, `pnpm thumb`), the CRMA template kit (`content-creation/kit`, install with `Install.command`), the scripts that build it (`content-creation/source`), and `content-creation/lesson.mjs` (`pnpm fcp <route>` → FCPXML 1.11 + a recording script from the lesson's walkthrough/quiz). Export → YouTube → `video: { id }` on the English lesson. Generated projects and media are gitignored. Read `content-creation/README.md`.
Recorded lessons (face + screen) use `pnpm obs:install` (OBS profile + scene collection "CRMA Recording": Title/Camera/Screen/Screen + Camera scenes in the Blueprint design built from native Color/Text sources and nested "CRMA ◆" component scenes, shared lesson texts edited in OBS, CRMA transitions; records into `content-creation/sessions/inbox/`), then `pnpm session new|import|build <slug>` (`content-creation/session.mjs`): takes sorted into camera/screen by face detection, an editable `session.yml` timeline, and an FCPXML with jump cuts, step bars, chapters and music ducked under speech. `lesson.mjs` and `session.mjs` share `fcp-shared.mjs`. `content-creation/sessions/` and `content-creation/music/` are gitignored.

## Environment variables

Local values in a **gitignored `.env`** (`.env.example` documents the shape). Production secrets live on the Worker (`wrangler secret put`): `DATABASE_URL`, `NEON_AUTH_*`, `DEMO_USER_*`, `STUDIO_GITHUB_*`, optional `CAPTCHA_SECRET`, optional `NEWSLETTER_GHOST_URL`.

## Conventions
- Internal links: `useLocalePath()` / `localePath('/path')`. New user-facing strings go in `i18n/locales/en.json` **only**; `pnpm translate` fills the other 11 (`fallbackLocale` is `en`). `/admin` is English-only and not translated.
- JSON-LD `inLanguage`, canonical and `og:locale` derive from the active locale — never hardcode `'en'`.
- The repo is public: never commit `.env`, `.libretranslate/`, `linkedin/`, Salesforce auth (`.sf/`, `.sfdx/`), or `content-creation/projects/*/media`.

## The salesforce/ folder
`salesforce/` is the SFDX project for the learning org, and **all** of Swarnil's Salesforce
project material lives there: retrieved metadata (`force-app/`), Apex and SOQL scratch
(`scripts/`), sample data (`data/`). It is outside the site build — not in `content/`,
not linked from any page. Its CLI target is set in the gitignored `salesforce/.sf/config.json`
to alias `crma-learning` (`admin@crmanalyticsacademy.com`, `00Dg500000KBfkHEAT`).
The `org:pull` / `org:open` shortcuts were removed on 2026-10-28 while the org is frozen — run `sf` from `salesforce/` by hand only when Swarnil asks.
`force-app/main/default/wave/` is gitignored (the org ships Salesforce sample dashboards);
move your own builds into `salesforce/academy/` to commit them. The repo is public — see `salesforce/README.md`
for what must never be committed.
Learners never share this org: `salesforce/scripts/academy-setup.mjs` (zero-dependency, every
call goes through `sf api request rest`) sets up *their own* org — permission sets, the
`Academy_Analytics` app from `salesforce/academy/`, and the 21 CSVs as `academy_*` datasets.
The learning org has null measure handling off, so eight blank numeric columns load as 0 there.

## Notes
- `README.md` is the overview and low-level design (data model, API, publishing).
- `linkedin/` (launch kit) is local only.
