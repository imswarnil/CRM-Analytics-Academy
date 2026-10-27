# Lesson videos in Final Cut Pro

This folder holds everything needed to turn a lesson into a video in Final Cut Pro (FCP):
the CRMA template kit, the scripts that build it, a generator that writes an FCP project
from a lesson's markdown, and the edited Lesson 01 as a reference.

```
content-creation/
├── lesson.mjs            pnpm fcp <route>: lesson markdown → FCPXML project + shot list
├── session.mjs           pnpm session …: your recordings → an edited FCPXML project (see "Recording sessions")
├── fcp-shared.mjs        what both share: the CRMA template catalogue, FCPXML time, the <title> writer
├── obs/install.mjs       pnpm obs:install: the "CRMA Recording" OBS profile and scene collection
├── obs/lesson.mjs        the words the OBS texts start with (from a session.yml)
├── obs/fonts.py          static CRMA Grotesk cuts of Schibsted Grotesk, so OBS can draw Black/ExtraBold
├── tools/faces.swift     face detection (macOS Vision) that tells camera takes from screen takes
├── sessions/             GITIGNORED: inbox/ (where OBS records) and one folder per recording session
├── music/                GITIGNORED: music beds for sessions (public/music/ is read too)
├── kit/                  the installable CRMA Kit (165 Motion templates, music, Install.command, Guide.html)
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
   (right-click → Open if macOS blocks it). It copies one `CRMA` folder into each of the Titles,
   Transitions, Generators and Effects folders of `~/Movies/Motion Templates.localized/`, and
   removes the `CRMA-*` folders the kit used to be split into.
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

## Recording sessions (face + screen → edited project)

For lessons recorded rather than scripted: you talk to camera, share your screen, add illustrations,
and the edit is assembled for you. Every step leaves something you can change by hand.

1. **OBS, once.** Quit OBS, run `pnpm obs:install` (or `pnpm obs:install <session>` to start the texts
   with that session's title), open OBS and pick **Profile → CRMA Recording** and **Scene Collection →
   CRMA Recording**. Everything in it is native OBS and editable in OBS:
   - **Scenes:** CRMA · Title (⌃⌥⌘0), CRMA · Camera (⌃⌥⌘1), CRMA · Screen (⌃⌥⌘2), CRMA · Screen + Camera (⌃⌥⌘3).
   - **Components**, listed after them, each a scene the four nest: CRMA ◆ Paper, Logo, Brand, Name Card,
     Live Tab, Window Bar, Lesson Column and Marks. Change one and every scene that uses it changes.
   - **Shapes** are Color sources, **words** are Text sources in CRMA Grotesk (static cuts of Schibsted
     Grotesk the installer adds to your fonts) and IBM Plex Mono. The lesson's words — *Lesson Title*,
     *Lesson Eyebrow*, *Name*, *Role*, *Address* — are one source each, shared by every scene: double-click
     one, type, and every scene shows it. Only the graph paper is an image.
   - **Transitions:** CRMA Paper (through the paper colour), CRMA Fade (default), CRMA Slide, CRMA Swipe,
     CRMA Wipe in the Scene Transitions dock; CRMA · Title leaves through CRMA Paper (its Transition Override).
   ⌃⌥⌘R starts and stops recording: 1080p30 `.mov` into `content-creation/sessions/inbox/`, with noise
   suppression, a compressor and a limiter on the mic. Running the installer again rebuilds the collection
   (your edits in OBS are replaced; the old file is kept as a `.bak-…` next to it).
2. **A session per lesson.** `pnpm session new window-functions --title "Window functions in SAQL"`
   makes `sessions/window-functions/` with `camera/ screen/ images/ voiceover/` and a `session.yml`.
   Retitle the lesson in OBS by editing the *Lesson Title* and *Lesson Eyebrow* texts.
3. **Record.** One take per thought: switch scene, ⌃⌥⌘R, talk or demo, ⌃⌥⌘R. Order is kept by the
   timestamp OBS puts in each file name.
4. **Import.** `pnpm session import window-functions` moves the new takes out of the inbox. Video goes to
   `camera/` when a large face is in at least two of five sampled frames, otherwise to `screen/`, so
   *Screen + Camera* takes count as screen. Images go to `images/`, audio to `voiceover/`. If a guess is
   wrong, move the file yourself. You can also drop files straight into the folders.
5. **Build.** `pnpm session build window-functions --open`. The first build writes the timeline into
   `session.yml` in recording order, images last. Retitle entries there (titles become chapters, step bars
   and topic tags), reorder or delete them, add `voiceover:`, `in:`/`out:` or `jump_cuts: false`, and build
   again. `--open` imports the result into Final Cut Pro.

What the build does:

| Part | How |
| --- | --- |
| Intro | Intros / Lesson Intro (or Navy) with `title`, `eyebrow`, `level` and the length it measures, plus the 8 s intro music |
| Camera takes | Trimmed to the speech; pauses longer than `max_pause` (0.8 s) are cut out as jump cuts |
| Screen takes | Trimmed by `trim` (0.6 s) at both ends, or to the speech, and keep their pauses |
| Lower thirds | Off by default, because the CRMA OBS scenes already put your name card and the lesson title in every take. `name_card: true` adds the Instructor Card and Topic Tags, and `step_bars: true` adds a STEP n OF N bar on each screen take, for takes recorded without the CRMA scenes. `screen_style: window` adds the Blueprint Window effect to bare screen takes |
| Voice-over | A file in `voiceover/` with the clip's name (or `voiceover:` on the entry) is laid under the clip, and the clip's own sound is muted. A screen take with no speech and no voice-over gets a to-do marker: record one in Final Cut Pro (Window → Record Voiceover) |
| Images | On Graph Paper at 82 %, with a Source Credit caption `FIG. nn —` and the title, for `seconds` (6) |
| Transitions | A CRMA transition wherever the kind of shot changes, if both sides have media to overlap |
| Music | `music:` from `content-creation/music/` or `public/music/` (`auto` = the first file), looped under the lesson. It fades in after the intro, sits at `music_level` (−14 dB), and is keyframed down to `duck_level` (−28 dB) under every stretch of speech, measured with ffmpeg's silencedetect. It fades out into the outro sting |
| Outro | `thanks`, `navy`, `next` (with `next:` and `progress:`) or `minimal` |
| Chapters | Every entry is a chapter marker. `chapters.txt` has them as YouTube timestamps, and `edit.md` lists every shot with what was cut |

Audio analysis is cached in `sessions/<slug>/.cache.json`, so later builds are instant. Needs ffmpeg
(`brew install ffmpeg`). `import` compiles `tools/faces.swift` once, which needs Xcode or the Command
Line Tools. The output validates against Final Cut Pro's `FCPXMLv1_11.dtd`.

⚠️ `public/` is the website: anything in `public/music/` is published at
`crmanalytics.imswarnil.com/music/…` on the next deploy. Keep music beds in `content-creation/music/`,
which is gitignored and read first.

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

`kit/Guide.html` lists every template with its controls. There are 151 generic templates in the
Guide, plus 14 baked for Lesson 01.

Each Final Cut Pro browser has **one category, CRMA**. Inside it the templates are grouped by
theme, the second column below: on disk that is `Titles.localized/CRMA/<Group>/<Template>/`.
Transitions have a single group, so they sit straight in `Transitions.localized/CRMA/`. A new
group is just a new `folder` argument to `Doc(...)`; `ozml.CATEGORY` puts it under CRMA.

| Browser | Group (in CRMA) | Count | What |
| --- | --- | --- | --- |
| Titles | Intros | 6 | Academy Intro (8 s), Intro Short (4 s), Intro Navy, each timed to its music; Lesson Intro (light, navy) and Hook Question, 8 s |
| Titles | Outros | 4 | Thanks for watching (light, navy), next lesson with course progress, minimal |
| Titles | Explain | 6 | Definition, worked example, do and don't, glossary, analogy, concept map |
| Titles | Data and Tables | 5 | Data table (highlight row pop-up), sample data builder (rows type in), dataset schema, filter rows, group by |
| Titles | Diagrams | 6 | Join Venn (join type pop-up), join tables, append rows, recipe graph, dataflow pipeline, object model |
| Titles | Dashboards | 6 | Dashboard mockup, KPI tiles, bar chart (highlight bar pop-up), line chart, funnel, leaderboard |
| Titles | Screen and Camera | 4 | Screen and camera (layout pop-up), side by side, camera focus, screen with steps — drop wells for both clips |
| Titles | Text Animations | 8 | Word by word, typewriter, highlight word, strike and replace, big statement, counter, question, keyword stack |
| Titles | Arrows and Elements | 14 | Arrow, arrow with label, elbow, curved, double, circle highlight, draw box, underline, bracket, step badges, status stamp, data line, field tag, equation |
| Titles | Slides | 14 | Title slide, agenda, bullets, two column, icon cards and grid, process flow, big numbers, query block, query + result, quiz, summary, image + text, slide intro |
| Titles | Lessons | 12 | Lesson opener and introduction, step card, bullet card, checklist, icon card, note, pro tip, warning, query card, recap, up next |
| Titles | Lower Thirds | 10 | Instructor, guest, name rule, reveal name, topic tag, now topic (loop), source credit, icon lower third, lesson number bar, member promo bar |
| Titles | Titles | 10 | Sheet title, section header, definition, formula, key takeaway, quote, reveal title, stacked reveal, icon title, floating badge |
| Titles | Scenes | 5 | Course intro, module title, section divider, KPI figure, lesson outro |
| Titles | Screen Capture | 5 | Click marker, highlight box, number badge, pointer label, shortcut keys |
| Titles | End Screens | 5 | Become a member, membership perks, end screen subscribe, two videos, course complete |
| Titles | Episode 01 | 14 | Lesson 01's own copies of the slides and callouts, text baked in (`source/kit/make_ep01.py`) |
| Transitions | — | 11 | Block sweep, sheet wipe, sheet slide, grid reveal, card stack, tile grid, iris, push blur, blinds, blueprint zoom, signal flash |
| Generators | Backgrounds | 3 | Graph paper, graph paper navy, drawing sheet |
| Generators | Elements | 3 | Countdown, logo bug, progress bar |
| Effects | Effects | 7 | Slow push in, blueprint tint, graph overlay, drawing sheet frame, navy vignette, signal glitch, webcam box |
| Effects | Screen Capture | 7 | Blueprint window, figure frame, side panel, spotlight, zoom to detail, camera square (corner + size pop-ups), screen with camera space |

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
`CRMA › Episode 01` titles, which Install.command installs. It corresponds to the
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
