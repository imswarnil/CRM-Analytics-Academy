"""make_crma2.py — CRMA kit, part 2: academy intros (with matching music), teaching slides, end screens that
promote membership, more lower thirds / lesson cards / titles with block-reveal & typing text, CRMA effects and
transitions. Same Blueprint language and output folder as make_crma.py.

    python make_crma2.py [filter]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_crma as mc
from make_crma import *
from make_effects import SAT, TINT, CONTRAST, GAMMA

RED = '#D9483B'


def doc(kind, name, folder, dur=300, build=None, poster=None, loop=False):
    mc.LAST = dur - 1                       # ent()/drawx()/backdrop() read the doc length from here
    return Doc(kind, name, folder, dur, build, poster, loop)


# ------------------------------------------------------------------ motion helpers
def en(x=0, y=0, dx=0, dy=0, delay=0, dur=QQ, scale=None, sx=1.0, sy=1.0, out=None, exit=True):
    """ent() with the exit decoupled from the entrance delay (staggered builds still leave inside the build-out)."""
    L = mc.LAST
    o = min(delay, 10) if out is None else out
    a = {}
    if dx:
        a['X'] = glide(delay, x + dx, delay + dur, x) + (ease_in(L - dur - o, x, L - o, x + dx) if exit else [])
    if dy:
        a['Y'] = glide(delay, y + dy, delay + dur, y) + (ease_in(L - dur - o, y, L - o, y + dy) if exit else [])
    f = min(dur, 5)
    a['Opacity'] = ease(delay, 0, delay + f, 1) + (ease(L - f - o, 1, L - o, 0) if exit else [])
    if scale is not None:
        for k, full in (('SX', sx), ('SY', sy)):
            a[k] = spring(delay, scale * full, delay + dur + 3, full) + (ease_in(L - dur - o, full, L - o, scale * full) if exit else [])
    return a


def drawx(x_left, w, delay=0, dur=QQ + 4, full=1.0, local_w=None, out=10):
    """draw_x() whose exit always sits in the build-out, however late the line is drawn."""
    L = mc.LAST
    return {'anchor': (-(local_w or w) / 2, 0), 'x': x_left,
            'anim': {'SX': glide(delay, 0.0, delay + dur, full) + ease_in(L - dur - out, full, L - out, 0.0)}}


def show(spans):
    """Hold-mode opacity: visible only inside the (start, end) frame spans."""
    keys = [(0, 0.0)]
    for s, e in spans:
        if s <= 0:
            keys[0] = (0, 1.0)
        else:
            keys.append((s, 1.0))
        keys.append((e, 0.0))
    return (keys, 'hold')


def tinted(d, name, children, color, label, **kw):
    """White layers grouped and colourised once, so one published colour drives all of them."""
    fid = d.nid()
    fx = colorize(color).xml(fid, d.timing)
    if label:
        d.pub(fid, './2', label)
    return d.group(name, children, filters=fx, **kw)


def bars(d, name, x_left, y, w, h, delay, exit=True, step=6):
    """Block reveal: a bar wipes on from the left, then off to the right (and back on exit)."""
    L = mc.LAST
    f0, f1, f2 = delay, delay + step, delay + 2 * step
    e0, e1, e2 = L - delay - 2 * step, L - delay - step, L - delay
    a = d.solid(f'{name} In', w, h, WHITE, None, anchor=(-w / 2, 0), x=x_left, y=y,
                anim={'SX': glide(f0, 0.0, f1, 1.0) + (ease_in(e1, 1.0, e2, 0.0) if exit else []),
                      'Opacity': show([(f0, f1)] + ([(e1, e2)] if exit else []))})
    b = d.solid(f'{name} Out', w, h, WHITE, None, anchor=(w / 2, 0), x=x_left + w, y=y,
                anim={'SX': glide(f1, 1.0, f2, 0.0) + (glide(e0, 0.0, e1, 1.0) if exit else []),
                      'Opacity': show([(f1, f2)] + ([(e0, e1)] if exit else []))})
    return [a, b]


def rtext(d, s, name, weight, size, color, x, y, delay=0, bar=SIGNAL, bar_label=None, mono=False, align='left', w=None, exit=True, label=None):
    """Text that appears behind a block-reveal bar (the site's 'drafting' reveal)."""
    L = mc.LAST
    w = w or len(s) * size * (0.6 if mono else 0.55) + 24
    xl = x - 12 if align == 'left' else (x - w / 2 if align == 'center' else x - w + 12)
    on = delay + 6
    txt = T(d, s, name, weight, size, color, align, label or name, mono, x=x, y=y,
            anim={'Opacity': show([(on, L - delay - 6 + 1 if exit else L + 1)]),
                  'X': glide(on, x - 16 if align != 'right' else x + 16, on + 12, x)})
    return [tinted(d, f'{name} Reveal', bars(d, name, xl, y + size * 0.32, w, size * 1.12, delay, exit), bar, bar_label), txt]


def typed(d, s, name, size, color, x, y, f0, cover=NAVY, caret=GLOW, label=None, blink=False, fpc=0.45):
    """Monospace line typed out left -> right: a cover the colour of the panel shrinks to the right, a caret leads."""
    L = mc.LAST
    w = max(1, len(s)) * size * 0.6 + 12
    f1 = f0 + max(4, round(len(s) * fpc))
    txt = T(d, s, name, None, size, color, 'left', label or name, True, x=x, y=y)
    cov = d.solid(f'{name} Cover', w + 12, size * 1.5, cover, None, anchor=((w + 12) / 2, 0), x=x - 6 + (w + 12), y=y + size * 0.3,
                  anim={'SX': ([key(f0, 1.0), key(f1, 0.0)], 'linear')})
    spans = [(f0, f1 + (8 if blink else 0))]
    if blink:
        spans += [(s_, s_ + 9) for s_ in range(f1 + 18, L - 30, 18)]
    car = d.solid(f'{name} Caret', 4, size * 1.15, caret, None, x=x, y=y + size * 0.32,
                  anim={'X': ([key(f0, x), key(f1, x + w - 8)], 'linear'), 'Opacity': show(spans)})
    return [car, cov, txt], f1


def float_keys(amp=8, period=72, start=0):
    """Gentle up/down loop (for a wrapper group's Y)."""
    keys, v, f = [], amp, start
    while f <= mc.LAST:
        keys.append(key(f, v))
        v, f = -v, f + period // 2
    return keys


def breathe(lo=1.0, hi=1.05, period=40, start=0):
    keys, f, up = [], start, True
    while f <= mc.LAST:
        keys.append(key(f, hi if up else lo))
        up, f = not up, f + period // 2
    return keys


def floating(d, name, layers, amp=8, period=72, start=0):
    return d.group(name, layers, anim={'Y': float_keys(amp, period, start)})


def icon(d, fn, name, x, y, size=72, color=WHITE, color_label=None, delay=0, well=True):
    """Icon (white PNG, colourised). As a well, so a different icon/image can be dropped on it in Final Cut Pro."""
    s = size / 512
    kw = dict(color=color, color_label=color_label, x=x, y=y, sx=s, sy=s, anim=en(x, y, delay=delay, scale=0.5, sx=s, sy=s))
    return d.well(f'icon_{fn}.png', name, name, **kw) if well else d.image(f'icon_{fn}.png', name, **kw)


def tile(d, fn, name, x, y, size=110, fill=SIGNAL, delay=0, label=None, shadow=6):
    """Signal square with an icon (ink border + hard shadow)."""
    sq = card(d, f'{name} Tile', size, size, fill=fill, shadow=shadow, label=label or f'{name} Tile', x=x, y=y, anim=en(x, y, delay=delay, scale=0.6))
    return [icon(d, ICONS.get(name, 'sparkle') if fn is None else fn, name, x, y, size * 0.56, delay=delay + 2), sq]


ICONS = {}


def footer(d, num='01'):
    return [T(d, 'CRM ANALYTICS ACADEMY', 'Footer', None, 18, INK2, label='Footer', mono=True, x=-840, y=-496, anim=en(-840, -496)),
            T(d, f'{num} —', 'Slide Number', None, 18, SIGNAL, 'right', 'Slide Number', mono=True, x=840, y=-496, anim=en(840, -496)),
            d.solid('Footer Rule', 1680, 2, LINE, 'Footer Rule Color', y=-462, **drawx(-840, 1680, 2))]


def header(d, eyebrow, title_s, delay=0, size=76):
    return ([T(d, eyebrow, 'Eyebrow', None, 26, SIGNAL, label='Eyebrow', mono=True, x=-840, y=396, anim=en(-840, 396, dx=-24, delay=delay))]
            + rtext(d, title_s, 'Title', 'black', size, INK, -844, 296, delay + 2, bar_label='Reveal Color')
            + [d.solid('Header Rule', 1680, BORDER, INK, 'Rule Color', y=256, **drawx(-840, 1680, delay + 6))])


def bullet(d, i, s, x, y, delay, size=40, color=INK, sq=SIGNAL, label=None):
    return [d.solid(f'Bullet {i}', size * 0.36, size * 0.36, sq, 'Bullet Color' if i == 1 else None, x=x, y=y + size * 0.34, anim=en(x, y + size * 0.34, delay=delay, scale=0.0)),
            T(d, s, label or f'Point {i}', 'semi', size, color, label=label or f'Point {i}', x=x + 36, y=y, anim=en(x + 36, y, dx=-24, delay=delay + 1))]


def panel(d, name, w, h, x=0, y=0, fill=NAVY, delay=0, bar_text='query.saql'):
    """Code-editor window: ink title bar with lights + file name, navy body, ink border, hard shadow (fill not published:
    the typing covers match it)."""
    top = y + h / 2 + 26
    body = d.solid(f'{name} Body', w, h, fill, None, x=x, y=y)
    bar = d.solid(f'{name} Bar', w, 52, INK, None, x=x, y=top)
    lights = [d.solid(f'{name} Light {i + 1}', 13, 13, c, None, x=x - w / 2 + 28 + i * 24, y=top) for i, c in enumerate((SIGNAL, TIDE, GLOW))]
    fname = T(d, bar_text, 'File Name', None, 20, FROST, 'center', 'File Name', mono=True, x=x, y=top - 7)
    border = d.solid(f'{name} Border', w + 2 * BORDER, h + 52 + 2 * BORDER, INK, None, x=x, y=y + 26)
    sh = d.solid(f'{name} Shadow', w + 2 * BORDER, h + 52 + 2 * BORDER, INK, None, x=x + SHADOW, y=y + 26 - SHADOW)
    return d.group(name, [fname] + lights + [bar, body, border, sh], anim=en(0, 0, dy=-30, delay=delay))


SAQL_COLORS = {'kw': GLOW, 'id': WHITE, 'cm': XGRAY}


def code_lines(d, lines, x, y, size, f0, gap=None, numbers=True, cover=NAVY):
    """Each line typed in turn; line numbers appear as the line starts. Returns (layers, end_frame)."""
    gap = gap or size * 1.75
    out, f = [], f0
    for i, (s, kind) in enumerate(lines):
        ly = y - i * gap
        if numbers:
            out.append(T(d, f'{i + 1:>2}', f'Line Number {i + 1}', None, size * 0.8, XGRAY, 'right', None, True, x=x - 28, y=ly, anim={'Opacity': show([(f, mc.LAST + 1)])}))
        layers, f_end = typed(d, s, f'Line {i + 1}', size, SAQL_COLORS[kind], x, ly, f, cover=cover, blink=(i == len(lines) - 1))
        out += layers
        f = f_end + 3
    return [d.group('Code', out, anim=en(0, 0, dy=-30))], f


# ================================================================== INTROS (full frame, timed to the music)
def intro(dark=False, short=False):
    def build(d):
        k = 0.5 if short else 1.0
        F = lambda f: round(f * k)
        hit, lock, L = F(30), F(150), mc.LAST
        ink, sub, gcol = (WHITE, FROST, FROST) if dark else (INK, INK2, SIGNAL)
        bg = d.solid('Paper', 1920, 1080, NIGHT if dark else PAPER, 'Paper Color')
        gr = d.image('bp_graph.png', 'Graph Paper', color=gcol, color_label='Graph Color',
                     anim={'Opacity': ease(0, 0, F(24), 0.22 if dark else 0.16), 'SX': glide(0, 1.12, F(40), 1.0), 'SY': glide(0, 1.12, F(40), 1.0)})
        mk = d.group('Marks', marks(d, 1500, 760, GLOW if dark else XGRAY, 'Crop Mark Color', 0.8),
                     anim={'SX': glide(0, 1.5, hit, 1.0), 'SY': glide(0, 1.5, hit, 1.0), 'Opacity': ease(0, 0, F(10), 1)})
        # beat words: one per beat (0.5 s = 15 frames) between the hit and the lockup
        words = ['DATASETS', 'RECIPES', 'SAQL', 'LENSES', 'DASHBOARDS', 'BINDINGS', 'SECURITY', 'INSIGHT']
        words = words[::2] if short else words
        step = (lock - hit) // len(words)
        wl = []
        for i, w_ in enumerate(words):
            f = hit + i * step
            wl.append(T(d, w_, f'Word {i + 1}', 'black', 140, SIGNAL if i % 2 == 0 else ink, 'center', f'Word {i + 1}', y=-250,
                        anim={'Opacity': show([(f, f + step)]), 'Y': glide(f, -226, f + step, -250), 'SX': glide(f, 1.08, f + step, 1.0), 'SY': glide(f, 1.08, f + step, 1.0)}))
        # logo: stamps in on the hit, then glides to the lockup position
        s0, s1 = 0.5, 0.36
        logo = d.image('bp_logo.png', 'Logo', x=0, y=40, sx=s0, sy=s0,
                       anim={'SX': spring(hit, 0.0, hit + 10, s0, 0.18) + glide(lock, s0, lock + 14, s1), 'SY': spring(hit, 0.0, hit + 10, s0, 0.18) + glide(lock, s0, lock + 14, s1),
                             'X': glide(lock, 0, lock + 14, -620), 'Y': glide(lock, 40, lock + 14, 20), 'Opacity': show([(hit, L + 1)])},
                       pub=[('./1/200/202', 'Logo Opacity')])
        ring = d.image('bp_ring.png', 'Ring', color=GLOW if dark else SIGNAL, color_label='Ring Color', y=40,
                       anim={'SX': glide(hit, 1.0, hit + 18, 6.0) + glide(lock, 1.0, lock + 18, 7.0), 'SY': glide(hit, 1.0, hit + 18, 6.0) + glide(lock, 1.0, lock + 18, 7.0),
                             'Opacity': [key(0, 0), key(hit - 1, 0), key(hit, 1), key(hit + 18, 0), key(lock - 1, 0), key(lock, 1), key(lock + 18, 0)], 'X': ([key(0, 0), key(lock - 1, 0), key(lock, -620)], 'hold')})
        # lockup
        out = [ring, logo]
        out += rtext(d, 'CRM Analytics', 'Title', 'black', 130, ink, -440, 40, lock + 4, bar=SIGNAL, bar_label='Reveal Color', exit=False)
        out += rtext(d, 'ACADEMY', 'Subtitle', None, 54, SIGNAL if not dark else GLOW, -436, -50, lock + 8, bar=ink, mono=True, exit=False, label='Subtitle')
        out.append(T(d, 'LEARN · BUILD · SHIP', 'Tagline', None, 30, sub, 'left', 'Tagline', True, x=-150, y=-50 + 0,
                     anim={'Opacity': ease(lock + 16, 0, lock + 22, 1), 'X': glide(lock + 16, -130, lock + 28, -150)}))
        out.append(d.image('bp_ruler.png', 'Ruler', color=ink, color_label='Ruler Color', y=-110, opacity=0.6,
                           anchor=(-960, 0), x=-440, anim={'SX': glide(lock + 10, 0.0, lock + 30, 0.55)}))
        out.append(T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 26, SIGNAL if not dark else GLOW, 'center', 'URL', True, y=-400,
                     anim={'Opacity': ease(lock + 20, 0, lock + 28, 1), 'Y': glide(lock + 20, -420, lock + 34, -400)}))
        out += wl
        top = d.group('Intro', out + [mk, gr, bg])        # no keyframed/published opacity on the top group: FCP renders such a title black
        return top
    return build


