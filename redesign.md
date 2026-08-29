# CRM Analytics Academy — Neo-Brutal Redesign Brief

> **Hand this file to Claude Code / Cursor / any coding assistant.** It is written as instructions, not description. Read every section before touching code. Ship in the phases at the bottom; do not skip Phase 0.

---

## 0. Design thesis (pin this — do not drift)

**Readable neo-brutalism for a curriculum, in Salesforce's colour language.**

This is a learning site, not a portfolio. Users sit on a page for 15–30 minutes reading and watching. The design must feel confident and characterful — thick ink borders, hard offset shadows, chunky Trailhead-style badges, halved-shape decorations bleeding off the page edges — but never at the cost of long-form legibility.

**The bargain, in one sentence:** boldness lives in the **chrome** (nav, sidebar, badges, code-block frames, section markers, page furniture); the **content column stays quiet, wide-line-height, high-contrast, and undecorated** so people can actually read it.

If a change makes a lesson harder to read for the sake of looking cooler, it's wrong.

### The single signature element

**Trailhead-style hexagonal badge markers** with a 3px ink border, a hard `4px 4px 0` ink shadow, filled with an accent from the palette, sitting in the top-left of every section header and every lesson card. This is the one motif that must be memorable and repeated. Nothing else should compete with it visually.

### What we are *not* doing

- No warm-cream + terracotta + serif display (the generic "AI design" trap).
- No pure-black on white with 0px border-radius broadsheet look.
- No busy scattered shape confetti behind body text — decorations only sit **at page edges, in headers, and in empty space**, never behind paragraphs of prose.
- No skewed elements, no rotated cards, no "wonky" hand-drawn strokes. This is neo-brutal, not scrapbook.
- No emoji as UI. Icons only via `@iconify` / `@nuxt/icon`.

---

## 1. Design tokens

### 1.1 Colour system

Add these as CSS custom properties in `app/assets/css/main.css` under Tailwind 4's `@theme` block. Also register the same names in `app.config.ts` so Nuxt UI v4's `ui.colors` picks them up.

```css
@theme {
  /* Ink & paper — the whole design is built on these two */
  --color-ink:        #0B1120;   /* borders, body text, hard shadows */
  --color-ink-soft:   #1B2333;   /* secondary text, muted borders */
  --color-paper:      #FDF8EE;   /* page background — warm cream */
  --color-paper-2:    #F5ECD7;   /* subtle bg swaps, sidebar rail */
  --color-paper-3:    #FFFFFF;   /* card interior when max contrast needed */

  /* Salesforce primaries */
  --color-sf-blue:    #0176D3;   /* primary CTA, links, active state */
  --color-sf-blue-2:  #014486;   /* hover / pressed */
  --color-sf-sky:     #57C4FF;   /* light accent, tag fills */
  --color-sf-navy:    #032E61;   /* dark-mode paper, hero blocks */

  /* Pop accents — use ONE per component, never stacked */
  --color-pop-yellow: #FFD447;   /* signal / "new lesson" / practice callout */
  --color-pop-pink:   #FF3D8A;   /* interview-prep / "hot tip" */
  --color-pop-green:  #04E762;   /* "available", success, live badge */
  --color-pop-lilac:  #B18CFF;   /* meta / locale / secondary badge */

  /* Semantic */
  --color-success:    #04B463;
  --color-warning:    #FFB020;
  --color-danger:     #E5484D;
  --color-info:       var(--color-sf-blue);
}
```

**Usage rule:** ink and paper carry 80% of every screen. SF-blue is the only "hot" colour that appears in body text (as link colour). The four pop accents are reserved for **badges, section markers, and one hero moment per page**. Never colour body paragraphs.

### 1.2 Typography

Load via `@nuxt/fonts` (add to `modules` in `nuxt.config.ts`):

```ts
fonts: {
  families: [
    { name: 'Archivo', provider: 'google', weights: [400, 600, 800, 900] },
    { name: 'Inter',   provider: 'google', weights: [400, 500, 600, 700] },
    { name: 'JetBrains Mono', provider: 'google', weights: [400, 600] }
  ]
}
```

