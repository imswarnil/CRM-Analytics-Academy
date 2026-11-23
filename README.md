<p align="center"><img src="public/icon-512.png" alt="CRM Analytics Academy logo" width="88"></p>

<h1 align="center">CRM Analytics Academy</h1>

<p align="center">
  <strong>Build the dashboards your sales team opens every morning.</strong><br>
  Learn Salesforce CRM Analytics on real sales data, one short lesson at a time.
</p>

<p align="center">
  <a href="https://crmanalytics.imswarnil.com/course"><strong>Start here</strong></a> ·
  <a href="https://crmanalytics.imswarnil.com/certification"><strong>Practice exam</strong></a> ·
  <a href="https://crmanalytics.imswarnil.com/interview-questions"><strong>Interview Q&amp;A</strong></a> ·
  <a href="https://crmanalytics.imswarnil.com/pro"><strong>Pricing</strong></a> ·
  <a href="https://www.youtube.com/@crmanalyticsacademy"><strong>YouTube</strong></a>
</p>

<p align="center">
  <a href="https://github.com/imswarnil/CRM-Analytics-Academy/actions/workflows/deploy-cloudflare.yml"><img src="https://github.com/imswarnil/CRM-Analytics-Academy/actions/workflows/deploy-cloudflare.yml/badge.svg" alt="Deploy"></a>
  <img src="https://img.shields.io/badge/sections-7-0176D3?labelColor=032D60" alt="7 sections">
  <img src="https://img.shields.io/badge/languages-7-0176D3?labelColor=032D60" alt="7 languages">
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&labelColor=032D60" alt="Nuxt 4">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-032D60" alt="MIT"></a>
</p>

---

## What you will be able to do

| After | You can |
| --- | --- |
| **1 · Foundations** | Read the Salesforce data CRM Analytics uses, and run your own free org |
| **2 · Data Prep** | Build datasets you can trust: recipes, every join type, grain, transpose, snapshots, row-level security |
| **3 · Visualization** | Turn a dataset into charts and dashboards people read in seconds |
| **4 · SAQL** | Write the query language behind every widget, from load to windowing and time series |
| **5 · Interactions and Bindings** | Make dashboards respond to every click: faceting, selection and results bindings, dashboard JSON |
| **6 · Sharing and Embedding** | Share securely, embed in Lightning, Experience Cloud and Slack, deploy and keep it fast |
| **7 · Einstein Discovery** | Predict outcomes, read a model honestly, and put predictions on Salesforce records |

Every lesson is the same four steps: **watch** a short video, **follow** a worked example, **check** yourself
with a quiz, **keep** the one-page notes. The course is published section by section; `/course` ("Start here")
shows what is live and what is coming, and every lesson is at `/course/<section>/<lesson>`.

## What is on the site

| | |
| --- | --- |
| **Course** (`/course`, "Start here") | 7 sections in order, progress for signed-in learners, one next step. Lessons at `/course/<section>/<lesson>` |
| **Practice exam** (`/certification`) | 60 questions, 105 minutes, the real exam's domain weights, a certificate when you pass |
| **Interview Q&A** (`/interview-questions`) | Real questions with model answers, by section, type, level and company |
| **Notes** (`/notes`) | One handwritten-style sheet per finished section; PDF and Markdown |
| **Jobs** (`/jobs`) | New CRM Analytics roles, grouped by day |
| **Resources, datasets, companies** | Curated links, sample datasets, companies with a public CRM Analytics source |

Seven languages: English, Spanish, German, Portuguese, French, Japanese and Hindi.

## Plans

| Plan | Price | What you get |
| --- | --- | --- |
| Free | $0 | Every free lesson, the practice exam, interview Q&A, progress and streaks. With ads |
| Pro Monthly | $19 / month | Every lesson and dataset, full exam review, downloads, no ads |
| Pro Yearly | $119 / year | The same, for about $9.92 a month |
| Pro Lifetime | $249 once | The same, forever, including future lessons |
| Teams & institutions | Custom | Pro seats for companies, colleges and teams, with a join code |

Prices live in one file, [`shared/utils/products.ts`](shared/utils/products.ts); `pnpm stripe:setup` mirrors them in Stripe.

## How it is built

```
content/en/**.md ──► pnpm translate (local LibreTranslate) ──► content/{es,de,pt,fr,ja,hi}
        │
        ▼
Nuxt 4 + Nuxt Content 3 ──► prerendered HTML per locale ──► Cloudflare Workers (static assets)
                                                              │
                     a small Worker for /api/** ◄─────────────┘
                     Neon Postgres + Neon Auth · Stripe · Web-to-Lead into Salesforce
```

- **Static first.** Every course page is prerendered. The Worker only answers `/api/**`, sign-in and private pages, so
  a visitor reading a lesson costs no server work.
- **URLs do not break.** Lessons moved under `/course/<section>/` on 2026-11-23; every older lesson and section URL,
  `/start` and `/curriculum` 301 to the new ones in every language (the map is
  [`shared/utils/coursePaths.ts`](shared/utils/coursePaths.ts), read by `nuxt.config.ts`).
