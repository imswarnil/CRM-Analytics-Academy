"""make_crma.py — CRM Analytics Academy kit, in the site's "Blueprint" language.

Paper / ink, graph paper, "+" crop marks, rulers, square corners, 1.5px ink borders,
hard offset shadows, mono eyebrows ("FIG. 01 —"), Schibsted Grotesk + IBM Plex Mono.
Every folder inside Final Cut Pro starts with "CRMA - ". Output: content-creation/kit/ (repo-relative, resolved from this file)

    python make_crma.py [filter]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozml
from ozml import *
from make_titles import with_animation

KIT_DIR = ozml.KIT                       # <repo>/content-creation/kit
ozml.OUT = os.path.join(KIT_DIR, 'Motion Templates')
ozml.PREFIX = 'CRMA-'
ozml.CATEGORY = 'CRMA'                   # one CRMA category per browser; each group is a theme inside it

# ------------------------------------------------------------------ Blueprint tokens (app/assets/css/main.css)
PAPER, CARD, INK, INK2, LINE = '#F4F7FB', '#FBFCFE', '#0C1B33', '#3A4A66', '#C3D2E6'
NAVY, SIGNAL, TIDE, FROST, ICE, GLOW, XGRAY = '#0F2A5C', '#2F5BEA', '#3D8BD9', '#A8CCF2', '#DDEBFA', '#3FC6DC', '#7E93B5'
NIGHT = '#0A1428'
SANS = {'black': 'SchibstedGrotesk-Black', 'xbold': 'SchibstedGrotesk-ExtraBold', 'bold': 'SchibstedGrotesk-Bold',
        'semi': 'SchibstedGrotesk-SemiBold', 'med': 'SchibstedGrotesk-Medium', 'reg': 'SchibstedGrotesk-Regular'}
MONO = 'IBMPlexMono-Medium'
SHADOW = 10                      # hard offset shadow (5px at 540p)
BORDER = 3                       # 1.5px at 540p
Q, QQ = 5, 8                     # --duration-instant 150ms, --duration-quick 250ms in frames

DUR, LAST = 300, 299
LX, LY = -840, -330


def ent(x=0, y=0, dx=0, dy=0, delay=0, dur=QQ, scale=None, exit=True, sx=1.0, sy=1.0):
    """Snappy drafting entrance (ease-out-im) and mirrored ease-in exit."""
    a = {}
    if dx:
        a['X'] = glide(delay, x + dx, delay + dur, x) + (ease_in(LAST - dur - delay, x, LAST - delay, x + dx) if exit else [])
    if dy:
        a['Y'] = glide(delay, y + dy, delay + dur, y) + (ease_in(LAST - dur - delay, y, LAST - delay, y + dy) if exit else [])
    f = min(dur, 5)
    a['Opacity'] = ease(delay, 0, delay + f, 1) + (ease(LAST - f - delay, 1, LAST - delay, 0) if exit else [])
    if scale is not None:
        for k, full in (('SX', sx), ('SY', sy)):
            a[k] = spring(delay, scale * full, delay + dur + 3, full) + (ease_in(LAST - dur - delay, full, LAST - delay, scale * full) if exit else [])
    return a


def draw_x(x_left, w, delay=0, dur=QQ + 4, full=1.0, local_w=None):
    """A line drawn from its left edge: anchor at the left edge (local px) placed at x_left, scale X 0 -> full. w = on-screen width."""
    return {'anchor': (-(local_w or w) / 2, 0), 'x': x_left,
            'anim': {'SX': glide(delay, 0.0, delay + dur, full) + ease_in(LAST - dur - delay, full, LAST - delay, 0.0)}}


def T(d, s, name, weight, size, color, align='left', label=None, mono=False, **kw):
    return d.text(s, name, MONO if mono else SANS[weight], size, color, align, label, **kw)


def card(d, name, w, h, fill=CARD, border=INK, shadow=SHADOW, label='Card', **kw):
    """Square card: fill + ink border + hard offset shadow (down-right)."""
    c = d.solid(f'{name} Fill', w, h, fill, f'{label} Color')
    b = d.solid(f'{name} Border', w + 2 * BORDER, h + 2 * BORDER, border, f'{label} Border Color')
    sh = d.solid(f'{name} Shadow', w + 2 * BORDER, h + 2 * BORDER, border, None, x=shadow, y=-shadow, pub=[('./1/200/202', f'{label} Shadow')])
    return d.group(name, [c, b, sh], **kw)


def marks(d, w, h, color=XGRAY, label='Crop Mark Color', s=0.5):
    out = []
    for i, (x, y) in enumerate(((-w / 2, h / 2), (w / 2, h / 2), (w / 2, -h / 2), (-w / 2, -h / 2))):
        out.append(d.image('bp_cross.png', f'Mark {i + 1}', color=color, color_label=label if i == 0 else None, x=x, y=y, sx=s, sy=s))
    return out


def G(d, children, pub=None, **kw):
    seen, pubs = set(), []
    for ch, label in list(pub or []) + [('./1/100/101', 'Position'), ('./1/100/105', 'Size'), ('./1/200/202', 'Opacity')]:
        if ch not in seen:
            seen.add(ch)
            pubs.append((ch, label))
    return d.group('Title', children, pub=pubs, **kw)


def title(name, folder):
    return Doc('title', name, folder, DUR, (24, DUR - 24), 150)


# ================================================================== LOWER THIRDS
def lt_instructor(d):
    w, h = 760, 150
    cx, cy = LX + w / 2, LY + 40
    c = card(d, 'Card', w, h, anim=ent(cx, cy, dx=-40), x=cx, y=cy)
    eb = T(d, 'INSTRUCTOR —', 'Eyebrow', None, 22, SIGNAL, label='Eyebrow', mono=True, x=LX + 32, y=cy + 34, anim=ent(LX + 32, cy + 34, dx=-30, delay=3))
    nm = T(d, 'Swarnil Singhai', 'Name', 'xbold', 56, INK, label='Name', x=LX + 32, y=cy - 30, anim=ent(LX + 32, cy - 30, dx=-30, delay=5))
    logo = d.image('bp_logo.png', 'Logo', x=LX + w - 70, y=cy, sx=0.2, sy=0.2, anim=ent(LX + w - 70, cy, delay=6, scale=0.6, sx=0.2, sy=0.2), pub=[('./1/200/202', 'Logo Opacity')])
    return G(d, [eb, nm, logo, c])


def lt_name_rule(d):
    nm = T(d, 'Your Name', 'Name', 'black', 64, INK, label='Name', x=LX, y=LY + 50, anim=ent(LX, LY + 50, dy=-24))
    rule = d.solid('Rule', 560, BORDER, INK, 'Rule Color', y=LY + 30, **draw_x(LX, 560, 2))
    ruler = d.image('bp_ruler.png', 'Ruler', color=SIGNAL, color_label='Ruler Color', y=LY + 14, sy=0.6, opacity=0.7, **draw_x(LX, 560, 4, full=0.29, local_w=1920))
    role = T(d, 'CRM ANALYTICS · CONSULTANT', 'Role', None, 24, SIGNAL, label='Role', mono=True, x=LX, y=LY - 34, anim=ent(LX, LY - 34, dy=16, delay=6))
    plate = d.solid('Plate', 640, 170, PAPER, 'Plate Color', x=LX + 290, y=LY + 30, opacity=0.92, anim=ent(LX + 290, LY + 30, dx=-30), pub=[('./1/200/202', 'Plate Opacity')])
    return G(d, [nm, role, rule, ruler, plate])


def lt_topic_tag(d):
    w, h = 460, 64
    cx, cy = LX + w / 2, LY + 30
    c = card(d, 'Tag', w, h, fill=SIGNAL, shadow=6, label='Tag', x=cx, y=cy, anim=ent(cx, cy, dx=-30))
    t = T(d, 'SAQL · WINDOW FUNCTIONS', 'Topic', None, 24, WHITE, 'center', 'Topic', mono=True, x=cx, y=cy - 9, anim=ent(cx, cy - 9, dx=-30, delay=3))
    return G(d, [t, c])


def lt_source(d):
    w, h = 720, 96
    cx, cy = LX + w / 2, LY + 10
    c = card(d, 'Card', w, h, shadow=6, x=cx, y=cy, anim=ent(cx, cy, dy=-30))
    eb = T(d, 'SOURCE —', 'Eyebrow', None, 20, SIGNAL, label='Eyebrow', mono=True, x=LX + 24, y=cy + 14, anim=ent(LX + 24, cy + 14, dy=-20, delay=3))
    t = T(d, 'Salesforce Help · Analytics REST API', 'Source', 'med', 30, INK, label='Source', x=LX + 24, y=cy - 30, anim=ent(LX + 24, cy - 30, dy=-20, delay=4))
    return G(d, [eb, t, c])


def lt_guest(d):
    w, h = 820, 170
    cx, cy = LX + w / 2, LY + 50
    c = card(d, 'Card', w, h, fill=NAVY, border=INK, x=cx, y=cy, anim=ent(cx, cy, dx=-40))
    av = d.well('well_1x1.png', 'Photo', 'Photo', x=LX + 85, y=cy, sx=0.12, sy=0.12, anim=ent(LX + 85, cy, delay=3, scale=0.6, sx=0.12, sy=0.12))
    eb = T(d, 'GUEST —', 'Eyebrow', None, 22, GLOW, label='Eyebrow', mono=True, x=LX + 170, y=cy + 40, anim=ent(LX + 170, cy + 40, dx=-30, delay=4))
    nm = T(d, 'Guest Name', 'Name', 'xbold', 52, WHITE, label='Name', x=LX + 170, y=cy - 12, anim=ent(LX + 170, cy - 12, dx=-30, delay=5))
    rl = T(d, 'Role · Company', 'Role', 'med', 28, FROST, label='Role', x=LX + 170, y=cy - 58, anim=ent(LX + 170, cy - 58, dx=-30, delay=6))
    return G(d, [eb, nm, rl, av, c])


LOWER_THIRDS = {'Instructor Card': lt_instructor, 'Name Rule': lt_name_rule, 'Topic Tag': lt_topic_tag, 'Source Credit': lt_source, 'Guest Card': lt_guest}


# ================================================================== TITLES
def ti_sheet(d):
    eb = T(d, 'FIG. 01 — DATA PREP', 'Eyebrow', None, 28, SIGNAL, label='Eyebrow', mono=True, x=-840, y=150, anim=ent(-840, 150, dx=-30))
    tt = T(d, 'Recipes, step by step', 'Title', 'black', 120, INK, label='Title', x=-846, y=10, anim=ent(-846, 10, dy=-40, delay=3))
    ru = d.image('bp_ruler.png', 'Ruler', color=INK, color_label='Ruler Color', y=-60, opacity=0.6, **draw_x(-840, 1680, 5, full=0.875, local_w=1920))
    ld = T(d, 'Join, transform and shape data before it reaches a lens.', 'Lead', 'med', 38, INK2, label='Lead', x=-840, y=-130, anim=ent(-840, -130, dy=20, delay=7))
    plate = d.solid('Plate', 1920, 520, PAPER, 'Plate Color', y=10, opacity=0.95, pub=[('./1/200/202', 'Plate Opacity')], anim=ent(0, 10))
    return G(d, [eb, tt, ru, ld, plate])


def ti_section(d):
    sym = T(d, '§ 02', 'Number', None, 40, SIGNAL, label='Number', mono=True, x=-840, y=60, anim=ent(-840, 60, dx=-30))
    tt = T(d, 'Bindings', 'Title', 'black', 110, INK, label='Title', x=-846, y=-60, anim=ent(-846, -60, dy=-30, delay=3))
    ln = d.solid('Rule', 1680, BORDER, INK, 'Rule Color', y=-100, **draw_x(-840, 1680, 6))
    plate = d.solid('Plate', 1920, 340, PAPER, 'Plate Color', y=-10, opacity=0.95, pub=[('./1/200/202', 'Plate Opacity')], anim=ent(0, -10))
    return G(d, [sym, tt, ln, plate])


def ti_definition(d):
    w, h = 1100, 300
    c = card(d, 'Card', w, h, anim=ent(0, 0, dy=-40))
    mk = d.group('Marks', marks(d, w + 2 * BORDER, h + 2 * BORDER), anim=ent(0, 0, delay=4, scale=1.1))
    eb = T(d, 'DEFINITION —', 'Eyebrow', None, 24, SIGNAL, label='Eyebrow', mono=True, x=-500, y=100, anim=ent(-500, 100, dy=-20, delay=3))
    term = T(d, 'Lens', 'Term', 'black', 72, INK, label='Term', x=-500, y=10, anim=ent(-500, 10, dy=-20, delay=4))
    df = T(d, 'An ad-hoc exploration of one dataset.', 'Definition', 'med', 36, INK2, label='Definition', x=-500, y=-70, anim=ent(-500, -70, dy=-20, delay=6))
    return G(d, [eb, term, df, mk, c])


def ti_formula(d):
    w, h = 1300, 260
    c = card(d, 'Card', w, h, fill=NAVY, anim=ent(0, 0, dy=-40))
    eb = T(d, 'SAQL —', 'Eyebrow', None, 24, GLOW, label='Eyebrow', mono=True, x=-610, y=80, anim=ent(-610, 80, dy=-20, delay=3))
    code = T(d, "q = group q by 'Region';", 'Code', None, 44, WHITE, label='Code', mono=True, x=-610, y=0, anim=ent(-610, 0, dy=-20, delay=4))
    code2 = T(d, "q = foreach q generate sum('Amount') as 'Total';", 'Code 2', None, 34, FROST, label='Code 2', mono=True, x=-610, y=-70, anim=ent(-610, -70, dy=-20, delay=6))
    return G(d, [eb, code, code2, c])


def ti_takeaway(d):
    w, h = 1200, 220
    c = card(d, 'Card', w, h, fill=ICE, anim=ent(0, 0, scale=0.85))
    bar = d.solid('Bar', 14, h, SIGNAL, 'Bar Color', x=-w / 2 + 7, anim=ent(-w / 2 + 7, 0, delay=2))
    eb = T(d, 'KEY TAKEAWAY —', 'Eyebrow', None, 24, SIGNAL, label='Eyebrow', mono=True, x=-550, y=50, anim=ent(-550, 50, dx=-20, delay=3))
    tx = T(d, 'Filter early: every row you drop is one you never join.', 'Text', 'bold', 44, INK, label='Text', x=-550, y=-30, anim=ent(-550, -30, dx=-20, delay=5))
    return G(d, [eb, tx, bar, c])


def ti_quote(d):
    mk = T(d, '“', 'Mark', 'black', 220, SIGNAL, 'left', 'Mark', x=-860, y=40, anim=ent(-860, 40, dy=20))
    q = T(d, 'If the data is wrong, the dashboard is a lie.', 'Quote', 'bold', 60, INK, 'left', 'Quote', x=-760, y=0, anim=ent(-760, 0, dy=-20, delay=3))
    a = T(d, '— WHO SAID IT', 'Author', None, 26, SIGNAL, 'left', 'Author', mono=True, x=-760, y=-80, anim=ent(-760, -80, dy=16, delay=7))
    plate = d.solid('Plate', 1920, 360, PAPER, 'Plate Color', y=-10, opacity=0.95, pub=[('./1/200/202', 'Plate Opacity')], anim=ent(0, -10))
    return G(d, [mk, q, a, plate])


TITLES = {'Sheet Title': ti_sheet, 'Section Header': ti_section, 'Definition Card': ti_definition, 'Formula Card': ti_formula,
          'Key Takeaway': ti_takeaway, 'Quote': ti_quote}


# ================================================================== LESSONS
def le_opener(d):
    w, h = 1000, 360
    c = card(d, 'Card', w, h, anim=ent(0, 20, dy=-40), y=20)
    mk = d.group('Marks', marks(d, w + 2 * BORDER, h + 2 * BORDER), y=20, anim=ent(0, 20, delay=4, scale=1.1))
    eb = T(d, 'MODULE 03 · LESSON 04', 'Eyebrow', None, 26, SIGNAL, label='Eyebrow', mono=True, x=-450, y=140, anim=ent(-450, 140, dy=-20, delay=3))
    tt = T(d, 'Window functions', 'Title', 'black', 84, INK, label='Title', x=-454, y=40, anim=ent(-454, 40, dy=-20, delay=4))
    ru = d.image('bp_ruler.png', 'Ruler', color=INK, color_label='Ruler Color', y=-20, opacity=0.6, **draw_x(-450, 900, 6, full=0.47, local_w=1920))
    meta = T(d, '12 MIN · INTERMEDIATE', 'Meta', None, 24, INK2, label='Meta', mono=True, x=-450, y=-90, anim=ent(-450, -90, dy=16, delay=7))
    return G(d, [eb, tt, ru, meta, mk, c])


def le_step(d):
    w, h = 820, 120
    cx, cy = -840 + w / 2, 400
    c = card(d, 'Card', w, h, shadow=6, x=cx, y=cy, anim=ent(cx, cy, dy=30))
    num = d.solid('Badge', 120, h, SIGNAL, 'Badge Color', x=-840 + 60, y=cy, anim=ent(-840 + 60, cy, dy=30, delay=1))
    nt = T(d, '01', 'Step', 'black', 56, WHITE, 'center', 'Step', x=-840 + 60, y=cy - 20, anim=ent(-840 + 60, cy - 20, dy=30, delay=2))
    of = T(d, 'STEP 01 / 05', 'Counter', None, 20, SIGNAL, label='Counter', mono=True, x=-690, y=cy + 22, anim=ent(-690, cy + 22, dx=-20, delay=3))
    tx = T(d, 'Open Data Manager → Recipes', 'Text', 'bold', 36, INK, label='Text', x=-690, y=cy - 32, anim=ent(-690, cy - 32, dx=-20, delay=4))
    return G(d, [nt, of, tx, num, c])


def callout_card(eyebrow, color, text, fill=CARD):
    def build(d):
        w, h = 900, 170
        cx, cy = 860 - w / 2, 360
        c = card(d, 'Card', w, h, fill=fill, x=cx, y=cy, anim=ent(cx, cy, dx=40))
        bar = d.solid('Bar', 12, h, color, 'Bar Color', x=cx - w / 2 + 6, y=cy, anim=ent(cx - w / 2 + 6, cy, dx=40, delay=1))
        eb = T(d, eyebrow, 'Eyebrow', None, 22, color, label='Eyebrow', mono=True, x=cx - w / 2 + 40, y=cy + 34, anim=ent(cx - w / 2 + 40, cy + 34, dx=30, delay=3))
        tx = T(d, text, 'Text', 'bold', 34, INK, label='Text', x=cx - w / 2 + 40, y=cy - 30, anim=ent(cx - w / 2 + 40, cy - 30, dx=30, delay=4))
        return G(d, [eb, tx, bar, c])
    return build


def le_checklist(d):
    w, h = 820, 330
    c = card(d, 'Card', w, h, anim=ent(0, 0, dy=-40))
    eb = T(d, 'CHECKLIST —', 'Eyebrow', None, 24, SIGNAL, label='Eyebrow', mono=True, x=-370, y=120, anim=ent(-370, 120, dy=-20, delay=3))
    out = [eb]
    for i, s in enumerate(('Dataset is synced', 'Fields are typed', 'Security predicate set')):
        y = 40 - i * 70
        out.append(d.solid(f'Box {i + 1}', 30, 30, SIGNAL, 'Tick Color' if i == 0 else None, x=-355, y=y + 12, anim=ent(-355, y + 12, delay=6 + 4 * i, scale=0.0)))
        out.append(T(d, s, f'Item {i + 1}', 'semi', 36, INK, label=f'Item {i + 1}', x=-310, y=y, anim=ent(-310, y, dx=-20, delay=6 + 4 * i)))
    return G(d, out + [c])


def le_up_next(d):
    w, h = 760, 150
    cx, cy = 860 - w / 2, -330
    c = card(d, 'Card', w, h, x=cx, y=cy, anim=ent(cx, cy, dx=40))
    eb = T(d, 'UP NEXT →', 'Eyebrow', None, 22, SIGNAL, label='Eyebrow', mono=True, x=cx - w / 2 + 32, y=cy + 30, anim=ent(cx - w / 2 + 32, cy + 30, dx=30, delay=3))
    tt = T(d, 'Bindings & interactions', 'Title', 'xbold', 46, INK, label='Title', x=cx - w / 2 + 32, y=cy - 34, anim=ent(cx - w / 2 + 32, cy - 34, dx=30, delay=4))
    return G(d, [eb, tt, c])


def le_recap(d):
    w, h = 1100, 400
    c = card(d, 'Card', w, h, anim=ent(0, 0, dy=-40))
    mk = d.group('Marks', marks(d, w + 2 * BORDER, h + 2 * BORDER), anim=ent(0, 0, delay=4, scale=1.1))
    eb = T(d, 'RECAP —', 'Eyebrow', None, 24, SIGNAL, label='Eyebrow', mono=True, x=-500, y=150, anim=ent(-500, 150, dy=-20, delay=3))
    out = [eb]
    for i, s in enumerate(('Group before you aggregate', 'Use windowing for running totals', 'Keep SAQL readable with names')):
        y = 60 - i * 80
        out.append(T(d, f'0{i + 1}', f'Num {i + 1}', None, 30, SIGNAL, label=None, mono=True, x=-500, y=y, anim=ent(-500, y, dx=-20, delay=6 + 4 * i)))
        out.append(T(d, s, f'Point {i + 1}', 'semi', 38, INK, label=f'Point {i + 1}', x=-430, y=y - 4, anim=ent(-430, y - 4, dx=-20, delay=6 + 4 * i)))
    return G(d, out + [mk, c])


LESSONS = {'Lesson Opener': le_opener, 'Step Card': le_step, 'Pro Tip': callout_card('PRO TIP —', SIGNAL, 'Use ‘foreach’ after ‘group’, never before.'),
           'Warning': callout_card('WATCH OUT —', '#D9483B', 'Recipes run on the full dataset, not the preview.'),
           'Note': callout_card('NOTE —', TIDE, 'This lesson uses the Opportunities sample data.', fill=ICE),
           'Checklist': le_checklist, 'Up Next': le_up_next, 'Recap': le_recap}


# ================================================================== SCREEN CAPTURE (callouts over a screen recording)
def sc_highlight(d):
    box = d.image('bp_box_800x450.png', 'Box', color=SIGNAL, color_label='Box Color', sx=0.6, sy=0.5, anim=ent(0, 0, scale=1.2, sx=0.6, sy=0.5), pub=[('./1/100/105', 'Box Size')])
    fill = d.solid('Tint', 480, 225, SIGNAL, None, opacity=0.08, anim=ent(0, 0, scale=1.2), pub=[('./1/200/202', 'Tint')])
    mk = d.group('Marks', marks(d, 480, 225, SIGNAL, 'Mark Color', 0.45), anim=ent(0, 0, scale=1.3))
    tag = d.solid('Label Plate', 220, 40, SIGNAL, 'Label Color', x=-130, y=134, anim=ent(-130, 134, dy=-16, delay=4))
    tt = T(d, 'FIG. 02 — FILTER', 'Label', None, 20, WHITE, 'center', 'Label', mono=True, x=-130, y=126, anim=ent(-130, 126, dy=-16, delay=5))
    return G(d, [tt, tag, mk, box, fill])


def sc_click(d):
    pulse = []
    for s in range(0, DUR, 36):
        pulse += [key(s, 0.2, 'steep'), key(s + 18, 1.0, 'soft'), key(s + 35, 1.0)]
    fade = []
    for s in range(0, DUR, 36):
        fade += [key(s, 1.0), key(s + 18, 0.0), key(s + 35, 0.0)]
    ring = d.image('bp_ring.png', 'Ring', color=SIGNAL, color_label='Ring Color', anim={'SX': pulse, 'SY': pulse, 'Opacity': fade})
    dot = d.image('dot_32.png', 'Dot', color=SIGNAL, color_label='Dot Color', anim=ent(0, 0, scale=0.0))
    cur = d.image('bp_cursor.png', 'Cursor', color=INK, color_label='Cursor Color', x=40, y=-56, sx=0.5, sy=0.5, anim=ent(40, -56, dx=120, dy=-80, dur=12))
    return G(d, [cur, dot, ring])


def sc_badge(d):
    sq = d.solid('Badge', 64, 64, SIGNAL, 'Badge Color', anim=ent(0, 0, scale=0.0))
    sh = d.solid('Shadow', 64, 64, INK, None, x=5, y=-5, anim=ent(5, -5, scale=0.0))
    n = T(d, '1', 'Number', 'black', 40, WHITE, 'center', 'Number', y=-14, anim=ent(0, -14, scale=0.0, delay=1))
    return G(d, [n, sq, sh])


def sc_pointer(d):
    ptr = d.image('pointer.png', 'Pointer', color=SIGNAL, color_label='Line Color', x=-200, y=-100, anim=ent(-200, -100, scale=0.6))
    c = card(d, 'Card', 420, 70, shadow=6, x=270, y=10, anim=ent(270, 10, dx=-20, delay=4))
    tx = T(d, 'Click “Run Query”', 'Label', 'bold', 32, INK, 'center', 'Label', x=270, y=-2, anim=ent(270, -2, dx=-20, delay=5))
    return G(d, [tx, c, ptr])


def sc_keys(d):
    out = []
    for i, k in enumerate(('⌘', 'K')):
        x = -50 + i * 110
        out.append(T(d, k, f'Key {i + 1}', 'bold', 52, INK, 'center', f'Key {i + 1}', x=x, y=-18, anim=ent(x, -18, delay=2 * i + 2)))
        out.append(card(d, f'Cap {i + 1}', 90, 90, shadow=6, label='Key' if i == 0 else f'Key {i + 1}', x=x, y=0, anim=ent(x, 0, delay=2 * i, scale=0.7)))
    return G(d, out)


SCREEN = {'Highlight Box': sc_highlight, 'Click Marker': sc_click, 'Number Badge': sc_badge, 'Pointer Label': sc_pointer, 'Shortcut Keys': sc_keys}


# ================================================================== SCENES (full frame)
def backdrop(d, dark=False):
    bg = d.solid('Paper', 1920, 1080, NIGHT if dark else PAPER, 'Paper Color')
    gr = d.image('bp_graph.png', 'Graph Paper', color=FROST if dark else SIGNAL, color_label='Graph Color', opacity=0.22 if dark else 0.16,
                 anim={'X': (ease(0, -16, LAST, 16), 'linear')}, pub=[('./1/200/202', 'Graph Opacity')])
    return [gr, bg]


def sn_course_intro(d):
    logo = d.image('bp_logo.png', 'Logo', y=150, sx=0.45, sy=0.45, anim=ent(0, 150, scale=0.6, dur=QQ + 4, sx=0.45, sy=0.45))
    tt = T(d, 'CRM Analytics Academy', 'Title', 'black', 104, INK, 'center', 'Title', y=-60, anim=ent(0, -60, dy=-40, delay=6))
    ru = d.image('bp_ruler.png', 'Ruler', color=INK, color_label='Ruler Color', y=-110, opacity=0.6, **draw_x(-480, 960, 9, full=0.5, local_w=1920))
    url = T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 30, SIGNAL, 'center', 'URL', mono=True, y=-180, anim=ent(0, -180, dy=20, delay=12))
    return G(d, [logo, tt, ru, url] + backdrop(d))


def sn_module(d):
    num = T(d, 'MODULE', 'Label', None, 32, SIGNAL, label='Label', mono=True, x=-840, y=260, anim=ent(-840, 260, dx=-30))
    big = T(d, '03', 'Number', 'black', 300, INK, label='Number', x=-856, y=-20, anim=ent(-856, -20, dy=-60, delay=2, dur=QQ + 4))
    ln = d.solid('Rule', 1680, BORDER, INK, 'Rule Color', y=-80, **draw_x(-840, 1680, 6))
    tt = T(d, 'SAQL fundamentals', 'Title', 'xbold', 80, INK, label='Title', x=-840, y=-190, anim=ent(-840, -190, dx=-40, delay=8))
    meta = T(d, '6 LESSONS · 48 MIN', 'Meta', None, 28, INK2, 'right', 'Meta', mono=True, x=840, y=-190, anim=ent(840, -190, dx=40, delay=10))
    return G(d, [num, big, ln, tt, meta] + backdrop(d))


def sn_kpi(d):
    w, h = 900, 460
    c = card(d, 'Card', w, h, anim=ent(0, 0, dy=-40))
    mk = d.group('Marks', marks(d, w + 2 * BORDER, h + 2 * BORDER), anim=ent(0, 0, delay=4, scale=1.1))
    eb = T(d, 'FIG. 04 — WIN RATE', 'Eyebrow', None, 28, SIGNAL, 'center', 'Eyebrow', mono=True, y=160, anim=ent(0, 160, dy=-20, delay=3))
    n = d.number(0, 38, 'KPI', SANS['black'], 220, INK, publish='KPI', x=-40, y=-20, anim=ent(-40, -20, dy=-30, delay=4))
    pct = T(d, '%', 'Unit', 'black', 120, SIGNAL, label='Unit', x=150, y=-30, anim=ent(150, -30, dy=-30, delay=5))
    bar = d.image('bp_hatch.png', 'Bar', y=-160, **draw_x(-365, 730, 6, dur=114, full=0.38, local_w=1920))
    track = d.solid('Track', 730, 24, ICE, 'Track Color', y=-160)
    return G(d, [eb, n, pct, bar, track, mk, c] + backdrop(d))


def sn_outro(d):
    tt = T(d, 'Lesson complete', 'Title', 'black', 110, INK, 'center', 'Title', y=120, anim=ent(0, 120, dy=-40))
    btn = card(d, 'Button', 560, 100, fill=SIGNAL, label='Button', y=-40, anim=ent(0, -40, delay=6, scale=0.7))
    bt = T(d, 'NEXT LESSON →', 'Button Text', None, 34, WHITE, 'center', 'Button', mono=True, y=-52, anim=ent(0, -52, delay=7))
    url = T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 28, SIGNAL, 'center', 'URL', mono=True, y=-200, anim=ent(0, -200, dy=20, delay=10))
    return G(d, [tt, bt, btn, url] + backdrop(d))


def sn_divider(d):
    eb = T(d, 'SHEET 02 /', 'Eyebrow', None, 30, GLOW, 'center', 'Eyebrow', mono=True, y=80, anim=ent(0, 80, dy=-20))
    tt = T(d, 'Hands-on', 'Title', 'black', 140, WHITE, 'center', 'Title', y=-60, anim=ent(0, -60, dy=-40, delay=3))
    ru = d.image('bp_ruler.png', 'Ruler', color=FROST, color_label='Ruler Color', y=-120, opacity=0.6, **draw_x(-384, 768, 6, full=0.4, local_w=1920))
    return G(d, [eb, tt, ru] + backdrop(d, dark=True))


SCENES = {'Course Intro': sn_course_intro, 'Module Title': sn_module, 'KPI Figure': sn_kpi, 'Lesson Outro': sn_outro, 'Section Divider': sn_divider}


# ================================================================== SCREEN CAPTURE EFFECTS (applied to the recording)
def fx_doc(name):
    return Doc('effect', name, 'Screen Capture', DUR, poster=30, loop=True)


def ef_figure(d):
    s = 0.78
    w, h = 1920 * s, 1080 * s
    clip = d.drop_zone('Effect Source', y=30, sx=s, sy=s, pub=[('./1/100/105', 'Screen Size'), ('./1/100/101', 'Screen Position')])
    border = d.solid('Border', w + 2 * BORDER, h + 2 * BORDER, INK, 'Border Color', y=30)
    sh = d.solid('Shadow', w + 2 * BORDER, h + 2 * BORDER, INK, None, x=SHADOW + 4, y=30 - SHADOW - 4, pub=[('./1/200/202', 'Shadow')])
    mk = d.group('Marks', marks(d, w + 2 * BORDER, h + 2 * BORDER), y=30)
    cap = T(d, 'FIG. 01 — DATASET OVERVIEW', 'Caption', None, 26, SIGNAL, label='Caption', mono=True, x=-w / 2, y=-h / 2 - 20)
    return d.group('Effect', [cap, mk, clip, border, sh] + backdrop(d))


def ef_window(d):
    s = 0.8
    w, h = 1920 * s, 1080 * s
    clip = d.drop_zone('Effect Source', y=-24, sx=s, sy=s, pub=[('./1/100/105', 'Screen Size'), ('./1/100/101', 'Screen Position')])
    bar = d.solid('Title Bar', w, 56, INK, 'Bar Color', y=-24 + h / 2 + 28)
    url = T(d, 'crmanalytics.imswarnil.com', 'URL', None, 22, FROST, 'center', 'URL', mono=True, y=-24 + h / 2 + 20)
    dots = [d.solid(f'Light {i + 1}', 14, 14, c, None, x=-w / 2 + 30 + i * 26, y=-24 + h / 2 + 28) for i, c in enumerate((SIGNAL, TIDE, GLOW))]
    border = d.solid('Border', w + 2 * BORDER, h + 56 + 2 * BORDER, INK, 'Border Color', y=-24 + 28)
    sh = d.solid('Shadow', w + 2 * BORDER, h + 56 + 2 * BORDER, INK, None, x=SHADOW + 4, y=-24 + 28 - SHADOW - 4, pub=[('./1/200/202', 'Shadow')])
    return d.group('Effect', [url] + dots + [bar, clip, border, sh] + backdrop(d))


AMOUNTS = [('Normal', 1.0), ('Subtle', 0.5), ('Close', 1.8), ('Very Close', 2.8)]


def ef_zoom(d):
    wid = d.popup('Zoom Amount', [n for n, _ in AMOUNTS], 0)
    k = lambda f: glide(0, 1.0, QQ + 4, 1 + 0.4 * f) + ease(QQ + 4, 1 + 0.4 * f, LAST - QQ - 4, 1 + 0.4 * f) + ease_in(LAST - QQ - 4, 1 + 0.4 * f, LAST, 1.0)
    clip = d.drop_zone('Effect Source', pub=[('./1/100/101', 'Zoom Center')], rigs=[(wid, {'SX': [k(f) for _, f in AMOUNTS], 'SY': [k(f) for _, f in AMOUNTS]})])
    return d.group('Effect', [clip])


def ef_spot(d):
    clip = d.drop_zone('Effect Source')
    dim = d.image('spot_dark.png', 'Dim', color=INK, color_label='Dim Color', opacity=0.7, pub=[('./1/200/202', 'Dim Amount'), ('./1/100/101', 'Spot Position'), ('./1/100/105', 'Spot Size')])
    return d.group('Effect', [dim, clip])


def ef_paper_pad(d):
    s = 0.5
    clip = d.drop_zone('Effect Source', x=420, sx=s, sy=s, pub=[('./1/100/105', 'Screen Size'), ('./1/100/101', 'Screen Position')])
    border = d.solid('Border', 960 + 2 * BORDER, 540 + 2 * BORDER, INK, 'Border Color', x=420)
    sh = d.solid('Shadow', 960 + 2 * BORDER, 540 + 2 * BORDER, INK, None, x=420 + SHADOW, y=-SHADOW)
    eb = T(d, 'FIG. 03 —', 'Eyebrow', None, 28, SIGNAL, label='Eyebrow', mono=True, x=-840, y=120)
    tt = T(d, 'What you see here', 'Title', 'black', 72, INK, label='Title', x=-844, y=20)
    tx = T(d, 'Explain the screen on the left.', 'Text', 'med', 34, INK2, label='Text', x=-840, y=-60)
    return d.group('Effect', [eb, tt, tx, clip, border, sh] + backdrop(d))


SCREEN_FX = {'Figure Frame': ef_figure, 'Blueprint Window': ef_window, 'Zoom to Detail': ef_zoom, 'Spotlight': ef_spot, 'Side Panel': ef_paper_pad}


# ================================================================== TRANSITIONS
N, MID = 51, 25
E = N - 1


def tr_doc(name):
    return Doc('transition', name, 'Transitions', N, poster=MID)


HOLD_A = [(0, 1), (MID, 0)]
HOLD_B = [(0, 0), (MID, 1)]


def tr_sheet_wipe(d):
    a = d.transition_zone('A', anim={'CropR': glide(0, 0, E, 1920)})
    b = d.transition_zone('B')
    band = d.solid('Paper Band', 120, 1080, PAPER, 'Band Color', anim={'X': glide(0, 1020, E, -1020)})
    edge = d.solid('Edge', BORDER * 2, 1080, INK, 'Edge Color', anim={'X': glide(0, 960, E, -1080)})
    sig = d.solid('Signal', 10, 1080, SIGNAL, 'Signal Color', anim={'X': glide(0, 1080, E, -960)})
    return d.group('Transition', [sig, edge, band, a, b])


def tr_sheet_slide(d):
    b = d.transition_zone('B', anim={'X': glide(0, 1920, E, 0)})
    sh = d.solid('Shadow', 1920, 1080, INK, None, y=-SHADOW * 2, anim={'X': glide(0, 1920 + SHADOW * 2, E, SHADOW * 2), 'Opacity': ease(E - 4, 1, E, 0)})
    a = d.transition_zone('A', anim={'X': glide(0, 0, E, -480)})
    return d.group('Transition', [b, sh, a])


def tr_grid_reveal(d):
    a = d.transition_zone('A', anim={'Opacity': (HOLD_A, 'hold')})
    b = d.transition_zone('B', anim={'Opacity': (HOLD_B, 'hold')})
    paper = d.solid('Paper', 1920, 1080, PAPER, 'Paper Color', anim={'Opacity': ease(0, 0, MID - 6, 1) + ease(MID + 6, 1, E, 0)})
    grid = d.image('bp_graph.png', 'Graph', color=SIGNAL, color_label='Graph Color', anim={'Opacity': ease(4, 0, MID, 0.35) + ease(MID, 0.35, E - 4, 0), 'SX': ease(0, 1.2, E, 1.0), 'SY': ease(0, 1.2, E, 1.0)})
    return d.group('Transition', [grid, paper, a, b])


def tr_signal_flash(d):
    a = d.transition_zone('A', anim={'Opacity': (HOLD_A, 'hold')})
    b = d.transition_zone('B', anim={'Opacity': (HOLD_B, 'hold')})
    f = d.solid('Flash', 1920, 1080, SIGNAL, 'Flash Color', anim={'Opacity': [key(0, 0, 'in'), key(MID, 1, 'infast'), key(E, 0, 'soft')]})
    return d.group('Transition', [f, a, b])


def tr_zoom(d):
    zb = lambda keys: Filter('PAEZoomBlur', 'Zoom Blur', {'Amount#1': keys, 'Crop#3': 0}, [('10001', 'Blur Amount')])
    a = d.transition_zone('A', [zb([key(0, 0, 'in'), key(MID, 50, 'infast')])], anim={'SX': ease_in(0, 1.0, MID + 2, 1.5), 'SY': ease_in(0, 1.0, MID + 2, 1.5), 'Opacity': ease(14, 1, MID + 2, 0)})
    b = d.transition_zone('B', [zb([key(MID - 2, 50, 'steep'), key(E, 0, 'soft')])], anim={'SX': glide(MID - 4, 0.7, E, 1.0), 'SY': glide(MID - 4, 0.7, E, 1.0), 'Opacity': ease(MID - 4, 0, MID + 4, 1)})
    marks_ = d.group('Marks', marks(d, 1600, 900, SIGNAL, 'Mark Color', 1.0), anim={'Opacity': ease(MID - 8, 0, MID, 1) + ease(MID, 1, MID + 10, 0), 'SX': ease(MID - 8, 1.3, MID + 10, 0.9), 'SY': ease(MID - 8, 1.3, MID + 10, 0.9)})
    return d.group('Transition', [marks_, a, b])


TRANSITIONS = {'Sheet Wipe': tr_sheet_wipe, 'Sheet Slide': tr_sheet_slide, 'Grid Reveal': tr_grid_reveal, 'Signal Flash': tr_signal_flash, 'Blueprint Zoom': tr_zoom}


# ================================================================== GENERATORS
def gn_doc(name, folder):
    return Doc('generator', name, folder, 600, poster=60)


def gb_light(d):
    return d.group('Background', backdrop(d))


def gb_navy(d):
    return d.group('Background', backdrop(d, dark=True))


def gb_frame(d):
    bg = backdrop(d)
    mk = marks(d, 1760, 920, XGRAY, 'Mark Color', 1.0)
    rt = d.image('bp_ruler.png', 'Ruler Top', color=INK, color_label='Ruler Color', y=500, opacity=0.5)
    rb = d.image('bp_ruler.png', 'Ruler Bottom', color=INK, y=-500, rot=180, opacity=0.5)
    sheet = T(d, 'SHEET 01 / CRM ANALYTICS ACADEMY', 'Sheet', None, 22, INK2, 'right', 'Sheet Label', mono=True, x=860, y=-470)
    return d.group('Background', [sheet, rt, rb] + mk + bg)


def ge_progress(d):
    wid = d.popup('Fill', ['Whole clip', 'First half', 'Second half', 'Fast start'], 0)
    track = d.solid('Track', 1600, 24, ICE, 'Track Color', y=-480)
    border = d.solid('Border', 1600 + 2 * BORDER, 24 + 2 * BORDER, INK, 'Border Color', y=-480)
    fills = [ease(0, 0.0, 599, 0.833), ease(0, 0.0, 299, 0.833), ease(0, 0, 299, 0) + ease(299, 0.0, 599, 0.833), glide(0, 0.0, 599, 0.833)]
    fill = d.image('bp_hatch.png', 'Fill', y=-480, anchor=(-960, 0), x=-800, rigs=[(wid, {'SX': fills}, 'linear', {'anchor': (-800, 0), 'x': -800})])
    lab = T(d, 'LESSON PROGRESS', 'Label', None, 20, SIGNAL, label='Label', mono=True, x=-800, y=-450)
    return d.group('Progress', [lab, fill, track, border], pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size')])


def ge_countdown(d):
    c = card(d, 'Card', 360, 300)
    n = d.number(10, 0, 'Countdown', SANS['black'], 200, INK, publish='Countdown', y=-20)
    eb = T(d, 'STARTS IN', 'Label', None, 22, SIGNAL, 'center', 'Label', mono=True, y=100)
    return d.group('Countdown', [eb, n, c], pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size')])


def ge_logo_bug(d):
    logo = d.image('bp_logo.png', 'Logo', x=820, y=420, sx=0.16, sy=0.16, opacity=0.9, pub=[('./1/200/202', 'Logo Opacity'), ('./1/100/101', 'Logo Position'), ('./1/100/105', 'Logo Size')])
    url = T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 18, INK, 'right', 'URL', mono=True, x=860, y=-480, opacity=0.8)
    return d.group('Logo Bug', [logo, url])


GEN = [('Backgrounds', {'Graph Paper': gb_light, 'Graph Paper Navy': gb_navy, 'Drawing Sheet': gb_frame}),
       ('Elements', {'Progress Bar': ge_progress, 'Countdown': ge_countdown, 'Logo Bug': ge_logo_bug})]


# ================================================================== build
def thumb_bp(name, kind):
    grid = ''.join(f'<line x1="{x}" y1="-140" x2="{x}" y2="500" stroke="{SIGNAL}" stroke-opacity=".12"/>' for x in range(0, 640, 20))
    grid += ''.join(f'<line x1="0" y1="{y}" x2="640" y2="{y}" stroke="{SIGNAL}" stroke-opacity=".12"/>' for y in range(-140, 500, 20))
    cross = lambda x, y: f'<path d="M{x - 10} {y}h20M{x} {y - 10}v20" stroke="{XGRAY}" stroke-width="2"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 -140 640 640"><rect y="-140" width="640" height="640" fill="{PAPER}"/>{grid}'
            f'<rect x="46" y="76" width="548" height="170" fill="{INK}"/><rect x="38" y="68" width="548" height="170" fill="{CARD}" stroke="{INK}" stroke-width="3"/>'
            + cross(38, 68) + cross(586, 68) + cross(38, 238) + cross(586, 238) +
            f'<text x="60" y="112" fill="{SIGNAL}" font-family="IBM Plex Mono, Menlo" font-size="16" letter-spacing="2">{esc(kind.upper())} —</text>'
            f'<text x="60" y="170" fill="{INK}" font-family="Schibsted Grotesk, Helvetica" font-weight="900" font-size="38">{esc(name)}</text>'
            f'<rect x="60" y="196" width="40" height="40" fill="none"/><text x="60" y="222" fill="{INK2}" font-family="IBM Plex Mono, Menlo" font-size="14">CRM ANALYTICS ACADEMY</text></svg>')


EXTRA_BLURBS = {
    'Lower Thirds': 'Instructor card (with logo), name rule with ruler, topic tag, source credit, guest card with a photo well.',
    'Titles': 'Sheet title (FIG. eyebrow + ruler), section header (§), definition card, SAQL formula card, key takeaway, quote.',
    'Lessons': 'Lesson opener (module · lesson · length), step card, pro tip / warning / note callouts, checklist, up next, recap.',
    'Screen Capture': 'Titles: highlight box, click marker, number badge, pointer label, shortcut keys — put them above a screen recording. Effects: figure frame, blueprint window, zoom to detail, spotlight, side panel — put them on the recording itself.',
    'Scenes': 'Full-frame graph-paper scenes: course intro, module title, KPI figure (counting number), lesson outro, section divider (navy).',
    'Transitions': 'Sheet wipe, sheet slide (hard shadow), grid reveal, signal flash, blueprint zoom.',
    'Backgrounds': 'Graph paper (paper / navy) and a drawing sheet with rulers and crop marks.',
    'Elements': 'Hatched lesson progress bar, countdown card, logo bug.',
}


def build_all(only=None):
    jobs = [('title', 'Lower Thirds', LOWER_THIRDS), ('title', 'Titles', TITLES), ('title', 'Lessons', LESSONS), ('title', 'Screen Capture', SCREEN), ('title', 'Scenes', SCENES)]
    for kind, folder, items in jobs:
        for name, fn in items.items():
            if only and only not in name and only not in folder:
                continue
            d = title(name, folder)
            body = fn(d)
            if folder != 'Scenes':
                body = with_animation(d, body)
            d.write(body, thumb_bp(name, folder))
    for name, fn in SCREEN_FX.items():
        if only and only not in name and 'Screen' not in (only or 'Screen'):
            continue
        d = fx_doc(name)
        d.write(fn(d), thumb_bp(name, 'Screen Capture'))
    for name, fn in TRANSITIONS.items():
        if only and only not in name and only != 'Transitions':
            continue
        d = tr_doc(name)
        d.write(fn(d), thumb_bp(name, 'Transition'))
    for folder, items in GEN:
        for name, fn in items.items():
            if only and only not in name and only not in folder:
                continue
            d = gn_doc(name, folder)
            d.write(fn(d), thumb_bp(name, folder))


if __name__ == '__main__':
    build_all(sys.argv[1] if len(sys.argv) > 1 else None)
