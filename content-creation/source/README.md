# CRMA Kit generator

These are the Python scripts that built every template in `content-creation/kit/`. You only need them to
change or add a template. The kit is committed already built.

- **Python** 3.10 or newer, standard library only. Tested with 3.14: rebuilding `Step Card`
  produces a `.moti` byte-identical to the one in the kit.
- **macOS tools**: `sips` and `qlmanage` (both built in) for media sizes and thumbnails.
  `media.py` also needs `rsvg-convert` (`brew install librsvg`).
  Some effects copy Apple filters out of Final Cut Pro's stock templates, so FCP must be installed
  (`STOCK` in `kit/ozml.py` points at `/Applications/Final Cut Pro Creator Studio.app`; change it if
  your copy is named differently).
- **ffmpeg** (`brew install ffmpeg`), only for `make_music.py`.
- **Pillow** (`pip install pillow`), only for `media.py`, which redraws `media/*.png`. The PNGs
  are committed, so you normally skip this step. Its icons come from the sibling repo
  `~/Swarnil/icons.imswarnil.com/icons`; set `ICONS_DIR` to point somewhere else.

Output paths are worked out from the script's own location (`ozml.KIT` = `<repo>/content-creation/kit`), so
run the scripts from anywhere:

```bash
python3 -B content-creation/source/kit/make_crma.py              # titles, transitions, generators, effects (part 1)
python3 -B content-creation/source/kit/make_crma.py "Step Card"  # one template, or one folder ("Lower Thirds")
python3 -B content-creation/source/kit/make_crma2.py             # part 2: slides, end screens, intros, more
python3 -B content-creation/source/kit/make_crma3.py             # part 3: intros/outros, explain, tables, diagrams, dashboards, screen + camera, text, arrows
python3 -B content-creation/source/kit/make_ep01.py "content-creation/kit/Motion Templates"   # CRMA › Episode 01 (Lesson 01's own titles)
python3 -B content-creation/source/kit/make_crma_guide.py        # Guide.html + README.txt
python3 -B content-creation/source/kit/make_music.py             # Music/*.wav + *.m4a (commit the .m4a only)
python3 -B content-creation/source/kit/media.py                  # media/*.png (needs Pillow)
```

`-B` stops Python writing `__pycache__/`. Those folders are gitignored anyway. Then run
`content-creation/kit/Install.command` again so Final Cut Pro picks up the change.

| File | What it builds |
| --- | --- |
| `kit/make_crma.py` | Blueprint tokens and helpers, lower thirds, titles, lessons, screen capture, scenes, transitions, generators |
| `kit/make_crma2.py` | Slides, end screens, intros, the extra titles and effects |
| `kit/make_crma3.py` | Lesson intros and outros, explain slides, data tables, diagrams (joins, recipe graph, dataflow), dashboards, screen + camera layouts, text animations, arrows and elements. Measures Schibsted Grotesk Black with `fontTools` when it is installed, and estimates otherwise |
| `kit/make_ep01.py` | `CRMA › Episode 01`: copies of the templates with Lesson 01's text baked in |
| `kit/make_crma_guide.py` | `Guide.html` and `README.txt` |
| `kit/make_music.py` | Intro music, outro sting, lesson bed, SFX. It is a synthesiser written in pure Python, then ffmpeg masters the result |
| `kit/ozml.py` | The Motion (OZML) writer shared by every script |
| `kit/make_titles.py`, `kit/make_effects.py`, `kit/make_guide.py` | Helpers the CRMA scripts import (`with_animation`, filters, the guide page) |
| `kit/ref/` | Apple transition fragments `ozml.py` reads |
| `media/` | PNGs the templates embed (shapes, icons, Blueprint marks) |

The originals came from `~/Desktop/FCP Kit/_source/`. That folder also holds the generic,
non-CRMA "Custom -" kit, which was deliberately left out of this repo.
