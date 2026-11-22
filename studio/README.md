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

**The channel trailer** (`films/trailer.json`, 1:24) is kinetic type first, flat, no camera moves:
`slam` scenes cut one big word per beat pair; each `concept` slams its name (PREP, JOIN, SAQL,
VISUALIZE, BIND, SECURE), the word shrinks into the heading as a canvas rises, and the concept is
built on it (`kit/kinetic.jsx`). `aboutMe` is two columns: your photo, then name, role, years,
companies. Files go in `workspace/01-camera/trailer/`: `photo.jpg` (scene `"photo": "photo"`) and
camera clips (scene `"clip": "clip-02-subscribe"`, played full frame with the music ducked; the
scene grows to fit). Missing ones show placeholders saying what is needed.
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
| `slam` | One big word per beat pair, the colour cutting with it, icons |
| `concept` | The concept's word slams, becomes the heading, then it is built: `kind` recipe, join, saql, chart, bind, secure |
| `aboutMe` | Two columns: your photo, then name, role, years, companies (placeholders until filled) |
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
