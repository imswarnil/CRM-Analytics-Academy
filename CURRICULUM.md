# Curriculum plan — from the Salesforce platform to the dashboards GTM teams use

The course is rebuilt from scratch (2026-11-18) and published one lesson at a
time: each lesson is written here, recorded for YouTube, and embedded on its
page. Lessons live in `content/en/<NN.section>/<NN.lesson>.md` (`pnpm
new-lesson`); only English is written by hand, the build translates the rest.

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

## 01 · Salesforce Foundations — *in progress*

1. Objects, fields and relationships — the data model behind every dashboard *(published, free)*
2. Building a small app — a custom object, page layout, list view and validation rule
3. Integration basics — Data Import Wizard, Data Loader, REST/Bulk APIs, external IDs and upserts
4. Apex and LWC for analysts — reading a trigger, an Apex class and an embedded component

## 02 · GTM Basics — how a revenue team works

1. The funnel: lead → MQL → SQL → opportunity → customer
2. Pipeline: stages, amount, close date, forecast categories
3. Revenue metrics: bookings, ARR/MRR, churn, expansion, NRR
4. Who reads which dashboard: marketing, sales, CS, RevOps, the board

## 03 · Data Architecture — data in many places, one model

1. Where GTM data lives: Salesforce, the web, marketing tools, billing, a warehouse, CSVs
2. CRM Analytics' data layer: Data Sync, connectors, recipes, datasets
3. Grain, joins and keys — designing a dataset that reconciles
4. Snapshots and history: storing the past so you can measure change
5. Security in the data: row-level predicates and sharing inheritance

## 04 · Dashboards Every GTM Team Uses

1. KPI dashboards — the handful of numbers and their definitions
2. Snapshot dashboards — pipeline as of each week
3. Change analytics — what moved, by how much, and why
4. Conversion and funnel dashboards
5. Adoption dashboards — are people using what we built?
6. Designing for decisions: layout, charts, colour, mobile

## 05 · Interactions and Bindings

1. Faceting and filters
2. Selection and results bindings
3. SAQL behind a widget, and when to write it by hand
4. Dashboard JSON: what to edit and what to leave

## 06 · Sharing, Embedding and Apps

1. Apps, sharing and the licence model
2. Embedding dashboards in Lightning pages, Experience Cloud and Slack
3. Subscriptions, alerts and actions
4. Packaging and moving between orgs

## 07 · Advanced

1. SAQL in depth — cogroup, windowing, time series
2. Einstein Discovery — stories, predictions and writing back to Salesforce
3. APIs and automation for CRM Analytics
4. Performance and governance

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
5. `pnpm build` translates the other 11 languages and gates Pro bodies.
