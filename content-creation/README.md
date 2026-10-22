# Lesson videos in Final Cut Pro

This folder holds everything needed to turn a lesson into a video in Final Cut Pro (FCP):
the CRMA template kit, the scripts that build it, a generator that writes an FCP project
from a lesson's markdown, and the edited Lesson 01 as a reference.

```
content-creation/
├── lesson.mjs            pnpm fcp <route>: lesson markdown → FCPXML project + shot list
├── kit/                  the installable CRMA Kit (107 Motion templates, music, Install.command, Guide.html)
├── source/               the Python generators that built kit/ (see source/README.md)
└── projects/
    ├── lesson-01-developer-org/   the hand-edited Lesson 01 (reference; media/ is gitignored)
    └── <slug>/                    what pnpm fcp writes
```

## The workflow

1. **Fonts, once.** Install [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk)
   and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono). Without them FCP
   substitutes Helvetica.
2. **Kit, once and after every kit change.** Quit FCP, then double-click `content-creation/kit/Install.command`
   (right-click → Open if macOS blocks it). It copies every `CRMA-*` folder into
   `~/Movies/Motion Templates.localized/`.
3. **Generate the project.**
   ```bash
   pnpm fcp introduction/set-up-your-org             # a route
   pnpm fcp content/en/07.saql/02.saql-when-clicks-run-out.md   # or a path
   pnpm fcp --catalog quiz                           # the text fields of any CRMA title
   ```
   This writes `content-creation/projects/<slug>/<slug>.fcpxml` and `<slug>.md`, the recording script.
   The slug is section number, lesson number and name, for example `00-05-set-up-your-org`.
4. **Record** each shot in the `.md`. Name the files `Step 01 - ….mov` as the script lists them,
   and keep them in `content-creation/projects/<slug>/media/`, which is gitignored.
5. **Import.** In FCP choose File → Import → XML… and pick the `.fcpxml`. You get the event
   **CRMA Lessons** with one project, and FCP asks which library to put it in.
6. **Drop the recordings in.** Every `REC 01 — …` block on the timeline is a gap with its step
   lower third and "on screen" callout connected above it. A to-do marker on each gap holds the
   narration. Drag the recording onto the gap and choose **Replace**. The connected titles stay
   attached. Trim, then add a CRMA transition at each cut.
7. **Export.** File → Share → Master File: H.264, 1920×1080, 30 fps.
8. **Upload to YouTube.** The chapter markers are set for every step, the quiz and the summary.
   For YouTube chapters, copy their times into the description.
9. **Link it.** Add the id to the **English** lesson's frontmatter only:
   ```yaml
   video:
     id: dQw4w9WgXcQ
   ```
   Commit and push. The other 11 locales inherit it.

## What `pnpm fcp` builds

A 1920×1080, 30 fps project in FCPXML 1.11. It validates against FCP's own
`FCPXMLv1_11.dtd`. FCP 10.7 or later imports it.

| # | Spine | Template | Text taken from |
| --- | --- | --- | --- |
| 1 | Intro, 8 s | Intros / Academy Intro + *CRMA Academy Intro (8s)* | (template default) |
| 2 | Lesson card, 6 s | Slides / Title Slide | `MODULE NN — <section .navigation.yml title>`, `title` split over two lines, `Lesson NN · N steps` |
| 3 | Agenda, 7 s (2+ segments) | Slides / Agenda | the first 5 shots and their lengths |
| 4 | One gap per segment | (your recording) + Lower Thirds / Lesson Number Bar (lane 1) + Lessons / Note (lane 2, only when `onscreen` is set) | `walkthrough.shots[]`: `shot`, `onscreen`, `seconds` (default 30, or `--seconds`) |
| 5 | Quiz, 10 s each, up to 3 | Slides / Quiz | `quiz[].q`, three of the `options` (the right one is always kept); a marker names the answer |
| 6 | Summary, 7 s (3+ segments) | Slides / Summary | first, middle and last shot |
| 7 | Up next, 5 s | Lessons / Up Next | the next lesson's navigation title |
| 8 | End screen, 8 s | End Screens / Become a Member + *CRMA Outro Sting (6s)* | (template default) |

A lesson without a `walkthrough` gets one segment per `##` heading instead. Under the whole
lesson runs *CRMA Lesson Bed (Loop 32s)*, looped at −20 dB. Where two titles meet there is a
CRMA transition. The music clips are connected to the intro, as in the Lesson 01 edit. If you
re-time the timeline a lot, re-time the music too.

How text reaches the templates: an FCPXML title takes one `<text>` per text layer, in layer
order. `lesson.mjs` reads every layer straight out of the kit's `.moti` file: its name, default
text, font, size, colour and alignment. It then writes all of them, with your text in the ones
it fills, styled exactly as the template styles them. A template edit therefore flows through
without touching the script. The quiz answer is the one thing it cannot set: it is a published
**Show Answer** pop-up, so you pick A, B or C in the Inspector, as the marker says.

## The template catalogue

`kit/Guide.html` lists every template with its controls. There are 93 generic templates in the
Guide, plus 14 baked for Lesson 01:

