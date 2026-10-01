# content-assets

Reusable creative kit for CRM Analytics Academy, drawn in the site's **Blueprint** language
(paper `#F4F7FB`, ink `#0C1B33`, navy `#0F2A5C`, signal `#2F5BEA`, tide `#3D8BD9`, frost `#A8CCF2`,
ice `#DDEBFA`, glow `#3FC6DC`; Schibsted Grotesk and IBM Plex Mono). For video editing, thumbnails,
social posts and slides.

This folder is **not** part of the site build: lessons live in `content/` (Nuxt Content) and served
files in `public/`. Nothing here is shipped to the website.

## Rebuild

```bash
node content-assets/build.mjs     # backgrounds, video stills, brand, project images (SVG + PNG)
node content-assets/motion.mjs    # Premiere overlays (ProRes 4444 .mov with alpha) — after build.mjs
node scripts/lesson-slides.mjs /saql/grouping-and-windowing   # a slide deck for any lesson
```

Needs `rsvg-convert` (`brew install librsvg`) and `ffmpeg` (`brew install ffmpeg`); no npm packages.
Every file is regenerated from `build.mjs`: **edit the script, not the outputs**. SVG is the source for
each image; PNGs are renders of it. SVGs name the fonts with system fallbacks, so install Schibsted Grotesk
and IBM Plex Mono (Google Fonts) for exact type.

## What's inside

| Folder | File | Size | Use |
|---|---|---|---|
| `backgrounds/` | `graph-paper-{light,navy}-1920x1080` | 1920×1080 | Video / slide background |
| | `graph-paper-{light,navy}-3840x2160.svg` | 4K | SVG only: scales losslessly; export at 4K from any editor |
| | `graph-paper-{light,navy}-1080x1920` | 1080×1920 | Shorts, Reels, Stories |
| | `graph-paper-{light,navy}-1080x1080` | 1080×1080 | Square social posts |
| | `desk-{light,navy}-1920x1080` | 1920×1080 | Sheet with rulers and crop marks around a safe area |
| `video/` | `lower-third` | 1920×1080, transparent | Speaker name and role, bottom left |
| | `title-card` | 1920×1080 | Lesson opener: lesson code, title, one-line lead |
| | `chapter-card` | 1920×1080 | Section divider: big number and title on navy |
| | `end-card` | 1920×1080 | Closing CTA to crmanalytics.imswarnil.com |
| | `next-lesson-overlay` | 1920×1080, transparent | "Next lesson" and Subscribe box, top right |
| | `thumbnail-1280x720` | 1280×720 | YouTube thumbnail template |
| | `loop-graph-paper-navy-1920x1080.mp4` | 1920×1080, 4 s, 30 fps | Seamless looping background (moves one grid cell per loop) |
| `brand/` | `logo-mark.svg`, `logo-mark-512.png`, `logo-mark-1024.png` | square, transparent | The three-bar mark |
| | `logo-mark-on-paper`, `logo-mark-on-navy` | 512×512 | Mark on a solid background |
| | `wordmark`, `wordmark-on-navy` | 960×240 | "CRM Analytics" with "Academy" |
| `project/` | `og-{home,curriculum,pricing,showcase}` | 1200×630 | Social / Open Graph cards |
| | `sections/<NN.section>` | 1600×900 | One cover per course section, titled from its `.navigation.yml` |

The templates carry placeholder text ("Lesson title", "Section title"). Change the text in the SVG, or
duplicate the template function in `build.mjs` and add your own.

## After Effects — native, editable comps

`after-effects/` builds the kit **inside After Effects** as real shape and text layers, so every colour,
word, font and keyframe is editable (nothing is a flattened image).

| File | What it does |
|---|---|
| `build-brand-kit.jsx` | **File → Scripts → Run Script File…** Builds 8 comps in a "CRM Analytics Academy — Brand Kit" folder: `BG — Graph Paper` (navy and paper), `Crop-Mark Frame`, `Title Card`, `Chapter Card`, `Lower Third`, `Subscribe · Next Lesson`, `End Card`. |
| `brand-kit.config.json` | Colours, fonts (PostScript names, first installed wins), comp size/fps, durations and every placeholder string. Edit it, run the script again — comps of the same name are replaced, your own comps are untouched. |
| `import-lesson-slides.jsx` | Run it, pick a deck's `slides.json` (below). Builds `Lesson — <title>`: one layer per slide PNG, timed from the deck, 0.5 s crossfades, a comp marker per slide holding its speaker notes, and a disabled guide text layer with each slide's title. |
| `lib.jsxinc` | Shared helpers (shapes, text, easing), included by both scripts. |

