# Studio: the Academy's video kit

After Effects, Premiere Pro and Photoshop, driven from this folder. Two kinds of video:

- **Films:** motion-graphics videos (promos, intros, explainers) built end to end from a spec:
  voice-over, music, sound effects, every scene animated, rendered and handed to Premiere.
- **Lessons:** you record yourself and the screen; the kit makes the titles, lower thirds and
  the motion shots each lesson's script asks for.

Everything is in the Academy's design: navy and signal blue, Figtree, flat shapes in a real 3D
space (a moving camera, depth, flip/zoom/swing transitions), and **the Bars**, the logo's three
bars as characters (Frosty, Bright, Big Blue). The Bars appear on openers, titles and the end
card, plus the tallest bar of a chart; never on screens. Big Blue and the tallest bar **lip-sync**
to the voice-over: the builder measures each line's loudness 15 times a second (`voEnv` in the
timeline) and `KIT.talk` keys the mouth from it.

## Films

```bash
node studio/build-film.mjs intro               # the 1-minute promo: everything, end to end
node studio/build-film.mjs intro --no-render   # stop after the After Effects project
node studio/build-film.mjs intro --audio       # voice-over, music and mix only
node studio/build-film.mjs intro --screens     # also capture the site screenshots again
node studio/build-film.mjs trailer             # the channel trailer (flat, the CRM Analytics app itself)
node studio/build-film.mjs kit-preview         # test reel of the other scene types
```