| Browser | Folder | Count | What |
| --- | --- | --- | --- |
| Titles | CRMA-Intros | 3 | Academy Intro (8 s), Intro Short (4 s), Intro Navy, each timed to its music |
| Titles | CRMA-Slides | 14 | Title slide, agenda, bullets, two column, icon cards and grid, process flow, big numbers, query block, query + result, quiz, summary, image + text, slide intro |
| Titles | CRMA-Lessons | 12 | Lesson opener and introduction, step card, bullet card, checklist, icon card, note, pro tip, warning, query card, recap, up next |
| Titles | CRMA-Lower Thirds | 10 | Instructor, guest, name rule, reveal name, topic tag, now topic (loop), source credit, icon lower third, lesson number bar, member promo bar |
| Titles | CRMA-Titles | 10 | Sheet title, section header, definition, formula, key takeaway, quote, reveal title, stacked reveal, icon title, floating badge |
| Titles | CRMA-Scenes | 5 | Course intro, module title, section divider, KPI figure, lesson outro |
| Titles | CRMA-Screen Capture | 5 | Click marker, highlight box, number badge, pointer label, shortcut keys |
| Titles | CRMA-End Screens | 5 | Become a member, membership perks, end screen subscribe, two videos, course complete |
| Titles | CRMA-Episode 01 | 14 | Lesson 01's own copies of the slides and callouts, text baked in (`source/kit/make_ep01.py`) |
| Transitions | CRMA-Transitions | 11 | Block sweep, sheet wipe, sheet slide, grid reveal, card stack, tile grid, iris, push blur, blinds, blueprint zoom, signal flash |
| Generators | CRMA-Backgrounds | 3 | Graph paper, graph paper navy, drawing sheet |
| Generators | CRMA-Elements | 3 | Countdown, logo bug, progress bar |
| Effects | CRMA-Effects | 7 | Slow push in, blueprint tint, graph overlay, drawing sheet frame, navy vignette, signal glitch, webcam box |
| Effects | CRMA-Screen Capture | 5 | Blueprint window, figure frame, side panel, spotlight, zoom to detail |

**Music** (`kit/Music/`, AAC `.m4a`): Academy Intro (8 s) and Short (4 s), Outro Sting (6 s),
Lesson Bed (32 s seamless loop), and SFX Click, Pop, Whoosh, Riser and Logo Hit. All of it is
original and royalty-free. The 24-bit `.wav` masters are not committed. Rebuild them with
`source/kit/make_music.py` (gitignored), or copy them from the Desktop original.

## Blueprint, on a 1080p frame

The values come from `tokens/tokens.json`, which mirrors `app/assets/css/main.css`:

| Token | Hex | Use |
| --- | --- | --- |
| paper | `#F4F7FB` | Slide background |
| card | `#FBFCFE` | Cards |
| ink | `#0C1B33` | Text, 1.5px (3px at 1080p) borders, hard shadows |
| ink2 | `#4A5B78` | Secondary text |
| line | `#C3D2E6` | Hairlines, graph paper |
| navy | `#0F2A5C` | Dark bands, navy intro |
| signal | `#2F5BEA` | **The** accent, used once per frame |
| ice | `#DDEBFA` | Highlight fill |
| glow | `#3FC6DC` | Cyan labels on navy |

- **Schibsted Grotesk** for anything you read: Black and ExtraBold headlines with tight
  tracking, Bold and SemiBold body.
- **IBM Plex Mono Medium** for anything that labels: eyebrows (`FIG. 01 —`), meta, code,
  all caps with wide tracking.
- Corners are square. Shadows are hard (10 px offset, no blur). Graph paper has a 24 px grid.
  Keep text 96 px inside every edge.

## Lesson 01, the reference edit

`projects/lesson-01-developer-org/lesson-01-developer-org.fcpxml` is the hand-edited first
lesson, *Free CRM Analytics Developer Org*, in FCPXML 1.14, so it needs the FCP version that wrote it or a later one. It also needs the
`CRMA-Episode 01` titles, which Install.command installs. It corresponds to the
lesson `introduction/set-up-your-org`, so compare it with `pnpm fcp introduction/set-up-your-org`.

Its media lives in `projects/lesson-01-developer-org/media/`, which is **gitignored** (~396 MB:
`Step 1 … Step 5 .mov`, `Soundtrack.wav`, the exported `.mp4` and the raw screen recording).
Those files are APFS clones of the Desktop originals, so they take no extra disk space. The
`.fcpxml` points at that folder by absolute path. On another machine, or if the folder moves,
import the project and use File → Relink Files…. In the file, `src` URLs have to be absolute
`file://` URLs, which is why they are not relative.

## Where the originals are

| What | Desktop original |
| --- | --- |
| The kit as first built | `~/Desktop/CRMA Kit/` (also has the `.wav` masters) |
| The generator scripts | `~/Desktop/FCP Kit/_source/kit/` (`make_crma*.py`, `make_ep01.py`, `make_music.py` and the helpers they import) |
| Lesson 01 project, media, export | `~/Desktop/CRMA Academy/` |

`~/Desktop/FCP Kit/` itself is the generic "Custom -" creator kit. Only its CRMA sources were
brought here.