INTROS = {'Academy Intro': (intro(), 240, 'CRMA Academy Intro (8s)'), 'Academy Intro Navy': (intro(dark=True), 240, 'CRMA Academy Intro (8s)'),
          'Academy Intro Short': (intro(short=True), 120, 'CRMA Academy Intro Short (4s)')}


# ================================================================== SLIDES (full frame teaching slides)
def sl_title(d):
    mk = d.group('Marks', marks(d, 1600, 780), anim=en(0, 0, delay=2, scale=1.1))
    out = [T(d, 'COURSE 01 — CRM ANALYTICS', 'Eyebrow', None, 30, SIGNAL, label='Eyebrow', mono=True, x=-700, y=200, anim=en(-700, 200, dx=-24))]
    out += rtext(d, 'Dashboards that', 'Title', 'black', 110, INK, -704, 70, 3, bar_label='Reveal Color')
    out += rtext(d, 'answer questions', 'Title 2', 'black', 110, INK, -704, -50, 7)
    out.append(T(d, 'A hands-on course · 24 lessons', 'Subtitle', 'med', 38, INK2, label='Subtitle', x=-700, y=-150, anim=en(-700, -150, dy=-16, delay=12)))
    out += [T(d, 'WITH SWARNIL SINGHAI', 'Presenter', None, 24, INK, 'center', 'Presenter', True, x=-520, y=-272, anim=en(-520, -272, dy=-16, delay=15)),
            card(d, 'Presenter Chip', 360, 60, shadow=6, label='Chip', x=-520, y=-262, anim=en(-520, -262, dy=-16, delay=14))]
    logo = d.image('bp_logo.png', 'Logo', x=520, y=0, sx=0.62, sy=0.62, anim=en(520, 0, delay=6, scale=0.6, sx=0.62, sy=0.62), pub=[('./1/200/202', 'Logo Opacity')])
    return G(d, out + [floating(d, 'Logo Float', [logo], 10), mk] + footer(d) + backdrop(d))


def sl_intro(d):
    out = [T(d, '01', 'Number', 'black', 320, SIGNAL, label='Number', x=-856, y=60, anim=en(-856, 60, dy=-60, dur=QQ + 4))]
    out.append(T(d, 'SECTION —', 'Eyebrow', None, 30, INK2, label='Eyebrow', mono=True, x=-840, y=-40, anim=en(-840, -40, dx=-24, delay=4)))
    out += rtext(d, 'Getting data in', 'Title', 'black', 120, INK, -846, -170, 6, bar_label='Reveal Color')
    out.append(d.image('bp_ruler.png', 'Ruler', color=INK, color_label='Ruler Color', y=-230, opacity=0.6, **drawx(-840, 1680, 9, full=0.875, local_w=1920)))
    out.append(T(d, 'Connectors, sync and your first dataflow.', 'Description', 'med', 38, INK2, label='Description', x=-840, y=-310, anim=en(-840, -310, dy=-16, delay=12)))
    side = d.group('Side', [T(d, '§', 'Symbol', 'black', 360, ICE, 'right', None, x=860, y=120)], anim=en(0, 0, dx=40, delay=3))
    return G(d, out + [side] + footer(d) + backdrop(d))