Then in `@theme`:

```css
--font-display: 'Archivo', system-ui, sans-serif;   /* h1–h4, badges, buttons */
--font-body:    'Inter',   system-ui, sans-serif;   /* everything else */
--font-mono:    'JetBrains Mono', ui-monospace, monospace;
```

**Type scale** (use these classes; do not invent sizes):

| Role                | Class                                       | Notes                                                    |
|---------------------|---------------------------------------------|----------------------------------------------------------|
| Hero display        | `font-display font-black text-6xl md:text-8xl tracking-tight leading-[0.9]` | Homepage only. Uppercase optional. |
| Page H1             | `font-display font-extrabold text-4xl md:text-5xl tracking-tight`           | Every lesson starts here.          |
| Section H2          | `font-display font-extrabold text-2xl md:text-3xl`                          | Renders with a badge marker (§3.4).|
| Subsection H3       | `font-display font-bold text-xl md:text-2xl`                                |                                    |
| Body                | `font-body text-[17px] leading-[1.75] text-ink`                             | 17px, not 16 — this is a reader.   |
| Small / captions    | `font-body text-sm text-ink-soft`                                           |                                    |
| Code / SAQL         | `font-mono text-[15px] leading-[1.6]`                                       | SAQL blocks get 15px, not 14.      |
| Badge / eyebrow     | `font-display font-black text-xs uppercase tracking-[0.14em]`               | ALL CAPS reserved for these.       |

Uppercase appears in exactly two places: hero display and badges/eyebrows. Anywhere else, sentence case.

### 1.3 Borders, shadows, radii

```css
/* Border widths */
--border-1: 2px;   /* inputs, small chips */
--border-2: 3px;   /* cards, buttons, sidebar items, callouts */
--border-3: 4px;   /* hero, video player frame, page container */

/* The one shadow — no blur, always ink, always offset down-right */
--shadow-brut-sm: 3px 3px 0 0 var(--color-ink);
--shadow-brut:    5px 5px 0 0 var(--color-ink);
--shadow-brut-lg: 8px 8px 0 0 var(--color-ink);

/* Radii — deliberately mixed to avoid template feel */
--radius-pill:  9999px;   /* badges, buttons, nav items */
--radius-card:  18px;     /* cards, callouts, code blocks */
--radius-hero:  28px;     /* hero panel, video frame */
--radius-input: 10px;     /* inputs, selects */
```

**Press interaction (universal for buttons, cards-as-links, nav items):**

```css
.brut { border: 3px solid var(--color-ink); box-shadow: 5px 5px 0 0 var(--color-ink); transition: transform 120ms, box-shadow 120ms; }
.brut:hover  { transform: translate(-1px, -1px); box-shadow: 6px 6px 0 0 var(--color-ink); }
.brut:active { transform: translate(3px, 3px);  box-shadow: 1px 1px 0 0 var(--color-ink); }
```

Every interactive brutalist element uses this pattern. No exceptions, no bespoke hovers. `prefers-reduced-motion` disables the transform.

### 1.4 Spacing & layout

- **Docs page grid:** `sidebar 280px | content max-w-[72ch] | toc 240px` on `xl:`, collapse to single column on `< lg`. Content column caps at **72ch** — this is the readability lever, do not widen it.
- **Section vertical rhythm:** `space-y-12` between H2 sections, `space-y-6` between H3 subsections, `space-y-4` within.
- **Global page padding:** `px-6 md:px-10` on containers.

---

## 2. Signature system: shapes, badges, decorations

### 2.1 The halved-shape decorations

Create `app/components/deco/BrutShape.vue`. It renders one of: `half-circle`, `quarter-circle`, `pill-slice`, `hex-slice`. Props: `color`, `size`, `rotation`, `position` (`edge-left | edge-right | edge-top | edge-bottom | corner-tl | corner-tr | corner-bl | corner-br`).

Each shape is an inline SVG with:
- 3px ink stroke
- Filled with one pop accent
- Positioned absolutely so **50% is off-canvas** — they bleed off the viewport edge.

