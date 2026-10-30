# Curriculum plan — CRM Analytics from scratch, with the data engineering under it

The plan for the 18 sections still marked `comingSoon`. Each section lists its
lessons in learning order, the concepts and functions it must cover, the data
engineering idea underneath, what is **Free** and what is **Pro**
(`access: pro`), and the visualiser that demonstrates it. Publishing a section
means writing these lessons in `content/en/<NN.section>/` (`pnpm new-lesson`)
and deleting `comingSoon` from its index.

**Free / Pro rule of thumb.** The concept, the first build and the quiz are
free — anyone can learn CRM Analytics here. Pro is the *depth*: the second and
third build, the edge cases, the downloadable recipe or dashboard, and the
interview walk-through. Roughly one lesson in three is Pro.

**Three learning paths over the same sections** (in `llms.txt` now; to be drawn on `/curriculum`):

| Path | For | Sections, in order |
| --- | --- | --- |
| **From scratch** | Never opened Analytics Studio | 00 → 01 → 02 → 03 → 04 → 05 → 06 → 08 → 07 |
| **Data engineer** | Comes from SQL / dbt / ETL | 00 → 03 → 04 → 07 → 02 → 13 → 11 |
| **AI with CRM Analytics** | Wants predictions and assistants | 00 → 01 → 04 → 14 → 07 (AI-written SAQL) → 13 |

---

## 00 · Introduction — published

Already live: what the course teaches, who it is for, how it works, what you
will build, setting up your org, a tour of Analytics Studio, how to study, FAQ.
Add one lesson: **How to learn this with AI** (free) — using an assistant to
explain a SAQL error, why you still check every number, and the llms.txt /
MCP endpoints this site publishes for exactly that.

## 01 · CRM Analytics Basics

| # | Lesson | Access |
| --- | --- | --- |
| 01 | What CRM Analytics is (and is not): a materialised, indexed engine inside Salesforce's security model | Free |
| 02 | Apps, datasets, lenses, dashboards, recipes, dataflows — the nouns, and how they connect | Free |
| 03 | How a query runs: from widget to SAQL to the indexed dataset | Free · **SAQL visualiser** |
| 04 | Licences and editions: CRM Analytics Growth / Plus, what each unlocks | Free |
| 05 | Reports vs CRM Analytics vs Tableau — choosing the tool | Pro |

**Data engineering idea:** OLTP vs OLAP — why a separate, denormalised, read-optimised store exists at all.

## 02 · Setup, Profiles & Security

| # | Lesson | Access |
| --- | --- | --- |
| 01 | Enabling CRM Analytics; the Integration User and the Security User | Free |
| 02 | Permission sets: Plus Admin, Plus User, and least privilege | Free |
| 03 | App sharing: Viewer, Editor, Manager | Free |
| 04 | Row-level security: security predicates, written and tested | Free · **Dataflow visualiser** (predicate) |
| 05 | Sharing inheritance: when it works, the 3,000-record limit, and the backup predicate | Pro |
| 06 | Role hierarchy predicates with `flatten` — managers see their team | Pro · **Dataflow visualiser** (flatten) |
| 07 | Testing a security model before release | Pro |

**Data engineering idea:** access control as data — security is a column you compute, not a setting you toggle.

## 03 · Data Preparation

| # | Lesson | Access |
| --- | --- | --- |
| 01 | The four ways data becomes a dataset: upload, sync + recipe, dataflow, connectors | Free |
| 02 | Data Sync: local and remote connections, objects and fields, schedules | Free |
| 03 | Your first recipe: input, filter, output | Free · **Recipe visualiser** |
| 04 | Joins in recipes: lookup, left, right, inner, full outer — and the row count after each | Free · **Recipe visualiser** (join types) |
| 05 | Formula functions: text, number, logic, null handling (`coalesce`, `case`) | Free · **Recipe visualiser** (catalogue) |
| 06 | Date functions: `to_date`, `year/quarter/month/day`, `date_trunc`, `add_months`, `datediff`, `last_day`, week and fiscal periods | Free · **Recipe visualiser** (dates preset) |
| 07 | Window (multi-row) functions: running totals, `rank`, `lag`, share of partition | Pro · **Recipe visualiser** (window preset) |
| 08 | Append, aggregate and the grain change | Pro · **Recipe visualiser** (append preset) |
| 09 | Transformations: bucket, split, flatten, detect sentiment, predict (Einstein) | Pro |
| 10 | Dataflows: JSON, `sfdcDigest`, `augment`, `computeExpression`, `computeRelative` — and why recipes replaced them | Free · **Dataflow visualiser** |
| 11 | Order of execution in recipes and dataflows; scheduling and dependencies | Pro · **Recipe + Dataflow visualisers** |
| 12 | Debugging a recipe that produces a wrong number | Pro |

**Data engineering ideas:** ETL vs ELT; join cardinality and fan-out; idempotent
runs; incremental vs full refresh; sync narrow vs sync wide; data quality checks
as steps.

## 04 · Datasets & Modelling

