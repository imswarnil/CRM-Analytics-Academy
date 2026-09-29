# Handoff: CRM Analytics Academy — "Blueprint" style for Nuxt UI

## Overview
A graph-paper / technical-drawing visual style for a single-course learning platform (Home, Curriculum, Player, Pricing, Showcase, Resources, About). Apply it to an **existing Nuxt UI v3 project**.

## About the design files
`CRM Analytics Academy v3.dc.html` is an **HTML design reference**, not production code. Recreate the look in the Nuxt app using Nuxt UI components + Tailwind v4, restyled via `app.config.ts` and a CSS theme layer. Open the HTML in a browser to inspect every state.

## Fidelity
**High-fidelity.** Colors, type, borders, hover motion are final. Copy/data is placeholder.

---

## 1. Install
```bash
# fonts
npx nuxi module add @nuxt/fonts
# icons already via @nuxt/ui (Iconify). Use lucide:
npm i -D @iconify-json/lucide
```
`nuxt.config.ts`
```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/fonts', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  fonts: { families: [
    { name: 'Schibsted Grotesk', weights: [400,500,600,700,800,900] },
    { name: 'IBM Plex Mono', weights: [400,500,600] }
  ]},
  colorMode: { preference: 'light' },
  i18n: { locales: ['en','es','fr','de','ja'], defaultLocale: 'en', strategy: 'no_prefix' }
})
```

## 2. Tokens — `assets/css/main.css`
```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  --font-sans: 'Schibsted Grotesk', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
  /* custom "blueprint" scale used as Nuxt UI primary */
  --color-blueprint-50:  #F4F7FB;
  --color-blueprint-100: #DDEBFA;  /* ice */
  --color-blueprint-200: #A8CCF2;  /* frost */
  --color-blueprint-300: #7FB2EA;
  --color-blueprint-400: #3D8BD9;  /* tide */
  --color-blueprint-500: #2F5BEA;  /* signal (primary) */
  --color-blueprint-600: #2549C4;
  --color-blueprint-700: #1C3A9C;
  --color-blueprint-800: #15306F;
  --color-blueprint-900: #0F2A5C;  /* navy */
  --color-blueprint-950: #07122A;
  --color-glow-400: #3FC6DC;       /* cyan accent */
  --radius: 0;                     /* square corners everywhere */
}

:root {
  --paper:#F4F7FB; --paper2:#E8EFF8; --card:#FBFCFE;
  --ink:#0C1B33; --ink2:#4A5B78; --line:#C3D2E6;
  --rmin:rgba(47,91,234,.055); --rmaj:rgba(47,91,234,.12); --x:#7E93B5;
  --ui-bg: var(--paper); --ui-bg-elevated: var(--card);
  --ui-text: var(--ink); --ui-text-muted: var(--ink2);
  --ui-border: var(--line); --ui-border-accented: var(--ink);
  --ui-radius: 0;
}
.dark {
  --paper:#0A1428; --paper2:#0D1A33; --card:#0F1C36;
  --ink:#E6EEFA; --ink2:#9DB0CF; --line:#24385F;
  --rmin:rgba(168,204,242,.055); --rmaj:rgba(168,204,242,.12); --x:#4F6A96;
  --ui-primary: #6E93FF;
}

body { background: var(--paper); color: var(--ink); }

/* --- signature utilities --- */
@utility graph-paper {
  background-color: var(--paper);
  background-image:
    linear-gradient(var(--rmaj) 1px, transparent 1px),
    linear-gradient(90deg, var(--rmaj) 1px, transparent 1px),
    linear-gradient(var(--rmin) 1px, transparent 1px),
    linear-gradient(90deg, var(--rmin) 1px, transparent 1px);
  background-size: 80px 80px, 80px 80px, 16px 16px, 16px 16px;
}
@utility graph-paper-fine {
  background-image: linear-gradient(var(--rmin) 1px, transparent 1px),
                    linear-gradient(90deg, var(--rmin) 1px, transparent 1px);
  background-size: 16px 16px;
}
@utility ink-border { border: 1.5px solid var(--ink); }
@utility hard-shadow { box-shadow: 5px 5px 0 var(--ink); }
@utility eyebrow {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .14em;
  text-transform: uppercase; color: var(--ui-primary);
}

/* crop-mark "+" corners: add class="crosshair" to any relative box */
.crosshair { position: relative; --x: var(--x); }
.crosshair::before {
  content: ""; position: absolute; inset: -7px; pointer-events: none; z-index: 2;
  --c: linear-gradient(var(--x), var(--x));
  background:
    var(--c) 0 7px/15px 1.5px no-repeat, var(--c) 7px 0/1.5px 15px no-repeat,
    var(--c) 100% 7px/15px 1.5px no-repeat, var(--c) calc(100% - 7px) 0/1.5px 15px no-repeat,
    var(--c) 0 calc(100% - 7px)/15px 1.5px no-repeat, var(--c) 7px 100%/1.5px 15px no-repeat,
    var(--c) 100% calc(100% - 7px)/15px 1.5px no-repeat, var(--c) calc(100% - 7px) 100%/1.5px 15px no-repeat;
  transition: --x .2s;
}
.crosshair:hover { --x: var(--ui-primary); }

/* ruler strip (hero band, footer, under player) */
@utility ruler {
  height: 10px;
  background:
    repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 8px) 0 0/auto 5px repeat-x,
    repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 40px) 0 0/auto 10px repeat-x;
  opacity: .6;
}

/* paper grain overlay */
body::after {
  content:""; position:fixed; inset:0; pointer-events:none; z-index:200; opacity:.28; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .3 0 0 0 0 .4 0 0 0 0 .6 0 0 0 .35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.dark body::after { mix-blend-mode: screen; opacity: .12; }
```