def sl_agenda(d):
    out = header(d, 'AGENDA —', 'What we\'ll cover')
    items = [('Connect your org', '04 MIN'), ('Build a recipe', '08 MIN'), ('Write your first SAQL', '10 MIN'), ('Design the dashboard', '12 MIN'), ('Share & secure', '06 MIN')]
    for i, (s, m) in enumerate(items):
        y, dl = 170 - i * 116, 10 + 5 * i
        out += [T(d, f'{i + 1:02d}', f'Num {i + 1}', None, 28, WHITE, 'center', None, True, x=-806, y=y - 10, anim=en(-806, y - 10, delay=dl + 1, scale=0.6)),
                d.solid(f'Num Box {i + 1}', 72, 72, SIGNAL, 'Number Color' if i == 0 else None, x=-806, y=y, anim=en(-806, y, delay=dl, scale=0.0)),
                T(d, s, f'Item {i + 1}', 'semi', 44, INK, label=f'Item {i + 1}', x=-740, y=y - 16, anim=en(-740, y - 16, dx=-24, delay=dl + 1)),
                T(d, m, f'Time {i + 1}', None, 24, INK2, 'right', f'Time {i + 1}', True, x=840, y=y - 10, anim=en(840, y - 10, dx=24, delay=dl + 2)),
                d.solid(f'Row Rule {i + 1}', 1680, 2, LINE, 'Row Rule Color' if i == 0 else None, y=y - 52, **drawx(-840, 1680, dl + 2))]
    return G(d, out + footer(d, '02') + backdrop(d))


def sl_bullets(d):
    out = header(d, 'KEY IDEAS —', 'How a recipe thinks')
    pts = ['Every node is one transformation', 'Joins add columns, appends add rows', 'Filter early to keep it fast', 'Preview is a sample, not the dataset', 'Run, then schedule it']
    for i, s in enumerate(pts):
        out += bullet(d, i + 1, s, -820, 160 - i * 104, 10 + 5 * i, 44)
    return G(d, out + footer(d, '03') + backdrop(d))


def sl_two_col(d):
    out = header(d, 'COMPARE —', 'Lens vs. dashboard')
    for side, (cx, eb, col, ttl, pts) in enumerate(((-430, 'LENS —', XGRAY, 'Explore', ['One dataset', 'Ad-hoc questions', 'Saved as a step']),
                                                    (430, 'DASHBOARD —', SIGNAL, 'Explain', ['Many datasets', 'Designed story', 'Shared with users']))):
        n = 'Left' if side == 0 else 'Right'
        dl = 8 + 6 * side
        cy = -110
        out += [T(d, eb, f'{n} Eyebrow', None, 24, col, label=f'{n} Eyebrow', mono=True, x=cx - 360, y=cy + 200, anim=en(cx - 360, cy + 200, dy=-16, delay=dl + 2)),
                T(d, ttl, f'{n} Title', 'black', 64, INK, label=f'{n} Title', x=cx - 362, y=cy + 110, anim=en(cx - 362, cy + 110, dy=-16, delay=dl + 3))]
        for j, p in enumerate(pts):
            out += bullet(d, side * 3 + j + 1, p, cx - 356, cy + 10 - j * 80, dl + 5 + 3 * j, 34, label=f'{n} Point {j + 1}')
        out.append(card(d, f'{n} Card', 800, 520, border=INK if side == 0 else SIGNAL, label=f'{n} Card', x=cx, y=cy, anim=en(cx, cy, dy=-30, delay=dl)))
    return G(d, out + footer(d, '04') + backdrop(d))


def sl_icon_cards(d):
    out = header(d, 'BUILDING BLOCKS —', 'Three things to know')
    cards = [('database', 'Datasets', 'Fast, denormalised copies', 'of your Salesforce data.'),
             ('git-merge', 'Recipes', 'Join, clean and shape', 'data before you analyse it.'),
             ('chart-bar', 'Dashboards', 'Interactive views your', 'team actually uses.')]
    for i, (ic, ttl, l1, l2) in enumerate(cards):
        cx, cy, dl = -580 + i * 580, -120, 8 + 6 * i
        x0 = cx - 210
        out += tile(d, ic, f'Icon {i + 1}', x0 + 55, cy + 150, 110, delay=dl + 2, label='Icon Tile' if i == 0 else f'Icon Tile {i + 1}')
        out += [T(d, f'0{i + 1}', f'Index {i + 1}', None, 24, XGRAY, 'right', None, True, x=cx + 220, y=cy + 180, anim=en(cx + 220, cy + 180, delay=dl + 2)),
                T(d, ttl, f'Card Title {i + 1}', 'black', 52, INK, label=f'Card Title {i + 1}', x=x0, y=cy + 10, anim=en(x0, cy + 10, dy=-16, delay=dl + 3)),
                T(d, l1, f'Card Text {i + 1}', 'med', 30, INK2, label=f'Card Text {i + 1}', x=x0, y=cy - 60, anim=en(x0, cy - 60, dy=-16, delay=dl + 4)),
                T(d, l2, f'Card Text {i + 1}b', 'med', 30, INK2, label=f'Card Text {i + 1} Line 2', x=x0, y=cy - 104, anim=en(x0, cy - 104, dy=-16, delay=dl + 4)),
                card(d, f'Card {i + 1}', 500, 480, label='Card' if i == 0 else f'Card {i + 1}', x=cx, y=cy, anim=en(cx, cy, dy=-30, delay=dl))]
    return G(d, out + footer(d, '05') + backdrop(d))


def sl_icon_grid(d):
    out = header(d, 'TOOLKIT —', 'Everything in one place')
    items = [('database', 'Datasets', 'STORE'), ('git-merge', 'Recipes', 'PREPARE'), ('code', 'SAQL', 'QUERY'),
             ('chart-bar', 'Lenses', 'EXPLORE'), ('link', 'Bindings', 'CONNECT'), ('users', 'Security', 'SHARE')]
    for i, (ic, ttl, sub) in enumerate(items):
        r, c = divmod(i, 3)
        cx, cy, dl = -580 + c * 580, 70 - r * 260, 8 + 3 * i
        x0 = cx - 240
        out += tile(d, ic, f'Icon {i + 1}', x0 + 60, cy, 112, delay=dl + 2, label='Icon Tile' if i == 0 else f'Icon Tile {i + 1}')
        out += [T(d, ttl, f'Label {i + 1}', 'black', 48, INK, label=f'Label {i + 1}', x=x0 + 150, y=cy - 4, anim=en(x0 + 150, cy - 4, dx=-16, delay=dl + 3)),
                T(d, sub, f'Tag {i + 1}', None, 22, SIGNAL, label=f'Tag {i + 1}', mono=True, x=x0 + 152, y=cy - 52, anim=en(x0 + 152, cy - 52, dx=-16, delay=dl + 4)),
                card(d, f'Card {i + 1}', 520, 200, shadow=6, label='Card' if i == 0 else f'Card {i + 1}', x=cx, y=cy, anim=en(cx, cy, dy=-24, delay=dl))]
    return G(d, out + footer(d, '06') + backdrop(d))


QUERY = [("q = load \"opportunities\";", 'id'), ("q = filter q by 'StageName' == \"Closed Won\";", 'id'), ("q = group q by 'Region';", 'id'),
         ("q = foreach q generate 'Region',", 'id'), ("    sum('Amount') as 'Total';", 'id'), ("q = order q by 'Total' desc;", 'id'), ("q = limit q 5;", 'id')]


def sl_query(d):
    out = header(d, 'SAQL —', 'Top regions by revenue')
    w, h, cy = 1600, 600, -120
    lines, f_end = code_lines(d, QUERY, -700, cy + 200, 34, 14)
    run = [T(d, 'RUN ▶', 'Run Label', None, 24, WHITE, 'center', 'Run Label', True, x=680, y=cy - h / 2 + 36, anim=en(680, cy - h / 2 + 36, delay=f_end + 2, scale=0.6)),
           d.solid('Run Button', 150, 54, SIGNAL, 'Run Color', x=680, y=cy - h / 2 + 46, anim=en(680, cy - h / 2 + 46, delay=f_end, scale=0.0))]
    return G(d, out + run + lines + [panel(d, 'Editor', w, h, 0, cy, delay=8, bar_text='top_regions.saql')] + footer(d, '07') + backdrop(d))


def sl_query_result(d):
    out = header(d, 'SAQL —', 'Query and result')
    lines = [("q = load \"opportunities\";", 'id'), ("q = group q by 'Region';", 'id'), ("q = foreach q generate 'Region',", 'id'),
             ("    sum('Amount') as 'Total';", 'id'), ("q = order q by 'Total' desc;", 'id')]
    code, f_end = code_lines(d, lines, -780, 80, 28, 16, gap=58)
    cx, cy = 560, -120
    res = [T(d, 'RESULT — 4 ROWS', 'Result Eyebrow', None, 22, SIGNAL, label='Result Eyebrow', mono=True, x=cx - 250, y=cy + 220, anim=en(cx - 250, cy + 220, delay=f_end, dy=-12))]
    for i, (rg, val, frac) in enumerate((('AMER', '4.2M', 1.0), ('EMEA', '3.1M', 0.74), ('APAC', '2.4M', 0.57), ('LATAM', '1.1M', 0.26))):
        y, dl = cy + 120 - i * 100, f_end + 4 + 4 * i
        res += [T(d, rg, f'Region {i + 1}', None, 24, INK, label=f'Region {i + 1}', mono=True, x=cx - 250, y=y, anim=en(cx - 250, y, delay=dl, dx=-12)),
                T(d, val, f'Value {i + 1}', 'xbold', 32, INK, 'right', f'Value {i + 1}', x=cx + 250, y=y - 2, anim=en(cx + 250, y - 2, delay=dl, dx=12)),
                d.image('bp_hatch.png', f'Bar {i + 1}', y=y - 30, **drawx(cx - 250, 500 * frac, dl + 1, full=500 * frac / 1920, local_w=1920))]
    res.append(card(d, 'Result Card', 580, 560, label='Result Card', x=cx, y=cy, anim=en(cx, cy, dx=30, delay=f_end - 2)))
    return G(d, out + res + code + [panel(d, 'Editor', 1040, 560, -340, cy, delay=8, bar_text='by_region.saql')] + footer(d, '08') + backdrop(d))