Rules:
- Max **3** shapes per page, never more.
- Never behind text — only in header bands, hero, footer, and the empty margins beside the content column on `xl:` screens.
- Never animated.
- Skip entirely on `< md` (mobile). Mobile gets a cleaner treatment.

### 2.2 Trailhead-style hexagonal badge (the signature)

Create `app/components/brut/BrutBadge.vue`. Props: `variant` (colour token), `icon` (iconify name), `label` (string), `size` (`sm | md | lg`).

Shape: rounded-hexagon (SVG `<path>` with 8px corner radii on hex points, not a plain polygon — softer, more Trailhead-like). 3px ink stroke, `--shadow-brut-sm`, fill = pop accent, icon centred in ink.

Where it appears:
- Top-left of every section H2 (`§3.4` describes how MDC injects it).
- On the sidebar next to each section root.
- On homepage curriculum cards.
- Never as decoration alone — always with meaning attached (section number, lesson type, status).

### 2.3 Domain-native micro-motifs

Two small motifs that make the design belong to *this* subject:

- **"Lens frame"** — corner brackets on a card (`⌐ ⌐  ⌐ ⌐`, hand-drawn as 3px ink strokes). Used only on the **Lenses & Explorations** section pages and on the dashboard-showcase cards. It riffs on the CRM Analytics "Lens" concept.
- **"Conversation bubble"** — a chunky speech-bubble frame (rounded rect + triangular tail) with 3px ink border and `--shadow-brut`. Used only for the **Interview Prep Q&A blocks** — because the section covers Conversational Analytics.

Both live in `app/components/brut/`. Do not use either outside its assigned surface.

---

## 3. Component-by-component spec

Every component below either **wraps** a Nuxt UI v4 primitive (via slot pass-through) or lives as a new component. Do not restyle Nuxt UI internals directly — override via `app.config.ts` `ui.<component>.slots` classes.

### 3.1 Buttons — `UButton` override

In `app.config.ts`:

```ts
ui: {
  button: {
    slots: {
      base: 'brut font-display font-extrabold rounded-full px-6 py-3 text-base'
    },
    variants: {
      color: {
        primary: { base: 'bg-sf-blue text-white' },
        neutral: { base: 'bg-paper text-ink' },
        accent:  { base: 'bg-pop-yellow text-ink' }   // homepage "Start learning"
      }
    }
  }
}
```

Icon-only buttons get square rounding (`rounded-2xl`), not pill. Loading state: keep border and shadow static; only the inner label swaps to a spinner.

### 3.2 Cards — `UCard` override + `BrutCard` wrapper

Base `UCard`: `bg-paper-3 border-[3px] border-ink rounded-[18px] shadow-brut`.

New `BrutCard.vue` for homepage curriculum cards. Layout:

```
┌─────────────────────────┐
│ [Badge]     Section 03  │  ← hex badge top-left, section number top-right
│                         │
│  Creating Datasets      │  ← H3, display extrabold
│                         │
│  Grain, lookups vs      │  ← 2-line body clamp
│  joins, Dataset Builder │
│                         │
│  6 lessons · 42 min  →  │  ← meta + arrow, arrow slides on hover
└─────────────────────────┘
```

Six cards on the homepage, one per section. Grid: `grid md:grid-cols-2 xl:grid-cols-3 gap-6`. Each card cycles through the pop accents in badge fill order: yellow, pink, green, lilac, sky, blue.

### 3.3 Header — `app/components/AppHeader.vue`

Rebuild as: sticky, `bg-paper/95 backdrop-blur`, `border-b-[3px] border-ink`, `h-16`.

Layout: `[Logo mark] [kristi.digital-style wordmark] ────── [Nav links] [Locale switcher] [Theme toggle] [GitHub]`.

