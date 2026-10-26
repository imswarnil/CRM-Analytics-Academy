"""make_crma_guide.py — Guide.html + README.txt for content-creation/kit (Blueprint colours and fonts, music section)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_guide, make_crma, make_crma2, make_crma3

KIT = make_crma.KIT_DIR
OUT = os.path.join(KIT, 'Motion Templates')

BLURBS = dict(make_crma.EXTRA_BLURBS, **make_crma2.EXTRA_BLURBS2)
BLURBS.update({
    'Lower Thirds': 'Instructor card, name rule, topic tag, source credit, guest card — plus reveal name (block-reveal text), icon lower third, lesson number bar, member promo bar (pulsing JOIN button) and a looping "Now" topic tag.',
    'Titles': 'Sheet title, section header, definition, SAQL formula, key takeaway, quote — plus reveal title, stacked reveal, icon title and a floating badge that loops.',
    'Lessons': 'Lesson opener, step card, pro tip / warning / note, checklist, up next, recap — plus lesson introduction (objectives + chips), icon card, bullet card and a typed SAQL query card.',
    'Transitions': 'Sheet wipe, sheet slide, grid reveal, signal flash, blueprint zoom, block sweep, blinds, tile grid, iris, push blur, card stack.',
    'Intros': 'Academy intro (light, navy, short) timed to its music — plus a lesson intro (module · lesson, title, length, level; light and navy) and a hook question cold open. All 8 s: lay the 8 s intro music under them.',
    'Outros': 'Thanks for watching (light and navy) with a pulsing subscribe button, next lesson with course progress, and a minimal logo + URL outro. 8 s; the outro sting fits inside.',
    'Explain': 'Full-frame teaching slides for one idea: definition (term, word class, plain words, example, see also), worked example (question → steps → counted answer), do / don\'t, glossary, analogy and a concept map.',
    'Data and Tables': 'Data table with a Highlight Row pop-up, sample data builder (rows type themselves in — for "let\'s create some dummy data"), dataset schema (dimension / measure / date), filter rows (non-matching rows struck out) and group by (rows collapse into one per region).',
    'Diagrams': 'Join Venn with a Join Type pop-up (inner, left, right, full outer), join tables (keys light up, matches link, result table), append rows, recipe graph (input → filter → join → aggregate → output), dataflow pipeline with a travelling data packet, and an object model.',
    'Dashboards': 'A full dashboard mockup (filters, counting KPIs, bar and line widgets), KPI tiles, bar chart with a Highlight Bar pop-up, line chart, funnel and leaderboard. Bars grow and lines draw themselves.',
    'Screen and Camera': 'Layouts with drop wells: drag your screen recording onto Screen and your camera clip onto Camera in the Inspector. Screen and camera (Layout pop-up mirrors it), side by side (tall camera), camera focus (screen inset) and screen with a step rail.',
    'Text Animations': 'Word by word, typewriter console, highlight word (marker sweeps behind it), strike and replace, big statement, counter, question and keyword stack. Every word is its own text field.',
    'Arrows and Elements': 'Self-drawing arrow, arrow with label, elbow, curved and double arrows, circle highlight, draw box, underline, bracket, step badges (each with its own position), status stamp (check / cross / warning / info), data line, field tag and equation. Position, Size and Rotation are in the Inspector.',
})

MUSIC = [('CRMA Academy Intro (8s)', 'Matches Academy Intro / Academy Intro Navy. Riser, logo hit at 1.0 s, beat-synced words, final chord at 5.0 s.'),
         ('CRMA Academy Intro Short (4s)', 'Matches Academy Intro Short (hit at 0.5 s, lockup at 2.5 s).'),
         ('CRMA Outro Sting (6s)', 'For end screens and Lesson Outro.'),
         ('CRMA Lesson Bed (Loop 32s)', 'Quiet loop to sit under a voice-over. Seamless: place copies end to end.'),
         ('CRMA SFX Whoosh / Click / Pop / Riser / Logo Hit', 'Short sounds for transitions, click markers, badges and reveals.')]

MUSIC_HTML = ('<h2 id="music">Music &amp; sound</h2><p class="how"><b>Where:</b> the <code>Music</code> folder next to this guide (WAV for editing, M4A for small size). '
              'All tracks are original and royalty-free for your videos. <b>How:</b> in Final Cut Pro choose File → Import → Media, select the Music folder and import it '
              'into an event called <i>CRMA Music</i> — it then stays in your library for every project.</p><table><tr><th>Track</th><th>Use it for</th></tr>'
              + ''.join(f'<tr><td><b>{n}</b></td><td>{u}</td></tr>' for n, u in MUSIC) + '</table>'
              '<div class="steps"><ol><li><b>Intro with music:</b> drag <i>Academy Intro</i> to the start of the timeline, press <code>⌃D</code> and type <code>800</code> (8 seconds), '
              'then drag <i>CRMA Academy Intro (8s)</i> into the timeline below it, starting on the same frame. The logo hit and the final chord land on the picture. For <i>Academy Intro Short</i> use 4 seconds and the short track.</li>'
              '<li>Save it once as a compound clip (select both → <code>⌥G</code>) and drag the compound clip into the <i>CRMA Music</i> event — every new lesson can start with the same intro.</li>'
              '<li>Lesson bed: lower it to about −18 dB under a voice-over (or use Audio Ducking in the Audio Inspector).</li></ol></div>')

USE = ['<li><b>Intros</b> are full-frame and timed to their music — see <a href="#music">Music &amp; sound</a>. Edit the title, tagline, URL and the eight beat words (Word 1–8) in the Inspector.</li>',
       '<li><b>Slides</b> are full-frame teaching slides with their own graph-paper background. Type into the Text fields in the Inspector; every colour is published. Icons on slides are image wells — drag any icon or image from the browser onto <i>Icon 1</i>, <i>Icon 2</i> … to replace it.</li>',
       '<li><b>Query Block / Query Card</b>: type your SAQL into <i>Line 1</i> … <i>Line 7</i> (leave a line empty to skip it; up to about 44 characters per line). The lines type themselves on during the build-in; stretch the slide to hold it on screen longer.</li>',
       '<li><b>Quiz</b>: use two copies of the slide. Leave <i>Show Answer</i> on <i>Hidden</i> on the first (pause for viewers), set it to A, B or C on the second to highlight the correct option.</li>',
       '<li><b>Lower thirds, lessons and titles</b> have the <i>Animation</i> pop-up (slide, fade, pop, drop — fast or slow, or None). Text with a block reveal wipes on behind a colour bar; its colour is <i>Reveal Color</i>.</li>',
       '<li><b>End screens</b> go in the last 5–20 seconds of a YouTube video. Drop thumbnails onto the <i>Video</i> wells (or leave them empty and place YouTube\'s own end-screen elements on top). <i>Become a Member</i> and <i>Membership Perks</i> promote the academy; the button keeps pulsing.</li>',
       '<li><b>Effects</b> change the clip itself: put <i>Webcam Box</i> on your camera clip (above the screen recording) and pick a <i>Corner</i>; <i>Slow Push In</i> slowly zooms a talking head; <i>Drawing Sheet Frame</i> and <i>Figure Frame</i> put a screen recording on the blueprint sheet.</li>',
       '<li><b>Screen and Camera</b> titles hold your footage: select the title, then in the Title Inspector click the <i>Screen</i> or <i>Camera</i> well and click the clip in the timeline or browser. Or put <i>Camera Square</i> (Effects › CRMA › Screen Capture) on the camera clip and <i>Screen with Camera Space</i> on the recording under it.</li>',
       '<li><b>Arrows and elements</b> go above a recording: drag one in, set <i>Position</i>, <i>Size</i> and <i>Rotation</i> in the Inspector. Arrows draw themselves, then undraw at the end.</li>',
       '<li><b>Transitions</b> go on a cut; drag the edges to change speed.</li>',
       '<li>All templates use the Blueprint palette — paper <code>#F4F7FB</code>, ink <code>#0C1B33</code>, navy <code>#0F2A5C</code>, signal <code>#2F5BEA</code>, glow <code>#3FC6DC</code> — so pieces match out of the box.</li>']

README = '''CRM Analytics Academy — Lesson Kit for Final Cut Pro
=============================

{total} templates for CRM Analytics Academy lessons in the Blueprint style: academy intros with matching music,
teaching slides (agenda, bullets, icon cards, typed SAQL query blocks, quiz …), lower thirds, lesson cards,
titles, end screens that promote the membership, screen-capture callouts and frames, effects, transitions
and backgrounds. Every template is editable in the Final Cut Pro Inspector — no Motion needed.

Install
  1. Quit Final Cut Pro.
  2. Double-click "Install.command" (right-click → Open if macOS blocks it).
  3. Open Final Cut Pro. Everything is in one category, "CRMA", in the sidebar of the
     Titles, Transitions, Generators and Effects browsers, grouped inside it
     (Slides, Lessons, Lower Thirds ...). Install.command removes the old "CRMA-*" folders.

Manual install: copy each "CRMA" folder inside "Motion Templates" into
  ~/Movies/Motion Templates.localized/<Titles|Transitions|Generators|Effects>.localized/

Music
  The "Music" folder has the academy intro music (8 s and 4 s, timed to the Academy Intro
  titles), an outro sting, a 32 s seamless lesson bed and five sound effects. Original and
  royalty-free for your videos. Import the folder once into an event called "CRMA Music".

Guide
  Open "Guide.html" for every template, its folder and its controls, and for how to line
  the intro up with its music.

Fonts
  Schibsted Grotesk and IBM Plex Mono (free, open licence). Without them Final Cut Pro
  substitutes Helvetica; the templates still work.

Requirements
  Final Cut Pro 10.6 or later, macOS. Built at 1920×1080 / 30 fps; scales to any project.
'''


def main():
    make_guide.main(PREFIX='CRMA-', CATEGORY='CRMA', OUT=OUT, KIT=KIT, TITLE='CRM Analytics Academy — Lesson Kit for Final Cut Pro', ACCENT=make_crma.SIGNAL,
                    EXTRA=BLURBS, LEAD='intros with music, teaching slides, lower thirds, lesson cards, end screens, screen-capture callouts, effects, transitions and backgrounds for CRM Analytics Academy lessons',
                    USE=USE, EXTRA_HTML=MUSIC_HTML, FONTS='<b>Schibsted Grotesk</b> and <b>IBM Plex Mono</b>',
                    NOTES='Made for Final Cut Pro 10.6+ / Motion 5.6+ (macOS). 1920×1080 at 30 fps; works in any project size (templates scale). Icons are an original set; fonts are open-licence (Schibsted Grotesk, IBM Plex Mono). Music and sound effects are original.')
    path = os.path.join(KIT, 'Guide.html')
    s = open(path, encoding='utf-8').read()
    s = s.replace('"Geist Mono"', '"IBM Plex Mono"').replace('"Geist"', '"Schibsted Grotesk"').replace('--bg:#0a0a0a', '--bg:#0A1428')
    s = s.replace('<nav>', '<nav><a href="#music">Music &amp; sound</a> ', 1)
    open(path, 'w', encoding='utf-8').write(s)
    total = s.split('<p class="lead">', 1)[1].split(' ', 1)[0]
    open(os.path.join(KIT, 'README.txt'), 'w', encoding='utf-8').write(README.format(total=total))
    print('readme + guide:', total)


if __name__ == '__main__':
    main()