def sl_image_text(d):
    s = 0.5
    wx, wy = -400, -40
    img = d.well('well_16x9.png', 'Image', 'Image', x=wx, y=wy, sx=s, sy=s, anim=en(wx, wy, dy=-30, delay=2))
    bw, bh = 960 + 2 * BORDER, 540 + 2 * BORDER
    frame = [d.solid('Image Border', bw, bh, INK, 'Image Border Color', x=wx, y=wy, anim=en(wx, wy, dy=-30, delay=2)),
             d.solid('Image Shadow', bw, bh, INK, None, x=wx + SHADOW, y=wy - SHADOW, anim=en(wx + SHADOW, wy - SHADOW, dy=-30, delay=2))]
    mk = d.group('Marks', marks(d, bw + 30, bh + 30), x=wx, y=wy, anim=en(wx, wy, delay=6, scale=1.1))
    cap = T(d, 'FIG. 01 — DATASET BUILDER', 'Caption', None, 22, SIGNAL, label='Caption', mono=True, x=wx - 480, y=wy - 310, anim=en(wx - 480, wy - 310, dy=-12, delay=8))
    x0 = 200
    out = [T(d, 'STEP 02 —', 'Eyebrow', None, 26, SIGNAL, label='Eyebrow', mono=True, x=x0, y=250, anim=en(x0, 250, dx=24, delay=4))]
    out += rtext(d, 'Pick your', 'Title', 'black', 80, INK, x0 - 4, 150, 6, bar_label='Reveal Color')
    out += rtext(d, 'fields', 'Title 2', 'black', 80, INK, x0 - 4, 60, 9)
    for i, p in enumerate(('Start from the object', 'Add related objects', 'Keep only what you chart')):
        out += bullet(d, i + 1, p, x0 + 6, -40 - i * 80, 12 + 4 * i, 34)
    return G(d, out + [cap, img, mk] + frame + footer(d, '09') + backdrop(d))


def sl_stats(d):
    out = header(d, 'BY THE NUMBERS —', 'Why it matters')
    for i, (num, lab, frac) in enumerate((('38%', 'faster reporting', 0.38), ('2.4M', 'rows analysed', 0.7), ('12×', 'fewer spreadsheets', 0.92))):
        cx, cy, dl = -580 + i * 580, -110, 8 + 6 * i
        x0 = cx - 210
        out += rtext(d, num, f'Stat {i + 1}', 'black', 150, INK, x0, cy + 20, dl + 2, bar=SIGNAL if i != 1 else TIDE, label=f'Stat {i + 1}', w=len(num) * 150 * 0.62 + 30)
        out += [T(d, lab, f'Stat Label {i + 1}', 'semi', 36, INK2, label=f'Stat Label {i + 1}', x=x0, y=cy - 60, anim=en(x0, cy - 60, dy=-12, delay=dl + 5)),
                d.image('bp_hatch.png', f'Stat Bar {i + 1}', y=cy - 130, **drawx(x0, 420 * frac, dl + 6, dur=20, full=420 * frac / 1920, local_w=1920)),
                d.solid(f'Stat Track {i + 1}', 420, 24, ICE, 'Track Color' if i == 0 else None, x=cx, y=cy - 130, anim=en(cx, cy - 130, delay=dl + 4)),
                card(d, f'Card {i + 1}', 500, 440, label='Card' if i == 0 else f'Card {i + 1}', x=cx, y=cy, anim=en(cx, cy, dy=-30, delay=dl))]
    return G(d, out + footer(d, '10') + backdrop(d))


def sl_flow(d):
    out = header(d, 'HOW IT FLOWS —', 'From org to insight')
    steps = [('01', 'Connect', 'Sync objects'), ('02', 'Prepare', 'Recipes & joins'), ('03', 'Query', 'Lenses & SAQL'), ('04', 'Share', 'Dashboards & apps')]
    for i, (n, ttl, sub) in enumerate(steps):
        cx, cy, dl = -660 + i * 440, -40, 8 + 8 * i
        last = i == len(steps) - 1
        out += [T(d, n, f'Step Number {i + 1}', None, 22, GLOW if last else SIGNAL, label=None, mono=True, x=cx - 140, y=cy + 34, anim=en(cx - 140, cy + 34, delay=dl + 2, dy=-12)),
                T(d, ttl, f'Step {i + 1}', 'black', 46, WHITE if last else INK, label=f'Step {i + 1}', x=cx - 142, y=cy - 34, anim=en(cx - 142, cy - 34, delay=dl + 3, dy=-12)),
                T(d, sub, f'Step Text {i + 1}', 'med', 28, INK2, 'center', f'Step Text {i + 1}', x=cx, y=cy - 170, anim=en(cx, cy - 170, delay=dl + 4, dy=-12)),
                card(d, f'Step Card {i + 1}', 340, 170, fill=SIGNAL if last else CARD, label='Final Step' if last else ('Step Card' if i == 0 else f'Step Card {i + 1}'),
                     x=cx, y=cy, anim=en(cx, cy, delay=dl, scale=0.85))]
        if not last:
            ax = cx + 220
            out.append(d.image('arrow.png', f'Arrow {i + 1}', color=INK, color_label='Arrow Color' if i == 0 else None, x=ax, y=cy, sx=0.13, sy=0.5,
                               anim={**en(ax, cy, dx=-20, delay=dl + 5), 'SX': glide(dl + 5, 0.0, dl + 12, 0.13) + ease_in(mc.LAST - 18, 0.13, mc.LAST - 10, 0.0)}))
    return G(d, out + footer(d, '11') + backdrop(d))


def sl_quiz(d):
    out = header(d, 'QUICK CHECK —', 'Which step runs first?')
    wid = d.popup('Show Answer', ['Hidden', 'A', 'B', 'C'], 0)
    for i, (L_, s) in enumerate((('A', 'foreach … generate'), ('B', 'group … by'), ('C', 'load "dataset"'))):
        cx, cy, dl = -170, 130 - i * 150, 10 + 6 * i
        x0 = cx - 650
        hl = d.group(f'Answer {L_}', [icon(d, 'circle-check', f'Check {L_}', cx + 580, cy, 64, SIGNAL, 'Correct Color' if i == 0 else None, delay=0, well=False),
                                      T(d, 'CORRECT', f'Correct {L_}', None, 22, SIGNAL, 'right', 'Correct Label' if i == 0 else None, True, x=cx + 530, y=cy - 8),
                                      d.solid(f'Highlight {L_}', 1300, 110, SIGNAL, 'Highlight Color' if i == 0 else None, x=cx, y=cy, opacity=0.12)])
        hl = d.rig_wrap(f'Answer {L_} Rig', hl, wid, {'Opacity': [0.0] + [1.0 if j == i else 0.0 for j in range(3)]})
        out += [T(d, L_, f'Letter {L_}', 'black', 44, WHITE, 'center', None, x=x0 + 55, y=cy - 16, anim=en(x0 + 55, cy - 16, delay=dl + 1, scale=0.6)),
                d.solid(f'Letter Box {L_}', 110, 110, INK, 'Letter Color' if i == 0 else None, x=x0 + 55, y=cy, anim=en(x0 + 55, cy, delay=dl, scale=0.6)),
                T(d, s, f'Option {L_}', None, 40, INK, label=f'Option {L_}', mono=True, x=x0 + 150, y=cy - 14, anim=en(x0 + 150, cy - 14, dx=-24, delay=dl + 2)),
                hl,
                card(d, f'Option Card {L_}', 1300, 110, shadow=6, label='Option Card' if i == 0 else f'Option Card {L_}', x=cx, y=cy, anim=en(cx, cy, dx=-30, delay=dl))]
    out.append(T(d, 'PAUSE THE VIDEO AND PICK ONE', 'Hint', None, 24, INK2, label='Hint', mono=True, x=-820, y=-330, anim=en(-820, -330, dy=-12, delay=28)))
    return G(d, out + footer(d, '12') + backdrop(d))


def sl_summary(d):
    out = header(d, 'SUMMARY —', 'What you learned')
    pts = [('Datasets are fast', 'copies built for analysis'), ('Recipes shape data', 'before it reaches a lens'), ('SAQL answers', 'what clicks can\'t')]
    for i, (a, b) in enumerate(pts):
        cx, cy, dl = -580 + i * 580, -110, 8 + 6 * i
        x0 = cx - 210
        out += rtext(d, f'0{i + 1}', f'Index {i + 1}', 'black', 110, SIGNAL, x0, cy + 70, dl + 2, bar=INK, label=None, w=150)
        out += [T(d, a, f'Summary {i + 1}', 'black', 42, INK, label=f'Summary {i + 1}', x=x0, y=cy - 30, anim=en(x0, cy - 30, dy=-12, delay=dl + 5)),
                T(d, b, f'Summary {i + 1}b', 'med', 30, INK2, label=f'Summary {i + 1} Line 2', x=x0, y=cy - 84, anim=en(x0, cy - 84, dy=-12, delay=dl + 6)),
                card(d, f'Card {i + 1}', 500, 420, label='Card' if i == 0 else f'Card {i + 1}', x=cx, y=cy, anim=en(cx, cy, dy=-30, delay=dl))]
    return G(d, out + footer(d, '13') + backdrop(d))


SLIDES = {'Title Slide': sl_title, 'Slide Intro': sl_intro, 'Agenda': sl_agenda, 'Bullet Points': sl_bullets, 'Two Column': sl_two_col,
          'Icon Cards': sl_icon_cards, 'Icon Grid': sl_icon_grid, 'Query Block': sl_query, 'Query and Result': sl_query_result,
          'Image and Text': sl_image_text, 'Big Numbers': sl_stats, 'Process Flow': sl_flow, 'Quiz': sl_quiz, 'Summary': sl_summary}