- Nav links are **pill buttons** with the `.brut` treatment, but with `--shadow-brut-sm` (smaller shadow — they're chrome, not action).
- Active route: filled `bg-sf-blue text-white`.
- Locale switcher: `USelectMenu` overridden with pill trigger. Shows current locale as a small hex badge (lilac fill).
- Theme toggle: hex badge shape, swaps sun/moon icon.

RTL: entire header mirrors via `dir="rtl"`. Shadows still cast down-right in RTL (do **not** mirror shadow direction — it would break the "light source is upper-left" mental model that carries the whole design).

### 3.4 Sidebar navigation — override `UContentNavigation`

The docs sidebar is where legibility risk is highest. Get this right.

Structure per section:
- **Section root:** hex badge (colour = section's assigned pop accent) + display-extrabold section name, in a row. Border-bottom `2px dashed ink-soft` under it.
- **Lessons under it:** plain rows, `font-body font-medium text-ink`, `py-2 px-3`.
  - Hover: `bg-paper-2`, no border change.
  - Active: `bg-ink text-paper`, `rounded-full`, no shadow (chrome, not action).

Do **not** put brutal borders and shadows on every sidebar row. That would be the design fighting the reader. Only the section root gets any decoration, and only the badge.

Sidebar container itself: `bg-paper border-r-[3px] border-ink`, sticky, scrollable, hidden below `lg:`. On mobile, opens as a slide-in sheet from the start-side (respect `dir`).

### 3.5 Content prose — override `@nuxt/content`'s prose components

Add `app/components/content/Prose*.vue` overrides for every prose element. Key ones:

- **`ProseH1`:** display-extrabold, `mb-2`, followed by a `2px solid ink` divider `w-16` — a small hard rule under every page title. That's the whole treatment.
- **`ProseH2`:** wrapped in a flex row with an auto-generated hex badge on the left (colour derived from the section the page belongs to). H2 text sits next to it, display-extrabold.
- **`ProseH3` / `ProseH4`:** no decoration, just weight and size. Restraint.
- **`ProseP`:** body class from §1.2. **Line length caps at 72ch via the container, not per-paragraph.**
- **`ProseA`:** `text-sf-blue underline decoration-[2px] decoration-sf-blue underline-offset-[3px] hover:decoration-ink`. Never bare — links must always underline (a11y + brutalist honesty).
- **`ProseUl` / `ProseOl`:** custom markers. `ul` uses a small filled ink square (`■`) as marker via `::marker`. `ol` uses display-black number in `text-sf-blue`.
- **`ProseBlockquote`:** left border `4px solid pop-pink`, `bg-paper-2`, `p-6 rounded-r-[18px]`, no shadow (it's inline content, not a card). Body italic **off** — italics kill readability in Inter at this size; use weight 500 instead.
- **`ProseHr`:** replace default rule with the "hex-badge-in-a-line" separator — `── ⬢ ──` — the badge is dinky (16px), ink-outline only, no fill. Signals section break.
- **`ProseTable`:** all borders 2px ink, no zebra striping (busy), header row `bg-sf-navy text-paper font-display font-extrabold uppercase text-xs tracking-wider`. Rounded outer corners `18px`. Overflow-x on mobile with `--shadow-brut-sm` on the scroll container so the reader knows it scrolls.
- **`ProseImg`:** always wrapped in a 3px ink border + `--shadow-brut` frame + `rounded-[18px]`, with a caption slot below in `text-sm text-ink-soft`.

### 3.6 Code blocks — override `ProsePre` and `ProseCode`

This is a Salesforce SAQL curriculum. Code is content, not decoration.

- **Inline `code`:** `bg-pop-yellow/40 text-ink font-mono text-[0.95em] px-1.5 py-0.5 rounded-md border border-ink`. Yellow highlight, ink hairline. Reads like a marker in text.
- **`ProsePre` (block):**
  - Wrapper: 3px ink border, `--shadow-brut`, `rounded-[18px]`, `bg-ink`, `text-paper`.
  - Header strip: sits above the code, `bg-paper border-b-[3px] border-ink px-4 py-2`, shows language name in badge eyebrow style on the left, and a copy button on the right (pill `.brut`, `bg-pop-green text-ink`, label "Copy" → "Copied ✓" on click).
  - Line numbers: on, in `text-ink-soft/60`.
  - Syntax highlighting: use Shiki with the `github-dark` theme, but **remap** these token colours so they harmonise with the palette: keywords → `--color-sf-sky`, strings → `--color-pop-green`, comments → `#8B94A8`, numbers → `--color-pop-yellow`, functions → `--color-pop-pink`. Configure in `nuxt.config.ts` under `content.build.markdown.highlight.themes`.

### 3.7 Callouts / MDC components — `::note`, `::tip`, `::warning`, `::danger`, `::interview`

Under `app/components/content/`, create one component per variant. All share a base `BrutCallout.vue`:

```
[Hex badge with icon]   TITLE (badge eyebrow style)
────────────────────────────────────────
Body content, prose classes.
```

- 3px ink border, `--shadow-brut-sm`, `rounded-[18px]`, `p-5 md:p-6`.
- Left-side accent bar `w-1.5` in the variant's colour, running full height.
- Variant colour mapping: `note → sf-sky`, `tip → pop-green`, `warning → pop-yellow`, `danger → danger`, `interview → pop-pink` (uses the conversation-bubble frame from §2.3 instead of a plain rectangle).

Author usage in Markdown:
```md
::tip{icon="i-lucide-lightbulb"}
Use `q = load "opportunity";` as your baseline SAQL query.
::
```

### 3.8 Video player — the existing custom player

The player is already privacy-preserving (iframe only on click). Keep that behaviour untouched. Restyle the poster / play surface only:

- Frame: 4px ink border, `--shadow-brut-lg`, `rounded-[28px]`, aspect-video.
- Poster overlay: dim to 35% ink.
- Play button: circular, 96px, `bg-pop-green`, 4px ink border, `--shadow-brut`. Icon: filled ink play triangle. On hover: `.brut` press behaviour scaled up (`translate(-2px, -2px)`, shadow to `10px 10px`).
- Below the player: small row of chunky metadata pills (duration, section, language) — `.brut` pills with `--shadow-brut-sm`, cycling pop colours.

### 3.9 Interview prep Q&A — `::interview` + accordion

Wrap `UAccordion` with `BrutAccordion.vue`:
- Each item: conversation-bubble frame from §2.3, pop-pink accent bar.
- Question row (trigger): display-bold, ink, with a chunky `[+]` / `[−]` toggle in a hex badge on the right.
- Answer row (content): body prose classes, `pt-4` after a `2px dashed ink-soft` divider.

Emit `FAQPage` JSON-LD unchanged — the redesign does not touch structured data.

### 3.10 Dashboard showcase cards — `app/components/ShowcaseCard.vue`

Use the "lens frame" motif from §2.3.
- Card: 3px ink border, `--shadow-brut`, `rounded-[18px]`, `bg-paper-3`.
- Corner brackets in ink drawn as absolutely positioned SVGs at each corner (inside the border, `inset-3`).
- Screenshot at top, `rounded-[10px]`, 2px ink border.
- Below: title (display-extrabold), one-line pitch, three filter chips (business area / difficulty / technique) as small `.brut` pills each in a different pop colour.
- Hover: `.brut` press behaviour on the whole card.

Grid: `grid md:grid-cols-2 xl:grid-cols-3 gap-8`.

### 3.11 Forms & inputs — `UInput`, `USelectMenu`, `UTextarea`

Consistent treatment across all inputs:
- `bg-paper-3 border-[2px] border-ink rounded-[10px] px-4 py-2.5 font-body text-ink`.
- Focus: `outline-none ring-0`, border colour switches to `sf-blue`, add a `3px 3px 0 0 sf-blue` shadow (mini brutal focus ring — visible and brand-consistent).
- Placeholder: `text-ink-soft/60`.
- Labels above inputs, badge-eyebrow style.
- Error state: border `danger`, `3px 3px 0 0 danger` shadow, error text below in `text-sm text-danger font-medium`.

### 3.12 Search — `UContentSearch` / command palette

Palette modal: 4px ink border, `--shadow-brut-lg`, `rounded-[28px]`, `bg-paper`. Search input inside uses §3.11 style. Result items styled like sidebar rows (§3.4) — no per-row borders, active row fills `bg-ink text-paper` `rounded-full`.

### 3.13 Footer — `app/components/AppFooter.vue`

`bg-sf-navy text-paper border-t-[4px] border-ink`, `py-16`. Two halved-shape decorations bleeding off the top corners (§2.1) in pop-pink and pop-yellow, both with 3px ink stroke — they visually stitch the footer to the body above it.

Contents: three columns (Curriculum / Community / Meta), locale switcher again, licence line, "Built with Nuxt" credit. All text uses `text-paper` and `text-paper/70` for secondary — no pop colours inside the footer body.

---

## 4. Dark mode

Not "invert everything." A separate palette:

```css
[data-theme="dark"] {
  --color-paper:    #0A0F1C;
  --color-paper-2:  #111827;
  --color-paper-3:  #1B2333;
  --color-ink:      #F5ECD7;   /* ink and paper swap semantic role */
  --color-ink-soft: #C9BFA8;
}
```

Pop accents **stay identical** in dark mode — that's the through-line. Shadows in dark mode change from `ink` to `#000` at 80% opacity, offset unchanged. Hex badges and callout accents look correct because their fills are pop colours, not ink.

Test every callout, code block, and card in both modes before shipping.

---

## 5. RTL (`ar`, `ur`)

- Root `<html>` gets `dir="rtl"` when locale is `ar` or `ur` (already handled by `@nuxtjs/i18n`).
- All positional utilities: use logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`, `border-s-`, `border-e-`) — never `pl-`, `pr-`, `left-`, `right-` inside components.
- Hex badges: no flip needed (rotationally symmetric).
- **Halved-shape decorations: mirror horizontally in RTL** — a shape bleeding off the right in LTR must bleed off the left in RTL. Handle inside `BrutShape.vue` with a `useI18n().rtl` check.
- **Shadows do NOT mirror** — see §3.3. Consistent light source across locales.
- Arrows in "next lesson" links flip. Chevrons flip. Play triangle on the video does not flip.

---

## 6. Accessibility floor

Non-negotiable:
- All interactive elements: visible focus ring — the `3px 3px 0 0 sf-blue` mini brutal focus from §3.11 is the universal focus style. Apply globally via `:focus-visible`.
- Colour contrast: verify every pop-accent-on-ink and ink-on-pop-accent pair against WCAG AA. Pop-yellow on ink passes; ink on pop-yellow passes for large text only — never use ink-on-yellow for body copy, only for badge labels.
- `prefers-reduced-motion: reduce` disables the `.brut` translate and any bleeding-shape entrance animations.
- Every icon-only button gets an `aria-label`.
- Sidebar keyboard navigation: arrow keys move between rows, `Enter` navigates, `Esc` closes on mobile.
- The video player must remain fully keyboard-operable; the play button is a real `<button>`, not a `<div>`.

---

## 7. Files to touch (rough inventory)

Do not create files you do not need. Modify existing ones where they exist.

**New:**
- `app/components/brut/BrutBadge.vue`
- `app/components/brut/BrutCard.vue`
- `app/components/brut/BrutCallout.vue`
- `app/components/brut/BrutAccordion.vue`
- `app/components/brut/BrutButton.vue` *(only if `UButton` overrides prove insufficient)*
- `app/components/deco/BrutShape.vue`
- `app/components/deco/LensFrame.vue`
- `app/components/deco/ConversationBubble.vue`
- `app/components/ShowcaseCard.vue`
- `app/components/content/ProseH1.vue`, `ProseH2.vue`, `ProseA.vue`, `ProseBlockquote.vue`, `ProseTable.vue`, `ProseImg.vue`, `ProsePre.vue`, `ProseCode.vue`, `ProseHr.vue`, `ProseUl.vue`, `ProseOl.vue`
- `app/components/content/Note.vue`, `Tip.vue`, `Warning.vue`, `Danger.vue`, `Interview.vue` *(MDC callouts)*

**Modify:**
- `app/assets/css/main.css` — `@theme` block with tokens from §1
- `app.config.ts` — Nuxt UI v4 `ui.<component>` slot overrides
- `nuxt.config.ts` — `@nuxt/fonts` module + Shiki theme remap
- `app/components/AppHeader.vue` (or existing header) — §3.3
- `app/components/AppFooter.vue` — §3.13
- `app/layouts/default.vue` and any `docs` layout — grid from §1.4, background paper colour, decorative shapes on empty margins on `xl:` only
- `app/pages/index.vue` — hero + 6 curriculum cards
- Existing video player component — poster/play surface only (§3.8), leave click-to-iframe logic alone

**Do NOT touch:**
- `content/**` — no rewrites of lesson Markdown for this pass
- `server/routes/raw/**` — raw output stays plain
- `i18n/locales/**`
- Translation pipeline, deploy workflow, JSON-LD emitters
- `.nojekyll` handling and CNAME
- Any Supabase-related historical files

---

## 8. Phased plan — ship in this order, don't skip

### Phase 0 — Tokens & foundations (before any component work)
1. Add fonts via `@nuxt/fonts`.
2. Write the `@theme` block in `main.css` with every token from §1.
3. Add the `.brut` utility class + `:focus-visible` style + `prefers-reduced-motion` reset in `main.css`.
4. Set `app.config.ts` `ui.colors.primary = 'sf-blue'`, `ui.colors.neutral = 'ink'`.
5. Verify: dev server renders in warm cream with Archivo H1s and Inter body. Do not proceed until this is right.

### Phase 1 — Signature system
1. Build `BrutBadge.vue`, `BrutShape.vue`, `LensFrame.vue`, `ConversationBubble.vue`.
2. Drop one of each on a scratch page to eyeball proportions before wiring them into real components.

### Phase 2 — Chrome (header, sidebar, footer)
1. `AppHeader.vue` per §3.3.
2. `UContentNavigation` overrides per §3.4 — this is the highest-risk piece for readability; test with a real long section (Foundations has the most lessons).
3. `AppFooter.vue` per §3.13.

### Phase 3 — Content styling
1. All `Prose*` overrides per §3.5.
2. `ProsePre` / `ProseCode` + Shiki remap per §3.6.
3. All MDC callouts per §3.7.
4. Interview accordion per §3.9.

### Phase 4 — Cards, forms, video
1. `BrutCard`, `ShowcaseCard` per §3.2 and §3.10.
2. Form styling per §3.11.
3. Video poster restyle per §3.8.
4. Search palette per §3.12.

### Phase 5 — Homepage
1. Hero: display-hero H1 ("Master Salesforce CRM Analytics." or similar — keep it a plain statement, no marketing verbs). Subhead in body-large. Two buttons: primary "Start learning" (sf-blue), secondary "See the curriculum" (paper).
2. Six curriculum `BrutCard`s.
3. Three halved-shape decorations at page edges (max).
4. No testimonial slabs, no logo walls, no "join thousands of learners" — this is not a marketing site.

### Phase 6 — QA pass
1. Dark mode on every page.
2. RTL on `ar` — spot-check every component.
3. Lighthouse: performance, a11y ≥ 95.
4. Read a full lesson end-to-end at normal reading speed. If any part of the design pulled your eye off the text more than once, that part is wrong — fix it.
5. `pnpm lint && pnpm typecheck && pnpm generate` clean.

---

## 9. Copy voice (for any new UI microcopy you write)

- Sentence case everywhere except badge eyebrows and hero display.
- Buttons name the outcome: "Start learning", "Open lesson", "Copy SAQL", "Watch (14 min)". Not "Submit", not "Click here".
- Empty states are directive: "No lessons match this filter. Clear filters or try another section." — not cute, not apologetic.
- Errors say what happened and what to do: "Search is offline. Refresh the page or browse the sidebar."
- Never call the user "you guys" or "learner". Just "you".

---

## 10. Definition of done

- Every route renders with the new tokens applied — no un-styled Nuxt UI defaults visible.
- No inline styles, no arbitrary Tailwind values that duplicate a defined token.
- Contrast checked, focus visible, reduced-motion respected, RTL correct.
- Dark mode toggle works on every page.
- A lesson page reads *better* than before, not worse. If it reads worse, the design failed regardless of how good it looks.