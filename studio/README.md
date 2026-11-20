# Studio: one lesson → one finished video

The same five steps for every lesson. The lesson file is the single source:
its `walkthrough` is the script, and everything below is generated from it.

```
content/en/<section>/<lesson>.md  (walkthrough: say · screen · onscreen · edit)
        │
        ▼  node studio/lesson-to-shots.mjs <section>/<lesson>      (or --all)
studio/out/<section>/<lesson>/
   teleprompter.txt  → read it while recording
   shots.csv         → the shot list, with timecodes
   markers.json      → Premiere   (premiere/import-markers.jsx)
   ae.json           → After Effects (aftereffects/build-lesson.jsx)
   thumbnail.json    → Photoshop  (photoshop/thumbnail.jsx)
   motion.md         → the motion-graphics brief
```

## The five steps

1. **Generate.** `node studio/lesson-to-shots.mjs data-prep/joins-in-depth`
2. **Record.** Read `teleprompter.txt`, one shot per take. Screen shots follow the
   `screen` click path in `shots.csv`. Record at 1920×1080, 30 fps. Mic first, face second.
3. **Build graphics.** In After Effects: *File → Scripts → Run Script File →*
   `aftereffects/build-lesson.jsx`, then pick `ae.json`. You get a title card, a lower third for
   every on-screen line, one comp per MOTION shot (already animated from the concept
   library) and the end screen, saved as `<lesson>.aep`.
4. **Cut.** In Premiere, make the sequence, run `premiere/import-markers.jsx`, then pick
   `markers.json`. Markers show every shot, colour-coded: **green** talking, **blue**
   screen, **red** motion. Import the `.aep` comps with Dynamic Link and drop them on the red markers.
5. **Thumbnail.** In Photoshop, run `photoshop/thumbnail.jsx` and pick `thumbnail.json`, then drop a
   photo or screenshot onto the marked layer. Export, upload, and put the YouTube id in the
   lesson's `video: { id }`. Delete `comingSoon: true` to publish.

## Motion concept library

`aftereffects/concepts.jsx` holds the reusable animations every lesson draws from. A
`MOTION:` edit note picks one by its words (see `CONCEPTS` in `lesson-to-shots.mjs`):

| Concept | Teaches | Used for |
|---|---|---|
| `join` | Two tables meet on a key | Joins, lookups, connected data sources |
| `fanout` | One row becomes several | Fan-out, left joins, double counting |
| `collapse` | Rows merge into one | Aggregate, grain, group by |
| `flow` | Data travels through stages | Sync → recipe → dataset, SAQL statements |
| `window` | A frame slides down rows | Windowing, running totals, moving averages |
| `chip` | A value flies into a query | Bindings, faceting |
| `rotate` | Columns turn into rows | Transpose, wide vs long |
| `filter` | Rows drop out or fill in | Filters, nulls, fill |
| `generic` | A guide comp with the brief | Anything new; build it once, then add it to the library |

Improve a template once and every future lesson inherits it. When a `generic` shot
turns into a good animation, move it into `concepts.jsx` with its keywords.

## Finished scenes: joins

`aftereffects/scenes/joins.jsx` builds six finished, editable scenes with real Academy rows:
1. **The idea:** keys match on unordered tables, lines draw between matches, and Industry flies across.
2. **Lookup:** a missing match leaves a dashed empty cell.
3. **Left-join fan-out:** one deal splits into three rows, Amount pulses red, and the total goes from 61,600 to 179,800.
4. **Inner join:** the unmatched row drops out.
5. **Outer join:** an account with no deal appears with empty cells.
6. **The fix:** products collapse to one row per key, then the join is safe.

Run it in After Effects (*File → Scripts → Run Script File*), then preview everything with
`sh studio/render-scenes.sh studio/out/motion/joins.aep`, which writes MP4s and a contact sheet per scene.
The same helpers (`table`, `cell`, `connector`, `tint`, `pulse`, `moveBy`) are the starting point
for the next scene sets: SAQL statement flow, windowing and bindings.

## Style

Every colour, font, size and timing lives in `brand.json`, which matches the site:
navy `#032D60`, signal blue `#0176D3`, Figtree. Change it there, not in a comp.

- One idea per shot; motion only when it explains something.
- Text on screen is the line from `onscreen`, never a paragraph.
- Last 20 seconds: the end screen, always.

`studio/out/` is generated and gitignored. Run the generator again after you edit a script.