SLIDE_BUILD = {'Query Block': 130, 'Query and Result': 120}


# ================================================================== LOWER THIRDS (new)
def lt_reveal(d):
    plate = d.solid('Plate', 720, 170, PAPER, 'Plate Color', opacity=0.94, y=LY + 34, pub=[('./1/200/202', 'Plate Opacity')], **drawx(LX - 30, 720, 0, dur=QQ + 2))
    out = rtext(d, 'Swarnil Singhai', 'Name', 'black', 64, INK, LX, LY + 40, 3, bar_label='Reveal Color')
    out += rtext(d, 'CRM ANALYTICS ARCHITECT', 'Role', None, 26, SIGNAL, LX, LY - 20, 7, bar=INK, mono=True, label='Role')
    return G(d, out + [d.solid('Rule', 4, 150, SIGNAL, 'Rule Color', x=LX - 30, y=LY + 34, anim=en(LX - 30, LY + 34, delay=1, scale=0.0, sx=1.0)), plate])


def lt_icon(d):
    w, h = 820, 140
    cx, cy = LX + w / 2, LY + 40
    out = tile(d, 'book', 'Icon', LX + 70, cy, 140, delay=0, label='Icon Tile', shadow=0)
    out += rtext(d, 'Data Prep Basics', 'Title', 'xbold', 48, INK, LX + 172, cy - 4, 4, bar_label='Reveal Color')
    out.append(T(d, 'MODULE 02 · 6 LESSONS', 'Subtitle', None, 22, SIGNAL, label='Subtitle', mono=True, x=LX + 174, y=cy - 46, anim=en(LX + 174, cy - 46, dx=-20, delay=8)))
    return G(d, out + [card(d, 'Card', w, h, x=cx, y=cy, anim=en(cx, cy, dx=-40))])


def lt_lesson_bar(d):
    cy = LY + 40
    blk = [T(d, '04', 'Lesson Number', 'black', 72, WHITE, 'center', 'Lesson Number', x=LX + 90, y=cy - 18, anim=en(LX + 90, cy - 18, delay=2, dy=-20)),
           T(d, 'LESSON', 'Lesson Label', None, 18, FROST, 'center', 'Lesson Label', True, x=LX + 90, y=cy - 50, anim=en(LX + 90, cy - 50, delay=3)),
           card(d, 'Number Block', 180, 140, fill=SIGNAL, label='Number Block', x=LX + 90, y=cy, anim=en(LX + 90, cy, scale=0.7))]
    out = rtext(d, 'Window functions', 'Title', 'xbold', 48, INK, LX + 220, cy + 6, 4, bar_label='Reveal Color')
    out.append(T(d, '12 MIN · SAQL · INTERMEDIATE', 'Meta', None, 22, INK2, label='Meta', mono=True, x=LX + 222, y=cy - 44, anim=en(LX + 222, cy - 44, dx=-20, delay=8)))
    return G(d, blk + out + [card(d, 'Card', 640, 140, x=LX + 180 + 320, y=cy, anim=en(LX + 500, cy, dx=-40, delay=1))])


def lt_member(d):
    w, h = 980, 140
    cx, cy = LX + w / 2, LY + 40
    out = [T(d, 'MEMBERS —', 'Eyebrow', None, 22, GLOW, label='Eyebrow', mono=True, x=LX + 32, y=cy + 26, anim=en(LX + 32, cy + 26, dx=-24, delay=3)),
           T(d, 'Get every course, lab and project', 'Text', 'xbold', 40, WHITE, label='Text', x=LX + 32, y=cy - 34, anim=en(LX + 32, cy - 34, dx=-24, delay=4))]
    bx = LX + w - 130
    btn = d.group('Button', [T(d, 'JOIN →', 'Button Text', None, 26, WHITE, 'center', 'Button', True, y=-10),
                             card(d, 'Button Box', 190, 70, fill=SIGNAL, shadow=5, label='Button')], x=bx, y=cy,
                  anim={**en(bx, cy, delay=6, scale=0.6), 'SX': breathe(1.0, 1.06, 40, 20), 'SY': breathe(1.0, 1.06, 40, 20)})
    return G(d, out + [btn, card(d, 'Card', w, h, fill=NAVY, x=cx, y=cy, anim=en(cx, cy, dx=-40))])


def lt_live(d):
    w, h = 640, 72
    cx, cy = LX + w / 2, LY + 30
    blink = [(f, f + 15) for f in range(0, mc.LAST - 30, 30)]
    out = [d.solid('Live Dot', 16, 16, RED, 'Dot Color', x=LX + 32, y=cy, anim={'Opacity': show(blink)}),
           T(d, 'NOW —', 'Label', None, 22, SIGNAL, label='Label', mono=True, x=LX + 56, y=cy - 8, anim=en(LX + 56, cy - 8, dx=-20, delay=3)),
           T(d, 'Building the sales dashboard', 'Topic', 'bold', 30, INK, label='Topic', x=LX + 170, y=cy - 10, anim=en(LX + 170, cy - 10, dx=-20, delay=5))]
    return G(d, out + [card(d, 'Card', w, h, shadow=6, x=cx, y=cy, anim=en(cx, cy, dx=-40))])


LOWER_THIRDS2 = {'Reveal Name': lt_reveal, 'Icon Lower Third': lt_icon, 'Lesson Number Bar': lt_lesson_bar, 'Member Promo Bar': lt_member, 'Now Topic (Loop)': lt_live}


# ================================================================== LESSONS (new)
def le_intro(d):
    w, h = 1200, 640
    out = [T(d, 'MODULE 03 · LESSON 04', 'Eyebrow', None, 26, SIGNAL, label='Eyebrow', mono=True, x=-550, y=250, anim=en(-550, 250, dy=-16, delay=3))]
    out += rtext(d, 'Window functions', 'Title', 'black', 88, INK, -554, 140, 4, bar_label='Reveal Color')
    out.append(d.solid('Rule', 1100, BORDER, INK, 'Rule Color', y=100, **drawx(-550, 1100, 7)))
    out.append(T(d, 'YOU WILL LEARN —', 'Objectives Label', None, 22, INK2, label='Objectives Label', mono=True, x=-550, y=40, anim=en(-550, 40, dx=-16, delay=8)))
    for i, s in enumerate(('Rank rows inside a group', 'Build running totals', 'Compare to the previous period')):
        y, dl = -30 - i * 72, 10 + 4 * i
        out += [icon(d, 'circle-check', f'Check {i + 1}', -530, y + 14, 44, SIGNAL, 'Check Color' if i == 0 else None, delay=dl, well=False),
                T(d, s, f'Objective {i + 1}', 'semi', 38, INK, label=f'Objective {i + 1}', x=-490, y=y, anim=en(-490, y, dx=-20, delay=dl + 1))]
    for i, (s, wdt) in enumerate((('12 MIN', 150), ('INTERMEDIATE', 250), ('SAQL', 120))):
        x = -550 + sum(v + 24 for _, v in [('', 150), ('', 250), ('', 120)][:i]) + wdt / 2
        out += [T(d, s, f'Chip {i + 1}', None, 22, INK, 'center', f'Chip {i + 1}', True, x=x, y=-274, anim=en(x, -274, delay=20 + 2 * i, scale=0.7)),
                card(d, f'Chip Box {i + 1}', wdt, 50, fill=ICE, shadow=4, label='Chip' if i == 0 else f'Chip {i + 1}', x=x, y=-266, anim=en(x, -266, delay=20 + 2 * i, scale=0.7))]
    mk = d.group('Marks', marks(d, w + 2 * BORDER, h + 2 * BORDER), anim=en(0, 0, delay=4, scale=1.1))
    return G(d, out + [mk, card(d, 'Card', w, h, anim=en(0, 0, dy=-40))])


def le_icon_card(d):
    w, h = 880, 200
    cx, cy = 860 - w / 2, 340
    x0 = cx - w / 2
    out = tile(d, 'sparkle', 'Icon', x0 + 100, cy, 140, delay=2, label='Icon Tile', shadow=0)
    out += [T(d, 'DID YOU KNOW —', 'Eyebrow', None, 22, SIGNAL, label='Eyebrow', mono=True, x=x0 + 200, y=cy + 40, anim=en(x0 + 200, cy + 40, dx=24, delay=3)),
            T(d, 'Lenses can be saved', 'Text', 'xbold', 40, INK, label='Text', x=x0 + 200, y=cy - 14, anim=en(x0 + 200, cy - 14, dx=24, delay=4)),
            T(d, 'straight into a dashboard.', 'Text 2', 'med', 32, INK2, label='Text Line 2', x=x0 + 200, y=cy - 64, anim=en(x0 + 200, cy - 64, dx=24, delay=5))]
    return G(d, out + [card(d, 'Card', w, h, x=cx, y=cy, anim=en(cx, cy, dx=40))])


def le_bullet_card(d):
    w, h = 760, 560
    cx, cy = 860 - w / 2, 0
    x0 = cx - w / 2 + 44
    out = [T(d, 'IN THIS LESSON —', 'Eyebrow', None, 22, SIGNAL, label='Eyebrow', mono=True, x=x0, y=cy + 210, anim=en(x0, cy + 210, dx=24, delay=3))]
    out += rtext(d, 'Bindings', 'Title', 'black', 72, INK, x0 - 4, cy + 110, 4, bar_label='Reveal Color')
    for i, s in enumerate(('Selection bindings', 'Results bindings', 'Filter with a toggle', 'Debug with the inspector')):
        out += bullet(d, i + 1, s, x0 + 6, cy + 10 - i * 84, 8 + 4 * i, 36)
    return G(d, out + [card(d, 'Card', w, h, x=cx, y=cy, anim=en(cx, cy, dx=40))])


