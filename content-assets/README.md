# content-assets

Reusable creative kit for CRM Analytics Academy, drawn in the site's **Blueprint** language
(paper `#F4F7FB`, ink `#0C1B33`, navy `#0F2A5C`, signal `#2F5BEA`, tide `#3D8BD9`, frost `#A8CCF2`,
ice `#DDEBFA`, glow `#3FC6DC`; Schibsted Grotesk and IBM Plex Mono). For video editing, thumbnails,
social posts and slides.

This folder is **not** part of the site build: lessons live in `content/` (Nuxt Content) and served
files in `public/`. Nothing here is shipped to the website.

## Rebuild

```bash
node content-assets/build.mjs
```

Needs `rsvg-convert` (`brew install librsvg`) and `ffmpeg` (`brew install ffmpeg`); no npm packages.
Every file is regenerated from `build.mjs`: **edit the script, not the outputs**. SVG is the source for
each image; PNGs are renders of it. SVGs name the fonts with system fallbacks, so install Schibsted Grotesk
and IBM Plex Mono (Google Fonts) for exact type.

## What's inside

| Folder | File | Size | Use |
|---|---|---|---|
| `backgrounds/` | `graph-paper-{light,navy}-1920x1080` | 1920×1080 | Video / slide background |
| | `graph-paper-{light,navy}-3840x2160.svg` | 4K | SVG only: scales losslessly; export at 4K from any editor |
| | `graph-paper-{light,navy}-1080x1920` | 1080×1920 | Shorts, Reels, Stories |
| | `graph-paper-{light,navy}-1080x1080` | 1080×1080 | Square social posts |
| | `desk-{light,navy}-1920x1080` | 1920×1080 | Sheet with rulers and crop marks around a safe area |
| `video/` | `lower-third` | 1920×1080, transparent | Speaker name and role, bottom left |
| | `title-card` | 1920×1080 | Lesson opener: lesson code, title, one-line lead |
| | `chapter-card` | 1920×1080 | Section divider: big number and title on navy |
| | `end-card` | 1920×1080 | Closing CTA to crmanalytics.imswarnil.com |
| | `next-lesson-overlay` | 1920×1080, transparent | "Next lesson" and Subscribe box, top right |
| | `thumbnail-1280x720` | 1280×720 | YouTube thumbnail template |
| | `loop-graph-paper-navy-1920x1080.mp4` | 1920×1080, 4 s, 30 fps | Seamless looping background (moves one grid cell per loop) |
| `brand/` | `logo-mark.svg`, `logo-mark-512.png`, `logo-mark-1024.png` | square, transparent | The three-bar mark |
| | `logo-mark-on-paper`, `logo-mark-on-navy` | 512×512 | Mark on a solid background |
| | `wordmark`, `wordmark-on-navy` | 960×240 | "CRM Analytics" with "By Swarnil" |
| `project/` | `og-{home,curriculum,pricing,showcase}` | 1200×630 | Social / Open Graph cards |
| | `sections/<NN.section>` | 1600×900 | One cover per course section, titled from its `.navigation.yml` |

The templates carry placeholder text ("Lesson title", "Section title"). Change the text in the SVG, or
duplicate the template function in `build.mjs` and add your own.

## Licence

Original work for this project, released under the repository's [MIT licence](../LICENSE). It contains no
Salesforce trademarks or third-party artwork.
