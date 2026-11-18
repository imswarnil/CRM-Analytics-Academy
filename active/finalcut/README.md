# CRMA Final Cut Pro kit

A small kit in the site's design (navy, Salesforce blue, Switzer, uppercase labels):

| Browser | CRMA › | Templates |
| --- | --- | --- |
| Titles | Lower Thirds | Name and Role · Topic Tag · Source Credit |
| Titles | Lessons | Lesson Title · Section Card · Key Point · Definition · Step · Recap · Big Number · Quote · Chapter Marker · End Screen |
| Transitions | — | Brand Wipe · Slide · Navy Dip |
| Generators | Backgrounds | Navy Background · Light Background |

Every text, colour and position is published: edit it in the inspector, no Motion needed.

```bash
active/finalcut/Install.command          # build + install (quit Final Cut Pro first)
python3 -B active/finalcut/make_kit.py "Recap"   # rebuild one template
```

- `make_kit.py` — the templates (tokens at the top). Add one = write a function, add it to a dict.
- `engine/ozml.py` — the Motion file writer. `engine/ref/` — transition fragments it reads.
- `media/` — PNGs the templates embed. `kit/` is generated and not committed.

## Editing workflow

1. Record against a script in `active/scripts/`. Drop the clips in a new FCP library.
2. Each script line marked `[Key Point]`, `[Step]`, `[Recap]`… names the title to place there.
3. Brand Wipe between sections, Navy Dip into the end screen. End Screen runs the last 20 s
   (YouTube's end-screen elements go in its two slots).
