# Pixelmator templates

Open the `.svg` in Pixelmator Pro: every shape is a named layer and the text stays editable.
Export as PNG (Share › Export › PNG) at the sizes below.

| File | Size | Use |
| --- | --- | --- |
| `thumbnail.svg` | 1280×720 | Video thumbnails. Change `pill-text`, `headline`, `headline-2`, `subline`; drop an illustration from `../art/scenes/` or a screenshot on `image-slot`, then delete the slot. |
| `profile.svg` | 800×800 | Channel picture. YouTube crops to a circle — keep everything inside `safe-circle-guide`. |
| `cover.svg` | 2560×1440 | Channel banner. Only `safe-area-guide` (1546×423) shows on every device; hide the guide before exporting. |

Regenerate all three (and the art) with `python3 active/art/build.py` — it overwrites them, so
save your edited versions as `.pxd` next to them.