## 3. Nuxt UI theme — `app.config.ts`
```ts
export default defineAppConfig({
  ui: {
    colors: { primary: 'blueprint', neutral: 'slate' },
    button: {
      slots: { base: 'rounded-none font-bold border-[1.5px] border-(--ink) transition-all duration-150' },
      variants: { size: { md: { base: 'h-11 px-4' }, lg: { base: 'h-13 px-6 text-[15px]' } } },
      compoundVariants: [
        { color: 'primary', variant: 'solid',
          class: 'bg-primary text-white shadow-[5px_5px_0_var(--ink)] hover:bg-blueprint-900 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--ink)] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_var(--ink)]' },
        { color: 'neutral', variant: 'outline',
          class: 'bg-(--card) ring-0 hover:bg-blueprint-100 hover:gap-4' }
      ]
    },
    card: { slots: { root: 'rounded-none ink-border bg-(--card) crosshair', header: 'border-b-[1.5px] border-(--ink) bg-blueprint-100' } },
    badge: { slots: { base: 'rounded-none font-mono text-[10px] tracking-[.08em]' } },
    input: { slots: { base: 'rounded-none ring-[1.5px] ring-(--ink)' } },
    select: { slots: { base: 'rounded-none ring-[1.5px] ring-(--ink)' } },
    tabs: { slots: { list: 'rounded-none ink-border p-0 bg-(--card)', trigger: 'rounded-none font-bold data-[state=active]:bg-(--ink) data-[state=active]:text-(--paper)', indicator: 'hidden' } },
    modal: { slots: { content: 'rounded-none ink-border shadow-[10px_10px_0_var(--ui-primary)]' } },
    slideover: { slots: { content: 'rounded-none border-l-[1.5px] border-(--ink)' } },
    accordion: { slots: { item: 'border-b border-dashed border-(--line)' } },
    progress: { slots: { base: 'rounded-none ink-border h-3', indicator: 'rounded-none bg-[repeating-linear-gradient(135deg,var(--color-blueprint-500)_0_6px,var(--color-blueprint-400)_6px_12px)]' } }
  }
})
```

## 4. Component mapping
- Header → `UHeader` (sticky, `border-b-[1.5px] border-(--ink)`, 64px). Nav items separated by `border-l border-(--line)`, active = `bg-blueprint-100` + 3px bottom bar in primary.
- Search ⌘K → `UContentSearch` or `UCommandPalette` in `UModal`, bound with `defineShortcuts({ meta_k: open })`.
- Language → `ULocaleSelect` (or `USelect` with i18n locales).
- Dark toggle → `UColorModeButton` (hover: `rotate-90`).
- Mobile menu (<1060px) → `UHeader` `#body` slot, numbered rows `01 … 06`.
- Cards → `UCard` with `.crosshair`, `.graph-paper-fine` revealed on hover.
- Pricing toggles → two `UTabs` (Individual/Teams, Monthly/Yearly −35%).
- Pricing FAQ → `UAccordion`.
- Player sidebar → custom `<aside>` (see §6); on <1024px use `USlideover`.
- Icons → `i-lucide-*` (play, file-text, lock, check, crosshair, rocket, users, etc.).

## 5. Signature patterns (recreate exactly)
**Typography**
- H1: 900 weight, `clamp(42px,6.2vw,76px)`, line-height .95, letter-spacing −0.045em, `text-wrap:balance`.
- H2: 800, `clamp(30px,4vw,48px)`, −0.04em, lh 1.
- Body 16–19px, lh 1.6, `--ink2`.
- Eyebrow/labels: IBM Plex Mono 10–12px, tracking .1–.14em, uppercase — use drawing numbering: `FIG. 01 — PIPELINE BY MONTH`, `SHEET 02 — PRICING`, `PLAN / 01`, `M02 · L05`.

