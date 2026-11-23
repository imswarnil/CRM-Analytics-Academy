# Curriculum plan — from the Salesforce platform to the dashboards GTM teams use

The course is rebuilt from scratch (2026-11-18) and published one lesson at a
time: each lesson is written here, recorded for YouTube, and embedded on its
page. Lessons live in `content/en/course/<NN.section>/<NN.lesson>.md` and
render at `/course/<section>/<lesson>` (`pnpm new-lesson`); only English is
written by hand, the build translates the rest. The course page is `/course`
("Start here" in the navbar).

**The approach.** First understand and build on the Salesforce platform
(objects, data model, integration, a little Apex and LWC). Then learn the GTM
basics the data describes. Then design the data architecture — data stored in
several places, brought together in CRM Analytics. Then build the dashboards
every revenue team uses. Then the advanced work: bindings, sharing, embedding.

**Free / Pro.** The concept, the first build and the quiz are free. Pro is the
depth: the second and third build, the edge cases, downloadable recipes and
dashboards, and the interview walk-through — about one lesson in three.

**Notes.** Every finished section gets a downloadable notes sheet (handwritten
style, with the charts and diagrams from its lessons) — PDF first.

Every lesson below exists as a file. A lesson still marked `comingSoon: true`
is a **draft**: learners see its title and a "coming soon" card; the admin
account sees the whole lesson and its recording script, with editing notes
(scripts/gate-content.mjs, /api/lesson). Drafts are not translated. To publish
one: record it, add `video: { id }`, delete `comingSoon: true` (and from the
section's `01.index.md` when it is the section's first), then `pnpm build`.

The course is **CRM Analytics only** (2026-11-20): data prep, visualization,
SAQL, bindings, sharing and Einstein Discovery. GTM theory and Apex were cut.
Free / Pro is marked per lesson below.

## 01 · Foundations
1. Objects, fields and relationships *(published, free)*
2. Your org and a small app *(free)*
3. Getting data in: Import Wizard, Data Loader, APIs, external IDs *(free)*

## 02 · Data Prep
1. The data layer: sync, connections, recipes, datasets *(free)*
2. Your first recipe *(free)*
3. Joins in depth: lookup, left, right, inner, outer, multi-value, fan-out *(free)*
4. Append and aggregate: choosing the grain *(Pro)*
5. Formulas, buckets and dates *(free)*
6. Transpose, flatten and split *(Pro)*
7. Snapshots and history *(Pro)*
8. Security in the data: predicates and sharing inheritance *(free)*

## 03 · Visualization
1. Lenses and your first dashboard *(free)*
2. Choosing the right chart *(free)*
3. Numbers, tables and compare tables *(Pro)*
4. Layout and design *(free)*
5. Dashboard patterns: KPI, trend, funnel, list *(Pro)*

## 04 · SAQL
1. The SAQL you need: load, filter, group, foreach, order, limit *(free)*
2. SAQL functions: string, math, date, case, coalesce *(free)*
3. Projection with foreach *(Pro)*
4. Cogroup: joining in a query *(Pro)*
5. Windowing: running totals, rank, share of total *(Pro)*
6. Time series and fill *(Pro)*

## 05 · Interactions and Bindings
1. Faceting and filters *(free)*
2. Selection bindings *(free)*
3. Results bindings *(Pro)*
4. Serialization functions: asString, asObject, asEquality, asProjection, asGrouping *(Pro)*
5. Dashboard JSON *(Pro)*

## 06 · Sharing and Embedding
1. Apps, sharing and licences *(free)*
2. Embedding in Lightning, Experience Cloud and Slack *(free)*
3. Subscriptions, notifications and actions *(Pro)*
4. Packaging, deployment and performance *(Pro)*

## 07 · Einstein Discovery
1. Your first story *(free)*
2. Reading a model honestly *(Pro)*
3. Predictions in Salesforce *(Pro)*

## How a lesson's script is written

Each lesson's `walkthrough` is the video: one shot per beat. `say` is the
spoken line, written to be read aloud; `screen` is the click path; `onscreen`
the text overlay; `edit` the direction for the cut (zoom, callout, diagram,
B-roll, pace) — shown to the admin only. Every video follows the same arc:
hook (the problem in one sentence) → the idea, drawn → the build, in the
Academy org → the trap people fall into → recap and what is next.

## Certification

The practice exam (`content/<locale>/exam/`) follows the Salesforce Certified CRM
Analytics and Einstein Discovery Consultant outline; questions map to these
sections as they are published.

---

## How a lesson is made

1. `pnpm new-lesson` — pick the section, title, access (free/pro), video or
   article. It writes the numbered file with full frontmatter.
2. Write the body in English only. Open with `::lesson-hero` (what you will
   learn + an animated figure). Add `quiz`, `interview` and, for recorded
   lessons, the `walkthrough` script.
3. `pnpm lesson:check` — frontmatter, numbering, links, quiz answers in range.
4. Record the video, upload it to YouTube, add `video: { id }` to the English file.
5. `pnpm build` translates the other languages and gates Pro bodies and drafts.