| # | Lesson | Access |
| --- | --- | --- |
| 01 | Grain: what one row represents, and why it decides everything | Free |
| 02 | Dimensions, measures, dates — and the XMD that describes them | Free |
| 03 | Wide vs long; one big table vs several datasets | Free |
| 04 | Snapshots and history: daily pipeline snapshots, SCD type 2 in a recipe | Pro |
| 05 | Multi-value fields, null measure handling, and the eight blank columns | Pro |
| 06 | Dataset performance: field count, cardinality, row limits | Pro |

**Data engineering ideas:** dimensional modelling (facts, dimensions, star schema), slowly changing dimensions, surrogate keys.

## 05 · Data Visualization

Chart choice, colour, axes, tables vs charts, the dishonest chart, small
multiples, the number on the screen. Free: 01–04. Pro: the chart review
checklist and the redesign exercise.

## 06 · Lenses & Exploration

The explorer, table mode first, compare tables, saving a lens. Free throughout;
one Pro lesson on exploration as a debugging method.

## 07 · SAQL

| # | Lesson | Access |
| --- | --- | --- |
| 01 | Streams: `load`, `filter`, `foreach` — and why statement order is the plan | Free · **SAQL visualiser** |
| 02 | `group` and aggregates: `count`, `sum`, `avg`, `min`, `max`, `unique` | Free · **SAQL visualiser** (pipeline by stage) |
| 03 | Filtering after aggregation — SAQL's HAVING | Free · **SAQL visualiser** (filter after foreach) |
| 04 | `cogroup`: inner, left, right, full — joining datasets in a query | Free · **SAQL visualiser** (cogroup) |
| 05 | `order`, `limit`, top N, and why limit without order is undefined | Free · **SAQL visualiser** (top 3) |
| 06 | Date functions in SAQL: `toDate`, `date_diff`, `now()`, relative date filters | Pro |
| 07 | Windowing: `sum(...) over ([..] partition by ... order by ...)`, running totals, rank | Pro |
| 08 | `fill`, timeseries, and gaps in a date axis | Pro |
| 09 | `union`, `case`, string functions, `coalesce` | Pro |
| 10 | Compare tables vs hand-written SAQL — when to switch | Pro |
| 11 | Writing SAQL with an AI assistant — prompting, checking, and the four mistakes it makes | Pro (AI path) |

**Data engineering idea:** a query plan as a pipeline of transformations.

## 08 · Dashboard Design & UI

The brief, the four-second test, layout grids, KPI tiles, mobile, subtraction.
Free 01–05; Pro: two complete redesigns with the dashboard JSON to download.

## 09 · Interactions & Faceting · 10 · Bindings · 11 · Dashboard JSON

Faceting, selection vs results bindings, the binding functions (`cell`,
`column`, `row`, `coalesce`, `asString`, `asObject`), navigation, JSON editing
and version control. Concepts free; binding recipes and the JSON audit are Pro.

## 12 · Collaboration & Embedding

Sharing, subscriptions, annotations, embedding in Lightning pages and
Experience Cloud, Slack. Free.

## 13 · APIs & Automation

| # | Lesson | Access |
| --- | --- | --- |
| 01 | The Analytics REST API: datasets, queries, recipes | Free |
| 02 | External Data API: loading CSVs programmatically | Free |
| 03 | Scheduling and chaining jobs; data orchestration | Pro |
| 04 | Deploying with metadata: `WaveDashboard`, `WaveRecipe`, change sets vs CLI | Pro |
| 05 | Monitoring: job failures, data freshness, alerts | Pro |

**Data engineering ideas:** orchestration (DAGs, retries), CI/CD for analytics, observability and data freshness SLAs.

## 14 · Einstein Discovery (the AI path)

| # | Lesson | Access |
| --- | --- | --- |
| 01 | What Einstein Discovery produces: stories, models, predictions | Free |
| 02 | Preparing a dataset for a model: the target, leakage, balance | Free |
| 03 | Reading a story: insights, drivers, improvements | Free |
| 04 | Model quality: accuracy that lies, AUC, the confusion matrix | Pro |
| 05 | Deploying predictions to records; predictions in recipes | Pro |
| 06 | Monitoring a deployed model and when to retrain | Pro |
| 07 | Generative AI on top of analytics: natural-language questions, AI-written summaries, and how to check them | Pro |

## 15–18 · GTM Engineering, Demand, Pipeline and RevOps Analytics

The applied half: the Academy's own funnel, built as dashboards. Each section is
one free overview, then one Pro lesson per dashboard (the build, the SAQL, the
JSON to download). These use the **Academy CRM** in the learning org
(`salesforce/CRM-PROCESS.md`) as their data: real leads from Web-to-Lead,
seat deals, seat assignments.

---

## How a lesson is made

1. `pnpm new-lesson` — pick the section, title, access (free/pro), video or
   article. It writes the file with numbered name and full frontmatter.
2. Write the body in English only. Add `quiz`, `interview` and, for recorded
   lessons, the `walkthrough` script (`content-creation/README.md`).
3. Link the visualiser preset the lesson uses.
4. `pnpm lesson:check` — frontmatter, numbering, links, quiz answers in range.
5. `pnpm build` translates the other 11 languages and gates Pro bodies.
