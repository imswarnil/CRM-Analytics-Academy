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
│       ├── fonts.css       Figtree @font-face
│       ├── tokens.css      radius, type, shell dimensions
│       ├── shell.css       the app-shell grid
│       └── decor.css       landing-page backdrops and motion
└── README.md
```

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
| radius, type scale, shell dimensions | `tokens.css` |
| the rail/topbar/main grid | `shell.css` |
| a hero backdrop or animation | `decor.css` |
| the typeface | `fonts.css` + `public/fonts/` |

## The two colours

`indigo` for primary, `emerald` for success and progress.

Indigo reads as instructional rather than corporate, and is deliberately **not**
Salesforce blue (`#0176D3`): a site *about* a Salesforce product should not
dress as the product. Emerald carries completion — on a learning platform that
is the one thing that earns a second colour, because "you finished this" has to
be legible at a glance in a rail full of grey rows.

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