**The channel trailer** (`films/trailer.json`, 1:05, 28 bars of *Dizzy*) is just a channel trailer:
brand, feeling, the promise, you, subscribe. No lessons, no curriculum. It is **one continuous film in
one open white world** with one language in every comp: the camera glides between places with the
same move every time (1.5 beats, smoothstep, a gentle turn from each scene's `rot`), landing exactly on
the scene's downbeat, and every scene but the first plays a beat early (`canvas.lead`), so it is
already arriving while the camera travels: there is never an empty white frame. Everything **morphs**:
*Welcome.* / *Want to learn CRM Analytics?* whose letters become bars, the "?" a donut and the
underline a line chart (`morphCharts`) / *Write SAQL?* with the word swapping on the beat / *Build
dashboards people actually use?* / *You're in the right place.* (`typeLine`); "data" bursting into
dots that stack into bars and say "insight." (`dataInsight`); a pen line that unfolds slides and
becomes a road with stops (`pathRoad`); AI sketches becoming widgets (`aiSketch`); a bar rounding into
your photo circle beside your name (`aboutWorld`); the Subscribe button opening into your clip
(`subscribeWorld`, the clip plays `clipAt` bars in); your clip's panel shrinking into the end screen's
video slot while lines open into the subscribe slot and the site pill (`endWorld`).
Files go in `workspace/01-camera/trailer/`: `photo.jpg` (scene `"photo": "photo"`) and
`clip-02-subscribe.mov`; fill the `about` props. Missing ones show quiet placeholders.

**On the beat** (`"sync": true`): while a scene is built, `KIT.grid` knows where the film's half-beats
fall in that comp; `KIT.snapComp` then moves every animation so it starts on one (animations starting
within 0.1 s of each other move together, so a stagger stays a stagger and its first element lands on
the beat), and type-on and count-up expressions start on it too (`KIT.snapT`). Scene starts are exact
bar times rounded once to a frame, so nothing drifts. The build prints the check and writes every hit
with its deviation to `workspace/06-graphics/<film>.beats.json`. One motion vocabulary for the whole
film lives in `KIT.EASE` (enter, exit, pop, morph) and `KIT.PRE` (a slam's wind-up, half a beat).

**Canvas films** (`"layout": "canvas"`, `KIT.canvasMaster` in `aftereffects/kit/film.jsx`): every
scene is placed at its `at` [column, row] in cells of `canvas.cell` px, and a VIEW null travels
between them (2D position, scale and rotation only, never 3D) in `canvas.move` beats, landing just
before the downbeat; scenes hold their first frame before they play and their last after. Two looks:
`canvas.cards: false` is the **white world** (scenes have no background and are never clipped,
scene `rot` turns the view, `canvas.tilt` adds a sway on each move, `canvas.floor` sets the colour),
otherwise **cards on a board** with a dot grid and connector lines (`link` {`from`, `to`, `bend`},
`overview: true` pulls back over everything). Other films keep cutting from scene to scene.
`films/trailer-clips.md` is the brief.

A film is a JSON spec in `films/`. Without `voice` it is **text and music only** (the intro):
each scene lasts `bars` bars of the music (`music.bar` seconds; Dizzy is ≈103 BPM, 2.34 s a bar), so
every cut and every kinetic word lands on the beat, and `"sfx": false` keeps sound effects out.
With `voice`, each scene has the line it speaks (`vo`), a scene `type`,
its `props`, how it enters (`transition`: inside the scene `reveal`, `bars`, `push`, `none`; or
`slices`, `diag`; or moving whole scenes in 3D `flip3d`, `zoom3d`, `swing3d`) and sound effects
(`sfx`, seconds from the scene start). The voice sets each scene's length. One run:

1. **Voice-over:** macOS speech, one file per scene, levelled. Install a better voice once
   (System Settings → Accessibility → Spoken Content → Manage Voices → "Ava (Premium)") and the
   next build uses it.
2. **Music:** `music.file` (the intro uses *Dizzy* by Joakim Karud, credited on the end card) or an
   original bed from `audio/synth.py`. It ducks under the voice; the mix is levelled to -14 LUFS.
3. **Sound effects:** pops, whooshes, dings, typing, synthesised by `audio/synth.py` (no licences).
4. **Screens:** `screens.mjs` captures live site pages at 2× with ads blocked.
5. **After Effects:** one precomp per scene, a MASTER comp, VO/music/SFX layers with the ducking
   as keyframes. Saved as `workspace/06-graphics/<film>.aep`. If that project is open with unsaved
   changes, they are kept first as `<film>-edited-<time>.aep`.
6. **Render:** `aerender` plus the mix → `workspace/08-export/<film>.mp4`.
7. **Premiere:** `workspace/07-edit/<film>.xml`. In Premiere, *File → Import* it: video on V1,
   VO, music (with the duck keyframes) and SFX on separate tracks, ready to re-cut.

## Comps on request

```bash
node studio/comp.mjs --list                                         # scene types and their props
node studio/comp.mjs joins '{"kind":"inner"}' --seconds 8            # into the project open in AE
node studio/comp.mjs titleCard '{"title":"Joins","kicker":"LESSON 4"}'
node studio/comp.mjs --from studio/out/data-prep/joins-in-depth/comps.json   # a lesson's comps
node studio/comp.mjs --mogrt                                        # Premiere templates
```

Or ask Claude: "make me a comp that shows a left join fanning out". New scene types go in
`aftereffects/kit/scenes.jsx` and are then available to every film, lesson and the panel.

| Scene type | Shows |
|---|---|
| `barsHello`, `logoTitle`, `titleCard`, `quote`, `endCard` | Openers, titles, statements, the end card |
| `signupStory` | A sign-up on the site becomes a Lead (3D browser, record card flies out) |
| `learnSalesforce` | A Lead record, its fields and owner, then Convert → Account, Contact, Opportunity |
| `integration` | Salesforce → Data Sync → Recipe → Dataset → Dashboard → Lightning page, camera tracking |
| `dashboard3D` | A full dashboard (KPIs, leads by source, conversion funnel) assembling in 3D |
| `securityPredicate` | One dataset, a predicate, each rep's rows flying to their own view |
| `sharingEmbed` | The dashboard embedded on a record page, on mobile, shared with the team |
| `kinetic` | The story in words: kinetic type on the beat (`*accent*` words, icons in and out) |
| `platformData` | This site's own tables (traffic, sign-ups, lessons, payments) with their tools, into Salesforce and three datasets |
| `filterViz` | How a filter works: matching rows tick, the rest drop out, 8 rows → 4 |
| `functionViz` | How a function works: values fly into `sum()`, one answer comes out, plus count/avg/max |
| `limitViz` | Order + limit: rows sort, a cut line keeps the top N |
| `techStack` | The stack behind the project, built by Swarnil Singhai |
| `githubStar` | Star the project on GitHub (the repo card, a click, a star) |
| `endScreen` | YouTube end screen: a "start here" video slot, a subscribe slot, the site |
| `salesforceModel` | Account, Contact, Opportunity and a custom object, with their relationships |
| `aiAssist` | A prompt sketches a dashboard mockup; data-validation checks tick off |
| `designerCanvas` | The dashboard designer: widgets dragged from a palette snap onto the grid |
| `dashboardTypes` | Pipeline, adoption, performance, web traffic and snapshot-trend dashboards |
| `securityRoles` | Who sees what: owner, manager, leader on a role hierarchy, with the predicate |
| `gtmEngine` | GTM engineering: visits → customers with conversion rates, enrich/score/route/alert |
| `teamSeats` | A company buys seats; avatars fill them; the manager sees team progress |
| `browserShot` | A site page in a browser window: pan, cursor click, callout chips |
| `screenDeck` | Pages sliding in one after another, each with a big label |
| `coursePath` | The sections as a road, a Bar hopping from stop to stop |
| `dataflow` | A recipe: sources → join → clean → output, packets flowing, a run |
| `saqlTyping` | SAQL typed into an editor, then the result |
| `executionOrder` | load → filter → group → foreach → order → limit, lit in turn |
| `joins` | Two tables, keys matching, the result building (`lookup`, `left`, `inner`) |
| `bindings` | A chart made of Bars, a click, the KPI changing through a binding |
| `lowerThird` | Name and role |
| `appHook` | Trailer hook: two statements, then a dashboard builds itself on the beat |
| `whyLearn` | Four reasons, each a widget with its own small chart |
| `approach` | How you learn as a recipe: Watch → Build → Check → Practise → Ship, Run ticks every step |
| `realData` | Explorer: query fields, then the chart swaps bar → donut → line |
| `pathList` | The sections as a list widget, progress filling, KPI widgets |
| `queryMode` | SAQL typed in Query mode, Run, the results land, a toast |
| `proveIt` | Exam score gauge, interview questions, the capstone certificate |
| `slam` | One big word per beat pair (`per` beats), the colour cutting with it, icons; long words shrink to fit |
| `chapter` | A chapter card: lines slam in on the beat over a ghost numeral, then fly off on the last half-beat (the words are the cut) |
| `concept` | The concept's word slams (`intro` beats), becomes the heading, then it is built: `kind` recipe, join, saql (a long multi-step query too), function (rows flow into sum(), then avg/count/max), execute (load → filter → group → foreach → order → limit lit in turn, rows shrinking), chart, bind, secure, conversion (funnel with rates), adoption (active users, gauge, features), snapshot (daily recipe → history → what changed), ai (prompt → mockup, data checks, a prediction) |
| `typeLine` | One line of kinetic type with After Effects text animators: `welcome` (characters rise, tracking opens, a line draws), `question` (type-on, wipe reveal, "?" slams on the downbeat), `swap` (the last word swaps every beat in a masked slot), `underline` (small/big contrast on a drawn line), `tracking` (tracking opens, characters fall in random order) |
| `method` | How you learn: a caption, then glimpses on a board that slide in turn: `venn`, `binding`, `flow`, `trend`, `build`, `quiz`, `realdata` |
| `buildMontage` | What you will build: conversion, adoption and snapshot dashboards slide in on the beat |
| `aiFlash` | AI: a prompt types, a mockup sketches itself, the data is checked |
| `morphCharts` | A word becomes charts: each letter becomes a bar, the "?" a donut, the underline a line chart |
| `dataInsight` | "data" bursts into dots, they scatter, stack into columns, fuse into bars, and the tallest says "insight." |
| `pathRoad` | A pen line draws, slides unfold along it, then it thickens into a road with stops, running out of frame |
| `aiSketch` | A prompt types, dashed sketches draw, each becomes a real widget |
| `aboutWorld` | About you on white: a bar rounds into the photo circle, your name writes beside it, one quiet line for role, years, companies |
| `subscribeWorld` | Subscribe on white: the words land, the button arrives and opens into your clip |
| `endWorld` | End screen on white: your clip's panel shrinks into the video slot, lines open into the subscribe slot and the site pill |
| `aboutMe` | Two columns: your photo, then name, role, years, companies (placeholders until filled); `light: true` on white |
| `clipSlot` | Your camera clip with a name card, or a placeholder until it exists |

## Install into the apps (once)

```bash
node studio/comp.mjs --mogrt          # build the Premiere templates
node studio/install-adobe.mjs         # panel into After Effects, templates into Premiere
```

- **After Effects:** *Window → CRMA Kit.jsx*, a dockable panel: make any scene comp with its
  props, or drop the Bars, a reveal, a bars sweep, a push, a lower third or an icon into the
  active comp at the playhead.
- **Premiere Pro:** *Essential Graphics → My Templates → CRMA*: Title, Lower third,
  Statement, End card, with their text editable.

## Lessons

```bash
node studio/lesson-to-shots.mjs data-prep/joins-in-depth     # or --all
node studio/new-video.mjs data-prep/joins-in-depth           # prepare workspace/ for recording
```

`studio/out/<section>/<lesson>/` gets `teleprompter.txt`, `shots.csv`, `markers.json`
(Premiere: `premiere/import-markers.jsx`), `comps.json` (the kit comps: title, a lower third
per on-screen line, one comp per `MOTION:` shot, end card), `thumbnail.json`
(`photoshop/thumbnail.jsx`) and `motion.md`. A `MOTION:` note that matches no scene type is
marked `custom`: ask for that scene, and it joins the kit for every later lesson.

## The workspace

`workspace/` is one video at a time and gitignored: `00-plan`, `01-camera`, `02-screen`,
`03-audio`, `04-clips` (screens), `05-concepts`, `06-graphics` (.aep), `07-edit` (Premiere),
`08-export` (MP4). Empty it yourself when the video is published.

## Style

Colours, fonts and sizes live in `brand.json` and match the site. One idea per shot, motion
only when it explains something, text on screen is a line, never a paragraph.