def le_query_card(d):
    w, h = 980, 250
    cx, cy = 860 - w / 2, -300
    lines = [("q = load \"opportunities\";", 'id'), ("q = group q by 'Owner';", 'id'), ("q = foreach q generate count() as 'Deals';", 'id')]
    code, _ = code_lines(d, lines, cx - w / 2 + 80, cy + 60, 28, 10, gap=56)
    return G(d, code + [panel(d, 'Editor', w, h, cx, cy, delay=0, bar_text='deals_by_owner.saql')])


LESSONS2 = {'Lesson Introduction': le_intro, 'Icon Card': le_icon_card, 'Bullet Card': le_bullet_card, 'Query Card': le_query_card}
LESSON_BUILD = {'Query Card': 60, 'Lesson Introduction': 30}


# ================================================================== TITLES (new)
def ti_reveal(d):
    out = [T(d, 'CHAPTER 02 —', 'Eyebrow', None, 28, SIGNAL, label='Eyebrow', mono=True, x=-840, y=170, anim=en(-840, 170, dx=-24))]
    out += rtext(d, 'Clean data first', 'Title', 'black', 130, INK, -846, 30, 2, bar_label='Reveal Color')
    out += rtext(d, 'Everything downstream depends on it.', 'Subtitle', 'med', 42, INK2, -840, -70, 8, bar=INK, label='Subtitle')
    out.append(d.image('bp_ruler.png', 'Ruler', color=INK, color_label='Ruler Color', y=-130, opacity=0.6, **drawx(-840, 1100, 10, full=0.57, local_w=1920)))
    return G(d, out)


def ti_stacked(d):
    out = []
    for i, (w_, col) in enumerate((('Clean.', SIGNAL), ('Model.', TIDE), ('Ship.', INK))):
        out += rtext(d, w_, f'Line {i + 1}', 'black', 150, INK, -846, 150 - i * 160, 2 + 5 * i, bar=col, bar_label=f'Bar {i + 1} Color', label=f'Line {i + 1}')
    return G(d, out)


def ti_icon_title(d):
    out = tile(d, 'chart-bar', 'Icon', -620, 0, 220, delay=0, label='Icon Tile')
    out += [T(d, 'MODULE 04 —', 'Eyebrow', None, 28, SIGNAL, label='Eyebrow', mono=True, x=-460, y=60, anim=en(-460, 60, dx=-20, delay=4))]
    out += rtext(d, 'Dashboards', 'Title', 'black', 120, INK, -464, -70, 5, bar_label='Reveal Color')
    return G(d, out)


def ti_loop_badge(d):
    """A badge that keeps gently floating while on screen (for 'NEW', 'PRO', 'FREE' …)."""
    b = d.group('Badge', [T(d, 'NEW LESSON', 'Badge Text', None, 30, WHITE, 'center', 'Badge', True, y=-10),
                          card(d, 'Badge Box', 300, 76, fill=SIGNAL, shadow=6, label='Badge')],
                anim={**en(0, 0, scale=0.5), 'SX': breathe(1.0, 1.05, 48, 12), 'SY': breathe(1.0, 1.05, 48, 12)})
    return G(d, [floating(d, 'Float', [b], 10, 72, 10)])


TITLES2 = {'Reveal Title': ti_reveal, 'Stacked Reveal': ti_stacked, 'Icon Title': ti_icon_title, 'Floating Badge (Loop)': ti_loop_badge}


# ================================================================== END SCREENS (membership & next videos)
def cta_button(d, text, x, y, w=560, h=100, delay=10, name='Button', pulse=True):
    an = en(x, y, delay=delay, scale=0.6)
    if pulse:
        an['SX'] = an['SX'][:-2] + breathe(1.0, 1.05, 40, delay + 14)
        an['SY'] = an['SY'][:-2] + breathe(1.0, 1.05, 40, delay + 14)
    return d.group(name, [T(d, text, f'{name} Text', None, 32, WHITE, 'center', name, True, y=-12),
                          card(d, f'{name} Box', w, h, fill=SIGNAL, label=name)], x=x, y=y, anim=an)


def end_member(d):
    x0 = -840
    out = [T(d, 'MEMBERSHIP —', 'Eyebrow', None, 28, SIGNAL, label='Eyebrow', mono=True, x=x0, y=330, anim=en(x0, 330, dx=-24))]
    out += rtext(d, 'Join the', 'Title', 'black', 120, INK, x0 - 4, 200, 2, bar_label='Reveal Color')
    out += rtext(d, 'Academy', 'Title 2', 'black', 120, SIGNAL, x0 - 4, 70, 6, bar=INK)
    out.append(T(d, 'Full courses, SAQL labs and real dashboard projects.', 'Subtitle', 'med', 34, INK2, label='Subtitle', x=x0, y=-10, anim=en(x0, -10, dy=-12, delay=10)))
    for i, s in enumerate(('Every lesson, ad-free', 'Downloadable datasets & recipes', 'Members-only Q&A')):
        y, dl = -100 - i * 64, 12 + 3 * i
        out += [icon(d, 'circle-check', f'Check {i + 1}', x0 + 18, y + 12, 40, SIGNAL, 'Check Color' if i == 0 else None, delay=dl, well=False),
                T(d, s, f'Perk {i + 1}', 'semi', 34, INK, label=f'Perk {i + 1}', x=x0 + 56, y=y, anim=en(x0 + 56, y, dx=-16, delay=dl + 1))]
    out.append(cta_button(d, 'BECOME A MEMBER →', x0 + 290, -340, delay=18))
    out.append(T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 24, INK2, label='URL', mono=True, x=x0 + 620, y=-352, anim=en(x0 + 620, -352, dx=-16, delay=22)))
    # member pass
    pw, ph = 600, 360
    pas = [d.image('bp_logo.png', 'Pass Logo', x=-200, y=90, sx=0.18, sy=0.18),
           T(d, 'MEMBER PASS', 'Pass Label', None, 22, GLOW, 'right', 'Pass Label', True, x=260, y=110),
           T(d, 'CRM Analytics', 'Pass Title', 'black', 50, WHITE, label='Pass Title', x=-260, y=-30),
           T(d, 'ACADEMY · PRO', 'Pass Tier', None, 26, FROST, label='Pass Tier', mono=True, x=-260, y=-80),
           d.image('bp_hatch.png', 'Pass Hatch', y=-140, sx=0.27, opacity=0.8),
           card(d, 'Pass', pw, ph, fill=NAVY, label='Pass')]
    p = d.group('Member Pass', pas, x=480, y=40, rot=-4, anim=en(480, 40, dx=60, delay=6))
    return G(d, out + [floating(d, 'Pass Float', [p], 12, 90, 20)] + backdrop(d))


def end_two_videos(d):
    out = rtext(d, 'Keep learning', 'Title', 'black', 96, INK, -844, 360, 0, bar_label='Reveal Color')
    s = 0.38
    for i, (lab, x) in enumerate((('NEXT LESSON →', -430), ('RECOMMENDED →', 430))):
        dl = 6 + 5 * i
        y = 40
        out += [T(d, lab, f'Video Label {i + 1}', None, 24, SIGNAL, label=f'Video Label {i + 1}', mono=True, x=x - 365, y=y + 232, anim=en(x - 365, y + 232, dy=-12, delay=dl + 2)),
                d.well('well_16x9.png', f'Video {i + 1}', f'Video {i + 1}', x=x, y=y, sx=s, sy=s, anim=en(x, y, dy=-24, delay=dl)),
                d.solid(f'Video Border {i + 1}', 1920 * s + 2 * BORDER, 1080 * s + 2 * BORDER, INK, 'Video Border Color' if i == 0 else None, x=x, y=y, anim=en(x, y, dy=-24, delay=dl)),
                d.solid(f'Video Shadow {i + 1}', 1920 * s + 2 * BORDER, 1080 * s + 2 * BORDER, INK, None, x=x + SHADOW, y=y - SHADOW, anim=en(x + SHADOW, y - SHADOW, dy=-24, delay=dl))]
    sw, sh_ = 1600, 150
    strip = [T(d, 'BECOME A MEMBER —', 'Strip Eyebrow', None, 22, GLOW, label='Strip Eyebrow', mono=True, x=-760, y=-300, anim=en(-760, -300, dx=-20, delay=16)),
             T(d, 'Unlock every course & lab', 'Strip Text', 'xbold', 44, WHITE, label='Strip Text', x=-760, y=-358, anim=en(-760, -358, dx=-20, delay=17)),
             cta_button(d, 'JOIN →', 600, -330, 260, 84, delay=18),
             card(d, 'Strip', sw, sh_, fill=NAVY, label='Strip', y=-330, anim=en(0, -330, dy=-40, delay=14))]
    return G(d, out + strip + backdrop(d))


def end_subscribe(d):
    s = 0.46
    x, y = -400, 40
    out = [T(d, 'WATCH NEXT →', 'Video Label', None, 26, SIGNAL, label='Video Label', mono=True, x=x - 442, y=y + 280, anim=en(x - 442, y + 280, dy=-12, delay=4)),
           d.well('well_16x9.png', 'Video', 'Video', x=x, y=y, sx=s, sy=s, anim=en(x, y, dy=-24, delay=2)),
           d.solid('Video Border', 1920 * s + 2 * BORDER, 1080 * s + 2 * BORDER, INK, 'Video Border Color', x=x, y=y, anim=en(x, y, dy=-24, delay=2)),
           d.solid('Video Shadow', 1920 * s + 2 * BORDER, 1080 * s + 2 * BORDER, INK, None, x=x + SHADOW, y=y - SHADOW, anim=en(x + SHADOW, y - SHADOW, dy=-24, delay=2))]
    x0 = 200
    out += [d.image('bp_logo.png', 'Logo', x=x0 + 70, y=230, sx=0.27, sy=0.27, anim=en(x0 + 70, 230, delay=4, scale=0.5, sx=0.27, sy=0.27))]
    out += rtext(d, 'New lessons', 'Title', 'black', 72, INK, x0 - 4, 70, 6, bar_label='Reveal Color')
    out += rtext(d, 'every week', 'Title 2', 'black', 72, INK, x0 - 4, -10, 9)
    out += [cta_button(d, 'SUBSCRIBE', x0 + 220, -140, 440, 90, delay=12, name='Subscribe'),
            T(d, 'or become a member at', 'Member Text', 'med', 30, INK2, label='Member Text', x=x0, y=-260, anim=en(x0, -260, dy=-12, delay=16)),
            T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 26, SIGNAL, label='URL', mono=True, x=x0, y=-310, anim=en(x0, -310, dy=-12, delay=17))]
    return G(d, out + backdrop(d))


