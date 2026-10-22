"""make_guide.py — writes ../Guide.html from the built templates (every template, its folder and its Inspector controls)."""
import os, re, glob, html, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozml import OUT, KIT, ACCENT

KIND = [('Titles', 'moti', 'Titles browser (T) → sidebar', 'Drag onto the timeline above your clip. Double-click the text in the viewer to edit it, or use the Text fields in the Inspector.'),
        ('Transitions', 'motr', 'Transitions browser (⌃⌘5)', 'Drag onto the cut between two clips. Change its length by dragging its edges.'),
        ('Generators', 'motn', 'Generators browser', 'Drag onto the timeline like a clip. Use it under titles or as a backdrop.'),
        ('Effects', 'moef', 'Effects browser (⌘5)', 'Drag onto a clip (or double-click with the clip selected). Controls appear in the Video Inspector (⌘4).')]

BLURB = {
    'Lower Thirds': 'Name and role in the title-safe corner. Fonts, sizes and colours are editable; Position moves the whole thing.',
    'Titles': 'Headline titles, quote, statement, episode card and section label.',
    'Chapters & Lessons': 'Numbering and lesson structure for courses: chapter number, lesson title, step counter, key point, hand note, timestamp.',
    'Callouts': 'Point at things on screen: pointer label, keyboard key, code tag, highlight pill, arrow note.',
    'HUD Markers': 'Camera / sci-fi overlays: corner brackets, focus box, crosshair, REC indicator, data readout, coordinate tag.',
    'Social': 'Subscribe button, Like · Comment · Subscribe strip, follow handle, logo letter with the accent dot.',
    'Funny': 'Meme titles: emoji pop, emoji rain, meme caption, sticker, big reaction.',
    'Icons': 'One title per icon (103 icons). Icon Color and Icon Size are published; it pops in and out automatically.',
    'Zoom': 'Zoom transitions / zoom effects — every zoom lives here.',
    'Slide': 'Push transitions with motion blur, one per direction.',
    'Wipe': 'Crop wipes with an accent edge, one per direction.',
    'Flash & Dip': 'Flash to white / accent, dip to black / dark, light leak.',
    'Blur': 'Cross blur and whip pans.',
    'Glitch': 'Glitch, pixel and shake cuts.',
    'Backgrounds': 'Looping backdrops: dark / light canvas, dot grid, line grid, accent gradient, spotlight, grain.',
    'Elements': 'Reusable video components: progress bar, accent bar, divider, panels, live dot, timeline ticks, step dots.',
    'Frames': 'Put the clip in a browser window, a phone, a rounded card, cinema bars, or over a blurred copy of itself (vertical pads).',
    'Overlays': 'Film grain, vignette, light leak, spotlight dim, grid overlay, scanlines.',
    'Color Looks': 'One-click grades with an amount on each part.',
    'Text Effects': 'Text with a built-in effect: blur in, glitch, shake, neon flicker, zoom through, echo, word rise, pop shadow — plus the Animation preset.',
    'End Screens': 'YouTube end screens with image wells: drop your thumbnails / channel picture onto the wells in the Inspector.',
    'Mockups': 'Browser, phone, laptop and picture card with an image well for your screenshot and a Camera pop-up (push in, pull out, pan, float).',
    'Scenes': 'Full-frame predefined scenes with their own backdrop: intro, chapter, stat (counting number), outro, quote.',
    'Camera Frames': 'REC frames, viewfinder, film gate, corner brackets, cinema bars — as generators, so they sit above any clip.',
    'Timers': 'Counting numbers that always run from Start to End across the whole clip: trim the layer and the countdown still finishes exactly at its end. Set Start / End / Decimals in the Inspector.',
    'Glitch': 'RGB split, glitch burst, scan glitch, digital blocks, signal loss, echo trails, line screen, chromatic pulse — each with a preset pop-up.',
    'Cinematic': 'Cinema bars + push, film look, dream glow, flashback, light rays, teal & orange, vintage fade, noir.',
}
FUNNY_FX = 'Meme effects for reaction shots: shake with intensity, bulge, meme zoom, shocked, triggered, sad / excited / dramatic frames, spin fail, deep fried, wobble, drunk cam, censor, jelly, tiny mode, fun-house mirror.'