How the pieces are built, so you know where to edit:

- **Grid** — one shape layer, four groups. Each group is a single line with a **Repeater**; change the
  spacing in *Repeater → Transform → Position*, the count in *Copies*. Rulers work the same way.
- **Text** — point text layers; retype in the comp or change font/size/tracking in the Character panel.
  Title Card and Chapter Card are precomps of the background, so a new background colour flows through.
- **Animation** — position + opacity keyframes with easy ease. Lower Third and the overlay animate out
  0.5 s before the comp ends: extend the comp and drag the last two keys to retime.
- **Fonts** — install [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk) and
  [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono). Without them After Effects
  substitutes; the layers stay editable and you can swap fonts later.

## Premiere Pro — drop-in overlays

`premiere/` holds transparent **ProRes 4444** clips (1920×1080, 30 fps, straight alpha). Import them and put
them on a track **above** the footage — no keying or blend mode needed.

| File | Length | Motion |
|---|---|---|
| `lower-third-5s.mov` | 5 s | slides in from the left, holds, slides out |
| `subscribe-next-lesson-6s.mov` | 6 s | slides in from the right, top-right card |
| `crop-frame-frost-3s.mov` / `crop-frame-ink-3s.mov` | 3 s | "+" safe-area marks fade in/out — frost for dark footage, ink for light |
| `crop-frame-*.png` / `.svg` | still | the same marks as a still; stretch it to any length |

To change the lower-third text, edit `video/lower-third.svg` (or the template in `build.mjs`), then run
`build.mjs` and `motion.mjs` again — or build it in After Effects with `build-brand-kit.jsx` and export
with *Render Queue → QuickTime → Apple ProRes 4444, RGB + Alpha*. For a longer hold in Premiere, add a
frame hold (*right-click → Frame Hold Options*) or rebuild with a longer `duration` in `motion.mjs`.

## Lesson → slide deck

```bash
node scripts/lesson-slides.mjs /introduction/set-up-your-org
node scripts/lesson-slides.mjs content/en/07.saql/05.grouping-and-windowing.md --out content-assets/slides
```

Reads the **English** lesson and writes `slides/<section>--<lesson>/`:

| Output | |
|---|---|
| `NN-<type>.svg` + `.png` | 1920×1080 slides. Types, in order: `title` → `learn` (the `##` headings) → one `concept` per `##` (≤3 bullets from its first sentences) → `example` per code block (SAQL/JSON tagged) → one `lab` per `walkthrough.shots` entry (step, click path, on-screen text) → `quiz` (up to 3) → `recap` → `end` (next lesson + site). |
| `slides.json` | order, type, title, file, start, **suggested duration** (lab = the shot's `seconds`, concept ≈ prose length) and speaker notes. Read by `import-lesson-slides.jsx`. |
| `notes.md` | speaker notes per slide — the lesson prose and the walkthrough's `say` lines, ready for a voice-over. |
| `premiere-timeline.xml` | **Premiere Pro → File → Import** gives a sequence of the PNGs at those durations with a marker per slide. Paths are absolute; if you move the folder, Premiere asks to relink — point it at the same folder. |

Examples already generated: `introduction--set-up-your-org` (19 slides, labs from the walkthrough),
`saql--grouping-and-windowing` (SAQL example + quiz), `revops-analytics--arr-waterfall-and-nrr`
(a GTM build: labs + quiz). Edit a slide's SVG and re-render it with
`rsvg-convert -f png -o NN-x.png NN-x.svg`, or change text on top in After Effects.

**What is editable where:** SVG sources — any vector editor (Illustrator, Figma, Inkscape) or a text
editor; After Effects — everything built by the `.jsx` scripts, natively; Premiere — the ProRes overlays
(position, scale, timing) and the imported slide sequence (durations, transitions, markers).

## Licence

Original work for this project, released under the repository's [MIT licence](../LICENSE). It contains no
Salesforce trademarks or third-party artwork.