def end_perks(d):
    out = header(d, 'MEMBERSHIP —', 'What members get')
    for i, (ic, ttl, l1) in enumerate((('book', 'Full courses', 'Beginner to architect'), ('code', 'SAQL labs', 'Hands-on, with datasets'), ('users', 'Community', 'Q&A and code reviews'))):
        cx, cy, dl = -580 + i * 580, 0, 8 + 6 * i
        x0 = cx - 210
        out += tile(d, ic, f'Icon {i + 1}', x0 + 55, cy + 110, 110, delay=dl + 2, label='Icon Tile' if i == 0 else f'Icon Tile {i + 1}')
        out += [T(d, ttl, f'Perk {i + 1}', 'black', 50, INK, label=f'Perk {i + 1}', x=x0, y=cy - 20, anim=en(x0, cy - 20, dy=-16, delay=dl + 3)),
                T(d, l1, f'Perk Text {i + 1}', 'med', 30, INK2, label=f'Perk Text {i + 1}', x=x0, y=cy - 80, anim=en(x0, cy - 80, dy=-16, delay=dl + 4)),
                card(d, f'Card {i + 1}', 500, 380, label='Card' if i == 0 else f'Card {i + 1}', x=cx, y=cy, anim=en(cx, cy, dy=-30, delay=dl))]
    out += [cta_button(d, 'BECOME A MEMBER →', -560, -340, delay=22),
            T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 26, INK2, label='URL', mono=True, x=-220, y=-352, anim=en(-220, -352, dx=-16, delay=24))]
    return G(d, out + backdrop(d))


def end_complete(d):
    w, h = 1000, 560
    cx, cy = 360, 0
    cert = [d.image('bp_logo.png', 'Certificate Logo', x=cx, y=cy + 190, sx=0.16, sy=0.16),
            T(d, 'CERTIFICATE OF COMPLETION', 'Certificate Label', None, 22, SIGNAL, 'center', 'Certificate Label', True, x=cx, y=cy + 90),
            T(d, 'Your Name', 'Student', 'black', 72, INK, 'center', 'Student Name', x=cx, y=cy - 10),
            d.solid('Certificate Rule', 640, 2, INK, None, x=cx, y=cy - 40),
            T(d, 'CRM Analytics Fundamentals', 'Course', 'semi', 34, INK2, 'center', 'Course Name', x=cx, y=cy - 100),
            T(d, 'CRM ANALYTICS ACADEMY', 'Issuer', None, 20, XGRAY, 'center', 'Issuer', True, x=cx, y=cy - 200)]
    cert += marks(d, w - 60, h - 60, SIGNAL, 'Certificate Mark Color', 0.5)
    c = d.group('Certificate', cert + [card(d, 'Certificate Card', w, h, label='Certificate')], rot=2, anim=en(0, 0, dy=-40, delay=4))
    x0 = -840
    out = [T(d, 'WELL DONE —', 'Eyebrow', None, 28, SIGNAL, label='Eyebrow', mono=True, x=x0, y=220, anim=en(x0, 220, dx=-24))]
    out += rtext(d, 'Course', 'Title', 'black', 120, INK, x0 - 4, 90, 2, bar_label='Reveal Color')
    out += rtext(d, 'complete', 'Title 2', 'black', 120, INK, x0 - 4, -30, 6)
    out += [T(d, 'Keep going — members get every course.', 'Subtitle', 'med', 32, INK2, label='Subtitle', x=x0, y=-120, anim=en(x0, -120, dy=-12, delay=10)),
            cta_button(d, 'JOIN THE ACADEMY →', x0 + 260, -240, 520, 90, delay=14)]
    return G(d, out + [floating(d, 'Certificate Float', [c], 8, 96)] + backdrop(d))


END_SCREENS = {'Become a Member': end_member, 'End Screen Two Videos': end_two_videos, 'End Screen Subscribe': end_subscribe,
               'Membership Perks': end_perks, 'Course Complete': end_complete}


# ================================================================== EFFECTS (applied to a clip)
def efx(name, loop=True):
    return doc('effect', name, 'Effects', 300, poster=30, loop=loop)


def ef_tint(d):
    clip = d.drop_zone('Effect Source', [SAT(-0.4, 'Saturation'), TINT(SIGNAL, 0.22, 'Blueprint'), CONTRAST(1.08)])
    return d.group('Effect', [clip])


def ef_graph(d):
    clip = d.drop_zone('Effect Source')
    gr = d.image('bp_graph.png', 'Graph Paper', color=FROST, color_label='Graph Color', opacity=0.22, pub=[('./1/200/202', 'Graph Opacity')],
                 anim={'X': (ease(0, -16, mc.LAST, 16), 'linear')})
    mk = marks(d, 1760, 920, WHITE, 'Crop Mark Color', 1.0)
    return d.group('Effect', mk + [gr, clip])


def ef_webcam(d):
    pos = [('Bottom Right', 624, -330), ('Bottom Left', -624, -330), ('Top Right', 624, 330), ('Top Left', -624, 330)]
    wid = d.popup('Corner', [n for n, _, _ in pos], 0)
    s = 0.3
    w, h = 1920 * s, 1080 * s
    box = [T(d, 'LIVE —', 'Label', None, 20, WHITE, 'left', 'Label', True, x=-w / 2 + 14, y=h / 2 - 34),
           d.solid('Label Plate', 110, 34, SIGNAL, 'Label Color', x=-w / 2 + 58, y=h / 2 - 26),
           d.drop_zone('Effect Source', sx=s, sy=s, pub=[('./1/100/105', 'Camera Zoom')]),
           d.solid('Border', w + 2 * BORDER, h + 2 * BORDER, INK, 'Border Color'),
           d.solid('Shadow', w + 2 * BORDER, h + 2 * BORDER, INK, None, x=SHADOW, y=-SHADOW, pub=[('./1/200/202', 'Shadow')])]
    g = d.group('Box', box, pub=[('./1/100/105', 'Box Size')])
    return d.group('Effect', [d.rig_wrap('Webcam', g, wid, {'X': [x for _, x, _ in pos], 'Y': [y for _, _, y in pos]})])


def ef_sheet(d):
    s = 0.84
    w, h = 1920 * s, 1080 * s
    y0 = 30
    clip = d.drop_zone('Effect Source', y=y0, sx=s, sy=s, pub=[('./1/100/105', 'Picture Size')])
    border = d.solid('Border', w + 2 * BORDER, h + 2 * BORDER, INK, 'Border Color', y=y0)
    rt = d.image('bp_ruler.png', 'Ruler Top', color=INK, color_label='Ruler Color', y=y0 + h / 2 + 24, sx=s, opacity=0.6)
    tb_w, tb_h = 520, 80
    tbx, tby = w / 2 - tb_w / 2, y0 - h / 2 - tb_h / 2 - 12
    tb = [T(d, 'DRAWN BY', 'Block Label 1', None, 14, INK2, label=None, mono=True, x=tbx - tb_w / 2 + 14, y=tby + 14),
          T(d, 'CRMA', 'Drawn By', None, 22, INK, label='Drawn By', mono=True, x=tbx - tb_w / 2 + 14, y=tby - 22),
          T(d, 'SHEET', 'Block Label 2', None, 14, INK2, label=None, mono=True, x=tbx + 14, y=tby + 14),
          T(d, '01 / 12', 'Sheet', None, 22, INK, label='Sheet', mono=True, x=tbx + 14, y=tby - 22),
          d.solid('Block Divider', 2, tb_h, INK, None, x=tbx, y=tby),
          d.solid('Block Fill', tb_w, tb_h, CARD, None, x=tbx, y=tby),
          d.solid('Block Border', tb_w + 4, tb_h + 4, INK, None, x=tbx, y=tby)]
    cap = T(d, 'FIG. 02 — LIVE DEMO', 'Caption', None, 24, SIGNAL, label='Caption', mono=True, x=-w / 2, y=y0 - h / 2 - 40)
    mk = d.group('Marks', marks(d, w + 40, h + 40), y=y0)
    return d.group('Effect', [cap] + tb + [rt, mk, clip, border] + backdrop(d))


def ef_vignette(d):
    clip = d.drop_zone('Effect Source')
    dim = d.image('spot_dark.png', 'Vignette', color=NAVY, color_label='Vignette Color', opacity=0.55, pub=[('./1/200/202', 'Vignette Amount'), ('./1/100/105', 'Vignette Size')])
    return d.group('Effect', [dim, clip])


PUSH = [('Subtle', 1.05), ('Normal', 1.1), ('Strong', 1.2), ('Very Strong', 1.35)]


def ef_push(d):
    wid = d.popup('Push Amount', [n for n, _ in PUSH], 1)
    snaps = {k: [([key(0, 1.0), key(mc.LAST, a)]) for _, a in PUSH] for k in ('SX', 'SY')}
    clip = d.drop_zone('Effect Source', pub=[('./1/100/101', 'Push Center')], rigs=[(wid, snaps, 'linear')])
    return d.group('Effect', [clip])