def controls(path):
    s = open(path, encoding='utf-8').read()
    names = re.findall(r'<target object="\d+" channel="[^"]+" name="([^"]+)"/>', s)
    texts = re.findall(r'<text>([^<]*)</text>', s)
    return [html.unescape(n) for n in names], [html.unescape(t) for t in texts]


def main(PREFIX='Custom - ', OUT=OUT, KIT=KIT, TITLE='Creator Kit for Final Cut Pro', ACCENT=ACCENT, EXTRA=None, LEAD=None, USE=None, EXTRA_HTML='', FONTS=None, NOTES=None):
    """LEAD / USE (list of <li> html) / EXTRA_HTML / FONTS / NOTES override the generic creator-kit wording."""
    BL = dict(BLURB, **(EXTRA or {}))
    parts = []
    counts = {}
    for kind, ext, where, how in KIND:
        root = os.path.join(OUT, kind + '.localized')
        folders = sorted(d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d)))
        sec = [f'<section id="{kind.lower()}"><h2>{kind}</h2><p class="how"><b>Where:</b> {where}. <b>How:</b> {how}</p>']
        n = 0
        for folder in folders:
            items = sorted(glob.glob(os.path.join(root, folder, '*', f'*.{ext}')))
            n += len(items)
            plain = folder[len(PREFIX):] if folder.startswith(PREFIX) else folder
            blurb = FUNNY_FX if (kind == 'Effects' and plain == 'Funny') else BL.get(plain, '')
            sec.append(f'<h3>{html.escape(folder)} <span class="n">{len(items)}</span></h3><p class="blurb">{blurb}</p>')
            if folder.endswith('Icons'):
                names = ', '.join(os.path.basename(p)[:-5].replace('Icon ', '') for p in items)
                sec.append(f'<p class="icons">{html.escape(names)}</p><p class="ctl">Controls: Icon Color · Icon Size · Position</p>')
                continue
            sec.append('<table><tr><th>Template</th><th>Inspector controls</th></tr>')
            for p in items:
                name = os.path.basename(p)[:-5]
                ctl, texts = controls(p)
                tx = f'<div class="tx">Text: {html.escape(" · ".join(t for t in texts if t.strip()))}</div>' if texts and kind == 'Titles' else ''
                sec.append(f'<tr><td><b>{html.escape(name)}</b></td><td>{html.escape(" · ".join(ctl)) or "—"}{tx}</td></tr>')
            sec.append('</table>')
        counts[kind] = n
        parts.append(''.join(sec) + '</section>')
    total = sum(counts.values())
    GENERIC_USE = f'''<li><b>Titles</b> sit above your footage. Drag one from the Titles browser, trim it to the length you need — the build-in and build-out animations keep their timing, the middle stretches. Double-click text in the viewer to type; fonts, sizes and colours are in the Title Inspector (⌘4).</li>
<li><b>Transitions</b> go on a cut. Drag the edge of the transition to change its speed; every curve scales with it.</li>
<li><b>Generators</b> are backgrounds and elements: put a background under titles, a progress bar / live dot / divider on top of anything.</li>
<li><b>Effects</b> change the clip itself. Stack them: e.g. <i>Rounded Card</i> + <i>Film Grain</i> + <i>Warm Film</i>. Funny effects are built for reaction shots — drop <i>Shocked</i> or <i>Earthquake</i> on a 1–2 s clip.</li>
<li><b>Image wells</b> (End Screens, Mockups): select the title, and in the Title Inspector drag a clip or still from the browser onto the well (e.g. "Screen", "Video 1", "Channel Picture"); use its Scale / Pan to frame it.</li>
<li><b>Timers</b>: the number counts from Start to End over the whole length of the generator — make the generator exactly as long as the countdown should take.</li>
<li>Every colour in the kit defaults to the same palette (accent <code>{ACCENT}</code>, white, neutral greys) so pieces match out of the box; change any colour in the Inspector.</li>
<li>Frames (Browser Window, Phone Frame, Rounded Card) show a backdrop colour around the clip — put the effect on the clip, then set <i>Backdrop Color</i> to match your background, or place a Background generator underneath.</li>
'''
    nav = ' · '.join(f'<a href="#{k.lower()}">{k} ({counts[k]})</a>' for k, *_ in KIND)
    page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{TITLE} — Guide</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{{--bg:#0a0a0a;--ink:#fff;--muted:#a1a1a1;--line:#262626;--accent:{ACCENT};--surface:#171717}}
body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 "Geist",-apple-system,system-ui,sans-serif}}
main{{max-width:980px;margin:0 auto;padding:40px 24px 80px}}
h1{{font-size:40px;margin:0 0 8px;letter-spacing:-.02em}} h1 i{{display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--accent);margin-left:6px}}
h2{{font-size:28px;margin:56px 0 8px;letter-spacing:-.01em}} h3{{font-size:19px;margin:32px 0 4px}} h3 .n{{color:var(--muted);font-weight:400;font-size:14px;margin-left:6px}}
p{{color:var(--muted)}} .lead{{font-size:18px;color:#d4d4d4}} .how{{background:var(--surface);padding:12px 16px;border-radius:10px;color:#d4d4d4}} .how b{{color:var(--ink)}}
nav{{margin:16px 0 0;font-family:"Geist Mono",Menlo,monospace;font-size:13px}} nav a{{color:var(--ink);text-decoration:none;border:1px solid var(--line);padding:6px 10px;border-radius:999px;margin-right:4px;display:inline-block;margin-bottom:6px}}
table{{width:100%;border-collapse:collapse;font-size:14px}} td,th{{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}} th{{color:var(--muted);font-weight:500;font-size:12px;letter-spacing:.08em;text-transform:uppercase}}
td:first-child{{white-space:nowrap;width:220px}} .tx{{color:var(--muted);font-size:12px;margin-top:2px}} .icons{{font-size:13px;line-height:1.8}} .ctl{{font-family:"Geist Mono",Menlo,monospace;font-size:12px}}
ol li{{margin-bottom:8px;color:#d4d4d4}} code{{font-family:"Geist Mono",Menlo,monospace;background:var(--surface);padding:2px 6px;border-radius:6px;font-size:13px}}
.steps{{background:var(--surface);border-radius:14px;padding:20px 24px}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:20px 0}} .card{{border:1px solid var(--line);border-radius:12px;padding:14px 16px}} .card b{{display:block;font-size:22px}} .card span{{color:var(--muted);font-size:13px}}
</style></head><body><main>
<h1>{TITLE}<i></i></h1>
<p class="lead">{total} templates in {len(KIND)} kinds — {LEAD or 'titles, transitions, generators and effects for YouTube, courses, podcasts, web series and memes'}. Every template is editable in the Final Cut Pro Inspector; no Motion needed.</p>
<nav>{nav}</nav>
<div class="grid">{''.join(f'<div class="card"><b>{counts[k]}</b><span>{k}</span></div>' for k, *_ in KIND)}</div>

<h2 id="install">Install</h2>
<div class="steps"><ol>
<li>Quit Final Cut Pro.</li>
<li>Double-click <code>Install.command</code> in this folder (if macOS blocks it: right-click → Open). It copies the four folders into <code>~/Movies/Motion Templates.localized</code> and never deletes anything of yours.</li>
<li>Manual alternative: in Finder press <code>⇧⌘G</code>, paste <code>~/Movies/Motion Templates.localized</code>, then copy the folders inside <code>Motion Templates</code> into the matching <code>Titles.localized</code>, <code>Transitions.localized</code>, <code>Generators.localized</code> and <code>Effects.localized</code> folders (create them if they don't exist).</li>
<li>Open Final Cut Pro. Every category starts with <b>{PREFIX}</b> in the sidebar of each browser (Titles, Transitions, Generators, Effects).</li>
<li>Fonts: the kit uses {FONTS or '<b>Geist</b>, <b>Geist Mono</b> and <b>Caveat</b>'} (free, open licence). If they aren't installed, Final Cut Pro substitutes Helvetica — the templates still work; pick any font in the Inspector.</li>
</ol></div>

<h2 id="use">Using the kit</h2>
<div class="steps"><ol>
{''.join(USE) if USE else GENERIC_USE}</ol></div>
{EXTRA_HTML}
{''.join(parts)}

<h2>Notes</h2>
<p>{NOTES or 'Made for Final Cut Pro 10.6+ / Motion 5.6+ (macOS). 1920×1080 at 30 fps; works in any project size (templates scale). Icons are an original set; fonts are open-licence (Geist by Vercel, Caveat by Impallari Type).'}</p>
</main></body></html>'''
    open(os.path.join(KIT, 'Guide.html'), 'w', encoding='utf-8').write(page)
    print('guide:', total, counts)


if __name__ == '__main__':
    main()
