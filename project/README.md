# Salesforce projects

A workspace for Swarnil's Salesforce / CRM Analytics project work — orgs, metadata,
dashboard JSON, dataflow and recipe definitions, SAQL scratch files, exports, notes.

This folder is **not part of the website build**. Nothing here is read by Nuxt, indexed by
Nuxt Content, or published to GitHub Pages:

- It sits outside `content/`, so the `docs`, `resources` and `showcase` collections never
  see it (see `content.config.ts`).
- It is not linked from any page, so the prerenderer — which discovers routes by crawling
  links from `/` — never reaches it.

Put anything here freely without worrying about it appearing on the site.

## Suggested layout

```
project/
├── <org-or-client>/
│   ├── dashboards/      exported dashboard JSON
│   ├── dataflows/       dataflow / recipe definitions
│   ├── saql/            query scratch files
│   ├── data/            sample CSVs (keep these small)
│   └── notes.md         what you were trying to do, and what broke
└── README.md
```

## If a project is worth publishing

Two separate destinations, and they are not the same thing:

- **A finished dashboard** → add an entry to `content/showcase/`. That is the public
  gallery: screenshot, KPI formulas, build steps, techniques used. See
  `content/showcase/sales-pipeline-health.md` for the shape.
- **A teaching lesson** → add markdown under `content/en/<module>/`, then run
  `pnpm translate` so it reaches all twelve languages.

Move the sanitised, publishable version across by hand. Don't symlink or import from this
folder into `content/` — that would pull raw project material into the build.

## Before you commit anything here

This folder is committed to a **public** repository. Real org data does not belong in it.
Strip or fake anything sensitive first:

- org IDs, usernames, session IDs, tokens, certificates, `.sfdx/` or `sfdx-project.json`
  auth artefacts
- customer names, contact details, revenue figures, pipeline amounts
- full data exports — a handful of representative rows is enough to reproduce a problem

If a project can't be sanitised, keep it outside this repository entirely.