def ef_glitch(d):
    on = lambda f: any(s <= f < s + 9 for s in range(0, 300, 90))
    prism = Filter('PAEPrism', 'Split', {'Amount#1': [(f, 30 if on(f) and f % 3 else 0) for f in range(0, 301)], 'Crop#3': 0}, [('10001', 'Glitch Amount')], mode='hold')
    jx = [(f, ((37 * f) % 50 - 25) if on(f) and f % 2 else 0) for f in range(0, 301)]
    clip = d.drop_zone('Effect Source', [prism], anim={'X': (jx, 'hold')})
    flash = d.solid('Signal Flash', 1920, 1080, SIGNAL, 'Flash Color', blend=None,
                    anim={'Opacity': ([(f, 0.18 if on(f) and f % 3 == 1 else 0.0) for f in range(0, 301)], 'hold')}, pub=[('./1/200/202', 'Flash Amount')])
    return d.group('Effect', [flash, clip])


EFFECTS = {'Blueprint Tint': ef_tint, 'Graph Overlay': ef_graph, 'Webcam Box': ef_webcam, 'Drawing Sheet Frame': ef_sheet,
           'Navy Vignette': ef_vignette, 'Slow Push In': ef_push, 'Signal Glitch': ef_glitch}
EFFECT_NOLOOP = {'Slow Push In'}


# ================================================================== TRANSITIONS (new)
N, MID = 51, 25
E = N - 1
HOLD_A = [(0, 1), (MID, 0)]
HOLD_B = [(0, 0), (MID, 1)]


def AB(d):
    return [d.transition_zone('A', anim={'Opacity': (HOLD_A, 'hold')}), d.transition_zone('B', anim={'Opacity': (HOLD_B, 'hold')})]


def sweep_pair(d, name, start, end, color, label):
    """Full-frame bar: grows from the left to cover by the middle, then leaves to the right."""
    f0, f1, f2 = start, MID, end
    a = d.solid(f'{name} In', 1920, 1080, WHITE, None, anchor=(-960, 0), x=-960, anim={'SX': glide(f0, 0.0, f1, 1.0), 'Opacity': show([(0, f1)])})
    b = d.solid(f'{name} Out', 1920, 1080, WHITE, None, anchor=(960, 0), x=960, anim={'SX': glide(f1, 1.0, f2, 0.0), 'Opacity': show([(f1, E + 1)])})
    return tinted(d, name, [a, b], color, label)


def tr_block_sweep(d):
    ink = sweep_pair(d, 'Ink Bar', 0, E - 2, INK, 'Bar 2 Color')
    sig = sweep_pair(d, 'Signal Bar', 6, E - 14, SIGNAL, 'Bar 1 Color')
    a, b = AB(d)
    return d.group('Transition', [sig, ink, a, b])


def tr_blinds(d):
    n, hh = 8, 1080 / 8
    strips = []
    for i in range(n):
        y = 540 - hh / 2 - i * hh
        dl = i * 2
        strips.append(d.solid(f'Strip {i + 1}', 1920, hh + 2, WHITE, None, y=y,
                              anim={'SY': glide(dl, 0.0, MID - 2 + dl // 3, 1.0) + glide(MID + dl // 2, 1.0, E - 8 + dl // 2, 0.0)}))
    line = d.group('Lines', [d.solid(f'Line {i + 1}', 1920, 2, INK, None, y=540 - (i + 1) * hh, anim={'Opacity': ease(MID - 8, 0, MID, 0.5) + ease(MID, 0.5, MID + 10, 0)}) for i in range(n - 1)])
    a, b = AB(d)
    return d.group('Transition', [line, tinted(d, 'Blinds', strips, PAPER, 'Blinds Color'), a, b])


def tr_tiles(d):
    cols, rows = 6, 4
    tw, th = 1920 / cols, 1080 / rows
    groups = ([], [])
    for r in range(rows):
        for c in range(cols):
            x, y = -960 + tw / 2 + c * tw, 540 - th / 2 - r * th
            dl = (c + r) * 2
            s = d.solid(f'Tile {r + 1}-{c + 1}', tw + 2, th + 2, WHITE, None, x=x, y=y,
                        anim={'SX': glide(dl, 0.0, min(MID, dl + 10), 1.0) + ease_in(MID + dl // 2, 1.0, min(E, MID + dl // 2 + 10), 0.0),
                              'SY': glide(dl, 0.0, min(MID, dl + 10), 1.0) + ease_in(MID + dl // 2, 1.0, min(E, MID + dl // 2 + 10), 0.0)})
            groups[(r + c) % 2].append(s)
    a, b = AB(d)
    return d.group('Transition', [tinted(d, 'Tiles 1', groups[0], SIGNAL, 'Tile Color'), tinted(d, 'Tiles 2', groups[1], NAVY, 'Tile Color 2'), a, b])


def tr_iris(d):
    disc = d.image('circle_400.png', 'Iris', color=PAPER, color_label='Iris Color',
                   anim={'SX': ease_in(0, 0.0, MID, 6.0), 'SY': ease_in(0, 0.0, MID, 6.0), 'Opacity': ease(MID + 2, 1, E, 0)})
    ring = d.image('bp_ring.png', 'Ring', color=SIGNAL, color_label='Ring Color',
                   anim={'SX': glide(MID - 6, 2.0, E, 14.0), 'SY': glide(MID - 6, 2.0, E, 14.0), 'Opacity': ease(MID - 6, 0, MID, 1) + ease(MID, 1, E, 0)})
    a, b = AB(d)
    return d.group('Transition', [ring, disc, a, b])


def tr_push_blur(d):
    from make_transitions import dblur
    a = d.transition_zone('A', [dblur([key(0, 0, 'in'), key(MID, 90), key(E, 0)], 0)], anim={'X': ease(0, 0, E, -1920), 'SX': ease(0, 1, MID, 0.94) + ease(MID, 0.94, E, 1), 'SY': ease(0, 1, MID, 0.94) + ease(MID, 0.94, E, 1)})
    b = d.transition_zone('B', [dblur([key(0, 0), key(MID, 90), key(E, 0, 'soft')], 0, 'Blur Amount B')], anim={'X': ease(0, 1920, E, 0), 'SX': ease(0, 1, MID, 0.94) + ease(MID, 0.94, E, 1), 'SY': ease(0, 1, MID, 0.94) + ease(MID, 0.94, E, 1)})
    edge = d.solid('Edge', 12, 1080, SIGNAL, 'Edge Color', anim={'X': ease(0, 960, E, -960)})
    return d.group('Transition', [edge, b, a])


def tr_card_stack(d):
    b = d.transition_zone('B', anim={'Y': glide(4, -1080, E - 4, 0)})
    sh = d.solid('Shadow', 1920, 1080, INK, None, x=SHADOW * 2, anim={'Y': glide(4, -1080 - SHADOW * 2, E - 4, -SHADOW * 2), 'Opacity': ease(E - 6, 1, E, 0)})
    dim = d.solid('Dim', 1920, 1080, INK, 'Dim Color', anim={'Opacity': ease(0, 0, E, 0.55)})
    a = d.transition_zone('A', anim={'SX': ease(0, 1, E, 0.9), 'SY': ease(0, 1, E, 0.9)})
    return d.group('Transition', [b, sh, dim, a])


TRANSITIONS2 = {'Block Sweep': tr_block_sweep, 'Blinds': tr_blinds, 'Tile Grid': tr_tiles, 'Iris': tr_iris, 'Push Blur': tr_push_blur, 'Card Stack': tr_card_stack}


# ================================================================== build
EXTRA_BLURBS2 = {
    'Intros': 'Academy intro (8 s, paper or navy) and a 4 s short version. Each one is timed to its music track in the Music folder: drop the matching track under it.',
    'Slides': 'Full-frame teaching slides: title slide, slide intro, agenda, bullet points, two column, icon cards, icon grid, typed SAQL query block, query and result, image and text, big numbers, process flow, quiz (Show Answer pop-up), summary. Icons are image wells — drop any icon on them.',
    'End Screens': 'Become a member (with a floating member pass), end screen with two video wells and a join strip, subscribe end screen, membership perks, course complete certificate.',
    'Effects': 'Blueprint tint, graph overlay, webcam box (Corner pop-up), drawing sheet frame, navy vignette, slow push in (Push Amount pop-up), signal glitch.',
}


def build_all(only=None):
    def want(name, folder):
        return not only or only in name or only in folder
    for name, (fn, dur, _) in INTROS.items():
        if want(name, 'Intros'):
            d = doc('title', name, 'Intros', dur, (dur - 40, dur - 8), round(dur * 0.8))
            d.write(fn(d), thumb_bp(name, 'Intro'))
    for name, fn in SLIDES.items():
        if want(name, 'Slides'):
            d = doc('title', name, 'Slides', 300, (SLIDE_BUILD.get(name, 60), 276), 150)
            d.write(fn(d), thumb_bp(name, 'Slide'))
    for folder, items, builds in (('Lower Thirds', LOWER_THIRDS2, {}), ('Lessons', LESSONS2, LESSON_BUILD), ('Titles', TITLES2, {})):
        for name, fn in items.items():
            if want(name, folder):
                d = doc('title', name, folder, 300, (builds.get(name, 24), 276), 150)
                d.write(with_animation(d, fn(d)), thumb_bp(name, folder))
    for name, fn in END_SCREENS.items():
        if want(name, 'End Screens'):
            d = doc('title', name, 'End Screens', 300, (40, 276), 150)
            d.write(fn(d), thumb_bp(name, 'End Screen'))
    for name, fn in EFFECTS.items():
        if want(name, 'Effects'):
            d = efx(name, name not in EFFECT_NOLOOP)
            d.write(fn(d), thumb_bp(name, 'Effect'))
    for name, fn in TRANSITIONS2.items():
        if want(name, 'Transitions'):
            d = doc('transition', name, 'Transitions', N, poster=MID)
            d.write(fn(d), thumb_bp(name, 'Transition'))
    mc.LAST = 299


if __name__ == '__main__':
    build_all(sys.argv[1] if len(sys.argv) > 1 else None)