- **English is the only source.** The other six languages are generated by `pnpm translate` and committed. Never edit a translation by hand.
- **Pro lessons are gated at build time.** `scripts/gate-content.mjs` moves a Pro body into the Worker bundle;
  `scripts/verify-gating.mjs` fails the build if any of it is public.
- **No tracking cookies.** Traffic is Cloudflare Web Analytics; the app records only milestones (sign-up, lesson complete, exam finished, checkout).
- **GTM, first-party.** Sign-ups, requests, checkouts and milestones are enriched after the response (`waitUntil`) into `app.enrichment` (geo and AS organisation from Cloudflare, never the IP; email domain kind; the company's own home page cached in `app.company_domain`; product signals) and scored 0–100 with every reason. Leads reach Salesforce by Web-to-Lead with the score; active learners, team orgs and seats are upserted hourly by external ID (`app.sf_sync` keeps a payload hash so only changes are sent; `app.sf_sync_run` logs each run). Admin: `GET /api/admin/leads?view=requests|accounts`, `GET`/`POST /api/admin/salesforce` (status / sync now). `pnpm gtm:check` tests it all against fixtures and mocked Salesforce.
- **Security:** CSRF origin check, rate limits, a proof-of-work captcha, escaped JSON-LD, security headers in `nuxt.config.ts` and `public/_headers`.

| Layer | Choice |
| --- | --- |
| Framework | Nuxt 4, Nuxt Content 3, Nuxt UI v4, Tailwind CSS 4 |
| Hosting | Cloudflare Workers, deployed by GitHub Actions on every push to `main` |
| Data | Neon Postgres (schema `app`, [`server/db/schema.sql`](server/db/schema.sql)), Neon Auth |
| Payments | Stripe over `fetch` (subscriptions, one-off, customer portal, webhook) |
| CRM | Salesforce Web-to-Lead for leads (no credentials) + an hourly account sync over the REST API (OAuth client credentials, optional); org metadata in [`salesforce/crm/`](salesforce/crm/) |
| GTM | First-party enrichment and a transparent lead score (`server/utils/enrich.ts`, `score.ts`): Cloudflare geo + network, email domain, company home page, product signals. No IP stored, no data brokers |
| Search, LLMs | ⌘K search index, `llms.txt`, `llms-full.txt`, raw markdown, a read-only MCP server at `/mcp` |

## Run it locally

Node 22+, [pnpm](https://pnpm.io), and Python 3.11 via [`uv`](https://docs.astral.sh/uv/) for translation.

```bash
pnpm install
cp .env.example .env        # optional: Neon values turn on accounts; without them the course still renders
pnpm dev                    # http://localhost:3000
```

| Command | Does |
| --- | --- |
| `pnpm new-lesson` | Scaffold a lesson with full frontmatter |
| `pnpm lesson:check` | Numbering, frontmatter, quiz answers, internal links |
| `pnpm translate` | Translate changed English into the other six languages (`pnpm translate:setup` once) |
| `pnpm gtm:check` | Score, enrichment parsing, Web-to-Lead and the Salesforce sync against fixtures (no network) |
| `pnpm lint` · `pnpm typecheck` | The checks to run before every commit |
| `pnpm build` | Translate, build the search and LLM indexes, prerender, verify gating |
| `pnpm preview` | Run the production Worker bundle locally |

## Repository map

| Path | What |
| --- | --- |
| `content/en/` | Lessons (`course/<NN.section>/`), interview questions, exam questions, notes. The only place course text is written |
| `app/pages/`, `app/components/` | The site |
| `server/api/`, `server/utils/`, `server/db/` | The Worker: accounts, progress, billing, leads, admin |
| `shared/utils/products.ts` | Plans and prices |
| `i18n/locales/en.json` | Every UI string (the other locales are generated) |
| `scripts/` | Build steps: translation, search index, gating, Stripe setup |
| `salesforce/` | The learning org's SFDX project and the Academy CRM (`crm/`) |
| `studio/` | Video production: the After Effects motion kit, film builder, Premiere templates and sequences (see `studio/README.md`) |

## Publishing a lesson

1. Write or edit `content/en/course/<NN.section>/<NN.lesson>.md` (or use Nuxt Studio at `/_studio`). It renders at
   `/course/<section>/<lesson>`; link other lessons by that full path.
2. `pnpm build` translates it and checks everything.
3. Commit and push. GitHub Actions deploys to Cloudflare.

## Why I made this

I have spent seven years building CRM Analytics dashboards for sales, marketing and RevOps teams. Most of what
made them work (the data model under them, the metric definitions people argued about, the reasons a dashboard
got opened every Monday or never at all) is not in any official course. This is the course I wish I had had. — Swarnil

## Contributing

Fix a typo with **Edit this page** on any lesson, suggest a resource at
[/submit](https://crmanalytics.imswarnil.com/submit), or read [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
the lesson format and pull requests. Star the repo if it helped you.

CRM Analytics Academy is independent and not affiliated with Salesforce, Inc.

## License

[MIT](./LICENSE)
