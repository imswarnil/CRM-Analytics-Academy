# Blueprint tokens

The design language of CRM Analytics Academy as portable values: type, colour, borders,
shadows, grid, motion and video frame sizes. **`tokens.json`** follows the
[W3C Design Tokens](https://design-tokens.github.io/community-group/format/) format.

The website itself reads `app/assets/css/main.css`, which is still the source of truth.
This folder mirrors it for everything that is not the website: Final Cut Pro and Premiere
titles, After Effects, Keynote, Figma (Tokens Studio imports the JSON as is), thumbnails
and social graphics. If you change
a token in `main.css`, change it here too.

## Type

Two families, both free on Google Fonts (OFL). Install them before you open a video
project, or the titles fall back to Helvetica:

- **Schibsted Grotesk** is everything you read: headings, body, buttons.
- **IBM Plex Mono** is everything that labels something: eyebrows, captions, specs, code.

| Token | Family | Weight | Size (web) | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `type.display` | Schibsted Grotesk | 900 | 42 → 76px | 0.95 | −0.045em | Hero headline |
| `type.h2` | Schibsted Grotesk | 800 | 30 → 48px | 1.0 | −0.04em | Section title |
| `type.h3` | Schibsted Grotesk | 800 | 22px | 1.15 | −0.02em | Card title |
| `type.lead` | Schibsted Grotesk | 400 | 16 → 19px | 1.6 | 0 | Standfirst, colour `ink2` |
| `type.body` | Schibsted Grotesk | 400 | 16px | 1.7 | 0 | Lesson text |
| `type.eyebrow` | IBM Plex Mono | 500 | 11px, UPPER | 1.3 | +0.14em | `FIG. 05 — THE AUTHOR`, colour `signal` |
| `type.label` | IBM Plex Mono | 400 | 10px, UPPER | 1.3 | +0.1em | Legends, specs, colour `ink2` |

Headlines are set **tight** (negative tracking) and labels **wide** (positive tracking).
That contrast carries most of the look.

## Colour

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `paper` | `#F4F7FB` | `#0A1428` | Page |
| `card` | `#FBFCFE` | `#0F1C36` | Surfaces |
| `ink` | `#0C1B33` | `#E6EEFA` | Text, 1.5px borders, hard shadows |
| `ink2` | `#4A5B78` | `#9DB0CF` | Secondary text |
| `line` | `#C3D2E6` | `#24385F` | Hairlines, dashed rules |
| `navy` | `#0F2A5C` | `#07122A` | Footer, dark bands |
| `signal` | `#2F5BEA` | `#6E93FF` | **The** accent, used once per view |
| `ice` | `#DDEBFA` | `#16274A` | Active and hover fill |
| `glow` | `#3FC6DC` | `#5ED8EA` | Cyan, sparingly, labels on navy |

## The rules that make it Blueprint

1. **Square corners.** Radius 0, always. Only donuts and dots are round.
2. **1.5px ink borders** on every card, button and figure.
3. **Hard shadows**: offset 3, 5 or 10px with zero blur, in `ink` (or `signal` on navy).
4. **Graph paper**: a 24px minor grid, with every fifth line darker.
5. **Captions read like a drawing set**: `FIG. 01 —`, `SHEET 02 /`, crosshair crop marks
   at the corners, a ruler along one edge.

## In Final Cut Pro

- **Titles**: make a Basic Title, set the font to Schibsted Grotesk Black, size about
  130 for a 1080p headline, tracking −4 to −5%, colour `#0C1B33` on paper or `#FFFFFF`
  on navy. Save it as a preset ("Blueprint H1") so you only do this once.
- **Labels**: IBM Plex Mono Medium, all caps, tracking +14%, colour `#2F5BEA`.
- **Backgrounds**: the graph-paper PNGs in `content-assets/backgrounds/` are already built
  from these colours, at 1920×1080, 1080×1920 and 1080×1080.
- **Safe area**: keep type 96px inside every edge of a 1080p frame (`video.safe-title`).