**Surfaces**
- Every section background = `.graph-paper` (80px major / 16px minor). Alternate sections use `--paper2`.
- Hero: faint SVG area chart (fill `blueprint-100` @55%, stroke `blueprint-200`) + dashed secondary line, absolutely behind content, Q1–Q4 mono labels at bottom.
- Dark navy band (`#0F2A5C`) with `.ruler` top edge and mono keyword ticker separated by cyan "+".
- Footer: navy, ruler strip, mono uppercase.
- No rounded corners anywhere except donut/progress rings.

**Hover language (all 200–350ms, bounce easing `cubic-bezier(.3,1.5,.5,1)`)**
- Card: `translateY(-5px)`, shadow `8px 8px 0 var(--ink)`, crop marks turn primary, fine grid fades in.
- Corner icon box (40–46px, ink border, `blueprint-100` bg) → fills primary, icon white, `rotate(-12deg)`.
- Feature cards: bottom SVG sparkline draws in (`stroke-dasharray:420` → `stroke-dashoffset:0`, 0.9s) + area fill fades in + metric label appears.
- Bar charts: hovered bar → cyan `#3FC6DC`, dashed vertical crosshair line + ink tooltip chip.
- Pricing meter: 8 ascending bars, height 60% → 100% on hover.
- Links/rows: `padding-left` +8px and arrow `translateX` on hover.
- Primary button: offset hard shadow lifts on hover, presses flat on active.

## 6. Screens
**Home**: hero (2-col auto-fit min 440px) with KPI strip + 12-month bar chart in a crosshair frame and `10px 10px 0 blueprint-100` shadow → navy ticker band → 4 feature cards (min 270px) → "Curriculum, plotted": each module is a row with a horizontal stacked bar (segment per lesson, width ∝ minutes, 0–75 min axis) → navy Teams CTA with stacked bar chart.

**Curriculum**: graph-paper header, hatched progress bar (10% tick marks). Module cards: `blueprint-100` header with big 900-weight number, donut progress. Lesson rows: square type icon, title, length bar (∝ minutes, video = primary, article = frost), duration, FREE/PRO/OPEN mono tag.

**Player** (full width):
- Grid `minmax(0,1fr) 360px` (sidebar open) / `60px` (collapsed); transition `grid-template-columns .3s`.
- Main: breadcrumb button, mono lesson code, H1, then player boxed in `.crosshair` frame with mono caption row above ("FIG. M01 · L01 — VIDEO LESSON" / "21:9 · 1080P · 8 MIN") and a `.ruler` below. Video aspect 21:9, min-height 320px; big square play button with cyan offset shadow; control bar with cyan progress.
- Article lessons render inside the same frame: max-width 720px, §-numbered headings, code block (ink border, `#07122A` bg), dashed-border tip with crosshair icon.
- Locked (Pro) lessons: navy grid panel, lock icon, "View plans".
- Prev / Mark complete (cyan when done) / Next lesson.
- Below: "Course timeline" bar chart — one bar per lesson, height ∝ length; current = primary, done = tide, open = ice, Pro = diagonal hatch. Hover scales bar + tooltip; click opens lesson.
- Sidebar (sticky, `top:64px; height:calc(100vh - 64px)`, fine graph paper): header with progress + collapse button (`i-lucide-panel-right-close`); per module: number, meta, mini donut; lessons with 3px active left bar, mini length bar. Collapsed rail: expand button + one donut per module (current filled primary) + vertical "CONTENTS · 18%" mono label.

**Pricing**: two tab toggles; cards min 300px; featured plan = navy with fine light grid, cyan tag and icon, white button. Individual: Free $0 / Pro $19 yr ($29 mo) / Lifetime $399. Teams: Team $15/seat yr ($22 mo) / Enterprise Custom. FAQ box below.

**Showcase**: cards with ice graph-paper thumbnail + line chart that draws on hover + corner icon; "drop screenshot" placeholder for real images.

**Resources**: 6 cards (kind eyebrow, corner icon, title, desc, "OPEN ↗").

**About**: prose + instructor card (photo placeholder, LinkedIn/GitHub square buttons).

## 7. Responsive
- `<1060px`: nav collapses to hamburger menu.
- `<1024px`: player sidebar → `USlideover` opened from "Contents" button.
- `<700px`: module rows stack; grids use `repeat(auto-fit,minmax(min(100%,Npx),1fr))`.

## 8. State
`colorMode`, `locale`, `searchOpen`, `sidebarOpen` (persist in `useCookie`), `currentLesson`, `completed: Set<lessonId>`, `pricingAudience: 'individual'|'team'`, `billing: 'month'|'year'`. Lesson model: `{ id, moduleId, title, type: 'video'|'article', minutes, free }` — ideal for `@nuxt/content` collections.

## Files
- `CRM Analytics Academy v3.dc.html` — full interactive reference (open in browser; Tweaks: dark mode, unlock all, start page).
