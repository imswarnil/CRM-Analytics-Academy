# Studio: the Academy's video kit

After Effects, Premiere Pro and Photoshop, driven from this folder. Two kinds of video:

- **Films:** motion-graphics videos (promos, intros, explainers) built end to end from a spec:
  voice-over, music, sound effects, every scene animated, rendered and handed to Premiere.
- **Lessons:** you record yourself and the screen; the kit makes the titles, lower thirds and
  the motion shots each lesson's script asks for.

Everything is in the Academy's design: navy and signal blue, Figtree, flat 2D shapes with bouncy
motion, and **the Bars**: the logo's three bars as characters (Frosty, Bright, Big Blue).

## Films

```bash
node studio/build-film.mjs intro               # the 1-minute promo: everything, end to end
node studio/build-film.mjs intro --no-render   # stop after the After Effects project
node studio/build-film.mjs intro --audio       # voice-over, music and mix only
node studio/build-film.mjs intro --screens     # also capture the site screenshots again
node studio/build-film.mjs kit-preview         # test reel of the other scene types
```

A film is a JSON spec in `films/`. Each scene has the line it speaks (`vo`), a scene `type`,
its `props`, how it enters (`transition`: `reveal`, `bars`, `push`, `none`) and sound effects
(`sfx`, seconds from the scene start). The voice sets each scene's length. One run:

1. **Voice-over:** macOS speech, one file per scene, levelled. Install a better voice once
   (System Settings → Accessibility → Spoken Content → Manage Voices → "Ava (Premium)") and the
   next build uses it.
2. **Music:** `music.file` (the intro uses *Dizzy* by Joakim Karud, credited on the end card) or an
   original bed from `audio/synth.py`. It ducks under the voice; the mix is levelled to -14 LUFS.
3. **Sound effects:** pops, whooshes, dings, typing, synthesised by `audio/synth.py` (no licences).
4. **Screens:** `screens.mjs` captures live site pages at 2× with ads blocked.
5. **After Effects:** one precomp per scene, a MASTER comp, VO/music/SFX layers with the ducking
   as keyframes. Saved as `workspace/06-graphics/<film>.aep`.
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
| `browserShot` | A site page in a browser window: pan, cursor click, callout chips |
| `screenDeck` | Pages sliding in one after another, each with a big label |
| `coursePath` | The sections as a road, a Bar hopping from stop to stop |
| `dataflow` | A recipe: sources → join → clean → output, packets flowing, a run |
| `saqlTyping` | SAQL typed into an editor, then the result |
| `executionOrder` | load → filter → group → foreach → order → limit, lit in turn |
| `joins` | Two tables, keys matching, the result building (`lookup`, `left`, `inner`) |
| `bindings` | A chart made of Bars, a click, the KPI changing through a binding |
| `lowerThird` | Name and role |

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
