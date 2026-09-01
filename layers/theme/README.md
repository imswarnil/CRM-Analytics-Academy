# `theme` — how the site looks

Everything visual lives here and nothing else does. Nuxt auto-registers any
directory under `layers/`, so there is nothing to import.

```
layers/theme/
├── nuxt.config.ts          registers the stylesheet, nothing else
├── app/
│   ├── app.config.ts       the Nuxt UI theme — colours, a few slot tweaks
│   └── assets/css/
│       ├── index.css       the one entry
│       ├── fonts.css       Space Grotesk / Outfit / JetBrains Mono @font-face
│       ├── tokens.css      palette, radius, type, shell dimensions, nb-* vocabulary
│       ├── shell.css       the app-shell grid
│       └── decor.css       landing-page backdrops and motion
└── README.md
```

The look is the Academy **"Neo Brutal" design system** (the claude.ai/design
project "CRM Analytics Academy — All Pages"): Salesforce blue on near-white
pages, an ink line (`--nb-ink`) around anything that matters, one loud yellow
for the primary call to action, and four candy accents with one job each.
`tokens.css` carries all of it; the small `nb-card` / `nb-frame` / `nb-tile` /
`nb-tag` / `nb-pill` classes are the five shapes every screen is built from.

## One vocabulary

A button is `<UButton>`. An icon is `<UIcon name="i-lucide-…">`. A card is
`<UCard>` or a bordered `div`. There is no second set of component classes.

This is worth stating because the site previously vendored a 1.3 MB external
design system and wrote its markup against *its* classes as well as Tailwind's,
so every screen had to decide which vocabulary it was speaking and the two
drifted. Removing it took the stylesheet from **101 KB gzipped to 31 KB** and
deleted about 2,000 lines of markup that existed only to satisfy the other
system's contract.

If you find yourself wanting a `.some-component` class, check first whether a
Nuxt UI component and a few utilities will do it. The exceptions that earned
their place are in `shell.css` (a CSS grid Tailwind cannot express as cleanly)
and `decor.css` (backdrops and keyframes).

## Where a change belongs

| Changing… | Goes in |
| --- | --- |
| primary colour, neutral, component defaults | `app/app.config.ts` |
| palette, radius, type scale, shell dimensions, nb-* shapes | `tokens.css` |
| the rail/topbar/main grid | `shell.css` |
| a hero backdrop or animation | `decor.css` |
| the typeface | `fonts.css` + `public/fonts/` |

## The colours

`salesforce` (a custom ramp with `#0176D3` at 500) for primary, `emerald` for
success and progress.

The design system decided the old "don't dress as the product" stance the other
way: this is an analytics site and it now wears the domain's own blue, kept
honest by the ink outlines and the candy accents (yellow = CTA, pink = flags,
green = completion, purple = dashboards, sky = collaboration). Emerald still
carries completion in components — "you finished this" has to be legible at a
glance in a rail full of grey rows.

## The shell

`.shell` is a fixed grid: rail, topbar, and one scrolling pane. The page itself
never scrolls.

That is the whole point. A docs site pretending to be a course ends up with two
scrollbars — an outer one that moves the chrome and an inner one that moves the
curriculum — and no way to tell which you are about to use. Here `.shell__main`
is the only scroll container, and `.shell__railbody` scrolls independently
inside a pane that does not move.

The rail changes what it holds rather than appearing twice: on a lesson it is
the curriculum stepper with one control back out, everywhere else it is site
navigation.

## Verifying a change

There is no visual regression suite, and `pnpm lint` / `pnpm typecheck` will not
catch a broken token — a wrong value renders as an unstyled page, not an error.
After changing anything here run `pnpm build`, then load a lesson, the
dashboard and the landing page **in both colour modes**.
