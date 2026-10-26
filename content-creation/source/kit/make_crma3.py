"""make_crma3.py — CRMA kit, part 3: the teaching kit. Lesson intros and outros, explain slides (definition,
example, do/don't, glossary, analogy, concept map), data tables (sample data typed in, schema, filter, group by),
diagrams (joins, appends, recipe graph, dataflow pipeline, object model), dashboards (mock dashboard, KPI tiles,
bar / line / funnel / ranked charts), screen + camera layouts, text animations, arrows and elements.
Same Blueprint language, same CRMA category, built on make_crma / make_crma2.

    python make_crma3.py [filter]
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_crma as mc
from make_crma import *
from make_crma2 import RED, doc, en, drawx, show, rtext, typed, breathe, floating, icon, tile, footer, header, bullet, cta_button

GREEN = '#1F9D6B'


# ================================================================== drawing helpers
def box(d, name, w, h, x=0, y=0, fill=CARD, border=INK, shadow=6, label=None, **kw):
    """card() that publishes its colours only when given a label (keeps busy templates' Inspector short)."""
    out = [d.solid(f'{name} Fill', w, h, fill, f'{label} Color' if label else None),
           d.solid(f'{name} Border', w + 2 * BORDER, h + 2 * BORDER, border, f'{label} Border Color' if label else None)]
    if shadow:
        out.append(d.solid(f'{name} Shadow', w + 2 * BORDER, h + 2 * BORDER, border, None, x=shadow, y=-shadow))
    return d.group(name, out, x=x, y=y, **kw)


def out_keys(full, delay, dur, out=10):
    L = mc.LAST
    return glide(delay, 0.0, delay + dur, full) + ease_in(L - dur - out, full, L - out, 0.0)


def line(d, name, x0, y0, x1, y1, delay=0, color=INK, thick=BORDER, dur=10, label=None, exit=True):
    """A straight line drawn from (x0, y0) to (x1, y1)."""
    n = math.hypot(x1 - x0, y1 - y0)
    ang = math.degrees(math.atan2(y1 - y0, x1 - x0))
    sx = out_keys(1.0, delay, dur) if exit else glide(delay, 0.0, delay + dur, 1.0)
    return d.solid(name, n, thick, color, label, anchor=(-n / 2, 0), x=x0, y=y0, rot=ang, anim={'SX': sx})


def head(d, name, x, y, ang, delay=0, color=INK, size=26, thick=BORDER + 1, exit=True):
    """Chevron arrow head with its tip at (x, y), pointing along ang (degrees)."""
    barbs = [d.solid(f'{name} Barb {i}', size, thick, color, None, anchor=(size / 2, 0), rot=r) for i, r in ((1, 38), (2, -38))]
    return d.group(name, barbs, x=x, y=y, rot=ang, anim=en(x, y, delay=delay, scale=0.0, exit=exit))


def arrow(d, name, pts, delay=0, color=INK, thick=BORDER + 1, dur=8, size=26, label=None):
    """Poly-line arrow through pts, each segment drawn in turn, head on the last point. Returns (layers, end_frame)."""
    out, f = [], delay
    for i, ((x0, y0), (x1, y1)) in enumerate(zip(pts, pts[1:])):
        out.append(line(d, f'{name} Line {i + 1}', x0, y0, x1, y1, f, color, thick, dur, label if i == 0 else None))
        f += dur
    (xa, ya), (xb, yb) = pts[-2], pts[-1]
    out.insert(0, head(d, f'{name} Head', xb, yb, math.degrees(math.atan2(yb - ya, xb - xa)), f - 2, color, size, thick))
    return out, f


def _black_advance():
    """Exact advance widths of Schibsted Grotesk Black, when fontTools and the font are installed (optional)."""
    try:
        from fontTools.ttLib import TTFont
        from fontTools.varLib import instancer
        f = TTFont(os.path.expanduser('~/Library/Fonts/SchibstedGrotesk.ttf'))
        if 'fvar' in f:
            f = instancer.instantiateVariableFont(f, {'wght': 900})
        cmap, hmtx, upm = f.getBestCmap(), f['hmtx'], f['head'].unitsPerEm
        return lambda s, size: sum(hmtx[cmap.get(ord(c), '.notdef')][0] for c in s) * size / upm
    except Exception:
        return None


BLACK_WIDTH = _black_advance()


def tw(s, size, mono=False, black=False):
    """Rendered width of a string: measured for Schibsted Grotesk Black when possible, else estimated."""
    if black and BLACK_WIDTH:
        return BLACK_WIDTH(s, size)
    return len(s) * size * (0.6 if mono or black else 0.52)


def chip(d, s, name, x, y, fill=ICE, color=INK, size=22, delay=0, label=None, border=None):
    """Mono pill-free tag: square chip with text, x = left edge."""
    w = tw(s, size, True) + 32
    return [T(d, s, name, None, size, color, 'left', label, True, x=x + 16, y=y - size * 0.36, anim=en(x + 16, y - size * 0.36, delay=delay + 1, dy=-10)),
            box(d, f'{name} Chip', w, size * 1.9, x + w / 2, y, fill=fill, border=border or fill, shadow=0, anim=en(x + w / 2, y, delay=delay, dy=-10))]


def table(d, name, cols, rows, x, y, widths, rh=66, delay=0, stagger=3, size=28, head_fill=INK, cell_fill=CARD, zebra=ICE,
          highlight=None, typed_rows=False, fpc=0.35, head_row=True):
    """A data table, top-left corner at (x, y). Header band, rows build in one after another (or are typed in).
    highlight: pop-up widget id -> 'Highlight Row' rig (entry 0 = none). Returns (layers top→bottom, end_frame)."""
    hh = rh if head_row else 0
    W, H = sum(widths), hh + rh * len(rows)
    xs = [x + sum(widths[:i]) for i in range(len(widths))]
    top, f = [], delay + 4
    hdr = [] if not head_row else [T(d, c, f'{name} Head {j + 1}', None, size * 0.78, WHITE, 'left', None, True, x=xs[j] + 22, y=y - rh / 2 - size * 0.28) for j, c in enumerate(cols)]
    if head_row:
        top.append(d.group(f'{name} Header', hdr + [d.solid(f'{name} Header Band', W, rh, head_fill, None, x=x + W / 2, y=y - rh / 2)],
                           anim=en(0, 0, dy=-12, delay=delay + 2)))
    for i, r in enumerate(rows):
        cy = y - hh - rh * (i + 0.5)
        cells, row_start = [], f
        if typed_rows:
            for j, v in enumerate(r):
                layers, f1 = typed(d, v, f'{name} R{i + 1}C{j + 1}', size * 0.82, INK, xs[j] + 22, cy - size * 0.3, f,
                                   cover=zebra if i % 2 else cell_fill, caret=SIGNAL, fpc=fpc)
                cells += layers
                f = f1 + 1
            f += 2
        else:
            f = delay + 6 + stagger * i
            cells = [T(d, v, f'{name} R{i + 1}C{j + 1}', 'semi' if j else 'bold', size, INK, 'left', None, x=xs[j] + 22, y=cy - size * 0.34) for j, v in enumerate(r)]
        fill = d.solid(f'{name} Row {i + 1}', W, rh, zebra if i % 2 else cell_fill, None, x=x + W / 2, y=cy)
        rule = d.solid(f'{name} Rule {i + 1}', W, 2, LINE, None, x=x + W / 2, y=cy - rh / 2)
        hl = []
        if highlight is not None:
            g = d.group(f'{name} Highlight {i + 1}', [d.solid(f'{name} Mark {i + 1}', 10, rh, SIGNAL, 'Highlight Color' if i == 0 else None, x=x + 5, y=cy),
                                                      d.solid(f'{name} Glow {i + 1}', W, rh, SIGNAL, None, x=x + W / 2, y=cy, opacity=0.14)])
            hl = [d.rig_wrap(f'{name} Highlight {i + 1} Rig', g, highlight, {'Opacity': [0.0] + [1.0 if k == i else 0.0 for k in range(len(rows))]})]
        if typed_rows:
            top.append(d.group(f'{name} Row {i + 1} Cells', cells + hl + [rule, fill], anim={'Opacity': show([(row_start, mc.LAST - 8)])}))
        else:
            top.append(d.group(f'{name} Row {i + 1} Cells', cells + hl + [rule, fill], anim=en(0, 0, dx=-20, delay=f)))
    border = d.solid(f'{name} Border', W + 2 * BORDER, H + 2 * BORDER, INK, None, x=x + W / 2, y=y - H / 2, anim=en(x + W / 2, y - H / 2, delay=delay))
    shadow = d.solid(f'{name} Shadow', W + 2 * BORDER, H + 2 * BORDER, INK, None, x=x + W / 2 + 8, y=y - H / 2 - 8, anim=en(x + W / 2 + 8, y - H / 2 - 8, delay=delay))
    return top + [border, shadow], f


def slide(d, layers, num):
    return G(d, layers + footer(d, num) + backdrop(d))


# ================================================================== INTROS (8 s, timed to "CRMA Academy Intro (8s)")
def lesson_intro(dark=False):
    def build(d):
        hit, lock = 30, 150
        ink, sub, acc = (WHITE, FROST, GLOW) if dark else (INK, INK2, SIGNAL)
        bg = d.solid('Paper', 1920, 1080, NIGHT if dark else PAPER, 'Paper Color')
        gr = d.image('bp_graph.png', 'Graph Paper', color=FROST if dark else SIGNAL, color_label='Graph Color',
                     anim={'Opacity': ease(0, 0, 24, 0.22 if dark else 0.16), 'SX': glide(0, 1.15, 60, 1.0), 'SY': glide(0, 1.15, 60, 1.0)})
        out = []
        # construction lines: four rulers draw in before the hit, like a sheet being set up
        for i, (yy, dl) in enumerate(((330, 0), (-330, 4))):
            out.append(line(d, f'Guide H{i + 1}', -960, yy, 960, yy, dl, acc, 2, 22, 'Guide Color' if i == 0 else None, exit=False))
        for i, (xx, dl) in enumerate(((-840, 2), (840, 6))):
            out.append(line(d, f'Guide V{i + 1}', xx, 540, xx, -540, dl, acc, 2, 22, exit=False))
        mk = d.group('Marks', marks(d, 1680, 660, acc if dark else XGRAY, 'Crop Mark Color', 0.9),
                     anim={'SX': glide(0, 1.4, hit, 1.0), 'SY': glide(0, 1.4, hit, 1.0), 'Opacity': ease(0, 0, 10, 1)})
        logo = d.image('bp_logo.png', 'Logo', x=640, y=60, sx=0.42, sy=0.42,
                       anim={'SX': spring(hit, 0.0, hit + 12, 0.42, 0.2), 'SY': spring(hit, 0.0, hit + 12, 0.42, 0.2), 'Opacity': show([(hit, mc.LAST + 1)])},
                       pub=[('./1/200/202', 'Logo Opacity')])
        ring = d.image('bp_ring.png', 'Ring', color=acc, color_label='Ring Color', x=640, y=60,
                       anim={'SX': glide(hit, 1.0, hit + 20, 5.0), 'SY': glide(hit, 1.0, hit + 20, 5.0), 'Opacity': [key(0, 0), key(hit - 1, 0), key(hit, 1), key(hit + 20, 0)]})
        out += [ring, floating(d, 'Logo Float', [logo], 8, 90, hit + 14)]
        out.append(T(d, 'MODULE 03 · LESSON 04', 'Eyebrow', None, 30, acc, label='Eyebrow', mono=True, x=-760, y=230,
                     anim=en(-760, 230, dx=-30, delay=hit + 6, exit=False)))
        out += rtext(d, 'Window functions', 'Title', 'black', 120, ink, -766, 90, hit + 10, bar=acc, bar_label='Reveal Color', exit=False, w=tw('Window functions', 120, black=True) + 40)
        out += rtext(d, 'in SAQL', 'Title 2', 'black', 120, ink, -766, -40, hit + 16, bar=ink, exit=False, w=tw('in SAQL', 120, black=True) + 40)
        out.append(d.image('bp_ruler.png', 'Ruler', color=ink, color_label='Ruler Color', y=-110, opacity=0.6, anchor=(-960, 0), x=-760,
                           anim={'SX': glide(hit + 24, 0.0, hit + 44, 0.55)}))
        out += [T(d, '12 MIN', 'Length', None, 28, sub, label='Length', mono=True, x=-760, y=-190, anim=en(-760, -190, dy=-14, delay=hit + 30, exit=False)),
                T(d, 'INTERMEDIATE', 'Level', None, 28, sub, label='Level', mono=True, x=-560, y=-190, anim=en(-560, -190, dy=-14, delay=hit + 33, exit=False))]
        out.append(T(d, 'CRM ANALYTICS ACADEMY', 'Brand', None, 26, acc, label='Brand', mono=True, x=-760, y=-410,
                     anim={'Opacity': ease(lock, 0, lock + 8, 1), 'Y': glide(lock, -430, lock + 14, -410)}))
        out.append(T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 26, sub, 'right', 'URL', True, x=840, y=-410,
                     anim={'Opacity': ease(lock + 4, 0, lock + 12, 1), 'Y': glide(lock + 4, -430, lock + 18, -410)}))
        return d.group('Intro', out + [mk, gr, bg])
    return build


def hook_intro(d):
    """Cold open: a question on its own, then the lesson title answers it."""
    hit, lock = 30, 150
    out = [T(d, '?', 'Mark', 'black', 520, ICE, 'right', 'Mark', x=880, y=-260, anim={'Opacity': ease(0, 0, 12, 1), 'SX': glide(0, 1.3, 30, 1.0), 'SY': glide(0, 1.3, 30, 1.0)})]
    out.append(T(d, 'QUESTION —', 'Eyebrow', None, 30, SIGNAL, label='Eyebrow', mono=True, x=-800, y=200, anim=en(-800, 200, dx=-30, delay=4, out=60)))
    for i, s in enumerate(('Why does your', 'dashboard take', '30 seconds to load?')):
        out += [T(d, s, f'Question {i + 1}', 'black', 96, INK, label=f'Question {i + 1}', x=-806, y=80 - i * 112,
                  anim={'Opacity': ease(hit + 8 * i, 0, hit + 8 * i + 6, 1) + ease(lock - 10, 1, lock - 4, 0), 'Y': glide(hit + 8 * i, 50 - i * 112, hit + 8 * i + 12, 80 - i * 112)})]
    out.append(T(d, 'THIS LESSON →', 'Answer Eyebrow', None, 30, SIGNAL, label='Answer Eyebrow', mono=True, x=-800, y=60,
                 anim={'Opacity': ease(lock, 0, lock + 6, 1), 'X': glide(lock, -830, lock + 14, -800)}))
    out += rtext(d, 'Faster dashboards', 'Answer', 'black', 120, INK, -806, -80, lock + 4, bar_label='Reveal Color', exit=False, w=tw('Faster dashboards', 120, black=True) + 40)
    return d.group('Intro', out + backdrop(d))


# ================================================================== OUTROS (8 s, the "CRMA Outro Sting (6s)" fits inside)
def outro_thanks(dark=False):
    def build(d):
        ink, sub, acc = (WHITE, FROST, GLOW) if dark else (INK, INK2, SIGNAL)
        out = [T(d, 'THAT\'S A WRAP —', 'Eyebrow', None, 30, acc, 'center', 'Eyebrow', True, y=250, anim=en(0, 250, dy=-20, exit=False))]
        out += rtext(d, 'Thanks for watching', 'Title', 'black', 120, ink, 0, 110, 4, bar=acc, bar_label='Reveal Color', align='center', exit=False, w=tw('Thanks for watching', 120, black=True) + 40)
        out.append(T(d, 'Practise it in your own org, then come back for the next one.', 'Subtitle', 'med', 38, sub, 'center', 'Subtitle', y=10,
                     anim=en(0, 10, dy=-16, delay=12, exit=False)))
        out.append(cta_button(d, 'SUBSCRIBE ▶', -300, -150, 520, 100, 18, 'Subscribe'))
        out.append(d.group('Site', [T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'Site Text', None, 26, ink, 'center', 'Site', True, y=-10),
                                    box(d, 'Site Box', 520, 100, fill=NIGHT if dark else CARD, border=ink, label='Site')], x=300, y=-150, anim=en(300, -150, delay=22, scale=0.6, exit=False)))
        logo = d.image('bp_logo.png', 'Logo', y=-360, sx=0.2, sy=0.2, anim=en(0, -360, delay=26, scale=0.5, sx=0.2, sy=0.2, exit=False), pub=[('./1/200/202', 'Logo Opacity')])
        return d.group('Outro', out + [logo] + backdrop(d, dark=dark))
    return build


def outro_next(d):
    out = [T(d, 'UP NEXT —', 'Eyebrow', None, 30, SIGNAL, label='Eyebrow', mono=True, x=-760, y=300, anim=en(-760, 300, dx=-24, exit=False))]
    out += [T(d, 'LESSON 05', 'Lesson Number', None, 30, INK2, label='Lesson Number', mono=True, x=-700, y=150, anim=en(-700, 150, dy=-16, delay=8, exit=False))]
    out += rtext(d, 'Bindings that', 'Title', 'black', 104, INK, -704, 30, 10, bar_label='Reveal Color', exit=False, w=tw('Bindings that', 104, black=True) + 40)
    out += rtext(d, 'drive each other', 'Title 2', 'black', 104, INK, -704, -80, 14, exit=False, w=tw('drive each other', 104, black=True) + 40)
    out.append(box(d, 'Card', 1600, 470, 0, 10, label='Card', anim=en(0, 10, dy=-30, delay=4, exit=False)))
    out += [T(d, 'COURSE PROGRESS', 'Progress Label', None, 22, SIGNAL, label='Progress Label', mono=True, x=-760, y=-300, anim=en(-760, -300, delay=20, exit=False)),
            T(d, '4 / 24', 'Progress Count', None, 22, INK2, 'right', 'Progress Count', True, x=760, y=-300, anim=en(760, -300, delay=20, exit=False)),
            d.image('bp_hatch.png', 'Progress Fill', y=-350, anchor=(-960, 0), x=-760, anim={'SX': glide(24, 0.0, 70, 0.14)}),
            d.solid('Progress Track', 1520, 26, ICE, 'Track Color', y=-350, anim=en(0, -350, delay=20, exit=False)),
            d.solid('Progress Border', 1520 + 2 * BORDER, 26 + 2 * BORDER, INK, None, y=-350, anim=en(0, -350, delay=20, exit=False))]
    arrow_l, _ = arrow(d, 'Next Arrow', [(500, -40), (700, -40)], 22, SIGNAL, 6, 8, 34, 'Arrow Color')
    return d.group('Outro', arrow_l + out + backdrop(d))


def outro_minimal(d):
    logo = d.image('bp_logo.png', 'Logo', y=80, sx=0.5, sy=0.5, anim=en(0, 80, scale=0.6, sx=0.5, sy=0.5, exit=False), pub=[('./1/200/202', 'Logo Opacity')])
    out = [logo, d.solid('Rule', 700, BORDER, INK, 'Rule Color', y=-110, **{**drawx(-350, 700, 8), 'anim': {'SX': glide(8, 0.0, 22, 1.0)}}),
           T(d, 'CRMANALYTICS.IMSWARNIL.COM', 'URL', None, 34, SIGNAL, 'center', 'URL', True, y=-180, anim=en(0, -180, dy=-16, delay=12, exit=False)),
           T(d, 'FREE · OPEN · HANDS-ON', 'Tagline', None, 24, INK2, 'center', 'Tagline', True, y=-240, anim=en(0, -240, dy=-16, delay=16, exit=False))]
    return d.group('Outro', out + backdrop(d))


# ================================================================== EXPLAIN (full-frame teaching slides)
def ex_definition(d):
    out = [T(d, 'DEFINITION —', 'Eyebrow', None, 28, SIGNAL, label='Eyebrow', mono=True, x=-840, y=380, anim=en(-840, 380, dx=-24))]
    out += rtext(d, 'Dataset', 'Term', 'black', 170, INK, -848, 210, 2, bar_label='Reveal Color', w=tw('Dataset', 170, black=True) + 40)
    out += chip(d, 'NOUN · CRM ANALYTICS', 'Word Class', -840, 120, delay=8, label='Word Class')
    out += [T(d, 'A read-only copy of your data, stored and', 'Definition', 'semi', 48, INK, label='Definition', x=-840, y=10, anim=en(-840, 10, dy=-14, delay=10)),
            T(d, 'indexed so a dashboard can query it fast.', 'Definition 2', 'semi', 48, INK, label='Definition Line 2', x=-840, y=-56, anim=en(-840, -56, dy=-14, delay=12))]
    # plain words + example
    out += [T(d, 'IN PLAIN WORDS —', 'Plain Eyebrow', None, 22, SIGNAL, label='Plain Eyebrow', mono=True, x=-810, y=-170, anim=en(-810, -170, dy=-12, delay=16)),
            T(d, 'A snapshot built for questions, not edits.', 'Plain', 'med', 34, INK2, label='Plain', x=-810, y=-230, anim=en(-810, -230, dy=-12, delay=17)),
            box(d, 'Plain Card', 820, 190, -420, -210, fill=ICE, label='Plain Card', anim=en(-420, -210, dy=-20, delay=14))]
    out += [T(d, 'EXAMPLE —', 'Example Eyebrow', None, 22, GLOW, label='Example Eyebrow', mono=True, x=50, y=-170, anim=en(50, -170, dy=-12, delay=20)),
            T(d, 'q = load "opportunities";', 'Example', None, 30, WHITE, label='Example', mono=True, x=50, y=-232, anim=en(50, -232, dy=-12, delay=21)),
            box(d, 'Example Card', 820, 190, 460, -210, fill=NAVY, label='Example Card', anim=en(460, -210, dy=-20, delay=18))]
    out.append(T(d, 'SEE ALSO', 'See Also', None, 20, INK2, label='See Also', mono=True, x=-840, y=-372, anim=en(-840, -372, delay=24)))
    for i, s in enumerate(('RECIPE', 'LENS', 'DATA SYNC')):
        out += chip(d, s, f'Related {i + 1}', -680 + i * 200, -364, fill=CARD, border=INK, delay=25 + 2 * i, label=None)
    return slide(d, out, '14')


def ex_example(d):
    out = header(d, 'EXAMPLE 01 —', 'Win rate by region')
    out += [T(d, 'THE QUESTION', 'Question Eyebrow', None, 22, SIGNAL, label='Question Eyebrow', mono=True, x=-800, y=160, anim=en(-800, 160, dy=-12, delay=8)),
            T(d, '“Which region closes', 'Question', 'black', 50, INK, label='Question', x=-800, y=84, anim=en(-800, 84, dy=-12, delay=9)),
            T(d, 'the most of what it opens?”', 'Question 2', 'black', 50, INK, label='Question Line 2', x=-800, y=24, anim=en(-800, 24, dy=-12, delay=10))]
    for i, s in enumerate(('Group opportunities by Region', 'Count Won ÷ count all', 'Sort descending, keep the top 4')):
        y, dl = -90 - i * 92, 14 + 5 * i
        out += [T(d, f'{i + 1}', f'Step Num {i + 1}', 'black', 32, WHITE, 'center', None, x=-776, y=y - 12, anim=en(-776, y - 12, delay=dl + 1, scale=0.5)),
                d.solid(f'Step Box {i + 1}', 56, 56, SIGNAL, 'Step Color' if i == 0 else None, x=-776, y=y, anim=en(-776, y, delay=dl, scale=0.0)),
                T(d, s, f'Step {i + 1}', 'semi', 36, INK, label=f'Step {i + 1}', x=-724, y=y - 13, anim=en(-724, y - 13, dx=-20, delay=dl + 1))]
    out.append(box(d, 'Question Card', 900, 600, -400, -100, label='Question Card', anim=en(-400, -100, dy=-30, delay=6)))
    a, _ = arrow(d, 'Answer Arrow', [(90, -100), (240, -100)], 32, SIGNAL, 6, 8, 30, 'Arrow Color')
    out += a
    out += [T(d, 'THE ANSWER', 'Answer Eyebrow', None, 22, GLOW, 'center', 'Answer Eyebrow', True, x=560, y=120, anim=en(560, 120, delay=40)),
            T(d, 'EMEA', 'Answer', 'black', 64, WHITE, 'center', 'Answer', x=560, y=20, anim=en(560, 20, delay=42, scale=0.6)),
            d.number(0, 41, 'Rate', SANS['black'], 150, GLOW, publish='Rate', x=520, y=-190, anim=en(520, -190, delay=44)),
            T(d, '%', 'Unit', 'black', 90, GLOW, label='Unit', x=618, y=-180, anim=en(640, -180, delay=45)),
            T(d, 'WIN RATE', 'Answer Label', None, 22, FROST, 'center', 'Answer Label', True, x=560, y=-290, anim=en(560, -290, delay=46)),
            box(d, 'Answer Card', 520, 600, 560, -100, fill=NAVY, label='Answer Card', anim=en(560, -100, dx=30, delay=38))]
    return slide(d, out, '15')


def ex_do_dont(d):
    out = header(d, 'DO / DON\'T —', 'Filter in the right place')
    cols = ((-430, 'DO', GREEN, 'check', ['Filter in the recipe', 'Keep only the fields you chart', 'Name steps for what they do']),
            (430, 'DON\'T', RED, 'x', ['Filter after a big join', 'Load every field “just in case”', 'Leave steps as “step_1”']))
    for side, (cx, ttl, col, ic, pts) in enumerate(cols):
        n = 'Do' if side == 0 else 'Dont'
        dl, cy = 8 + 10 * side, -110
        out += [icon(d, ic, f'{n} Icon', cx - 330, cy + 200, 64, WHITE, None, dl + 2, well=False),
                d.solid(f'{n} Badge', 100, 100, col, f'{n} Color', x=cx - 330, y=cy + 200, anim=en(cx - 330, cy + 200, delay=dl + 1, scale=0.0)),
                T(d, ttl, f'{n} Title', 'black', 64, col, label=f'{n} Title', x=cx - 250, y=cy + 176, anim=en(cx - 250, cy + 176, dx=-20, delay=dl + 2))]
        for j, p in enumerate(pts):
            out += bullet(d, side * 3 + j + 1, p, cx - 356, cy + 40 - j * 100, dl + 5 + 3 * j, 36, sq=col, label=f'{n} Point {j + 1}')
        out.append(box(d, f'{n} Card', 800, 540, cx, cy, border=col, shadow=SHADOW, label=f'{n} Card', anim=en(cx, cy, dy=-30, delay=dl)))
    return slide(d, out, '16')


def ex_glossary(d):
    out = header(d, 'GLOSSARY —', 'Words you\'ll hear today')
    terms = [('Dataset', 'Indexed copy of your data, built for queries.'), ('Recipe', 'Steps that join, clean and shape data.'),
             ('Lens', 'An ad-hoc exploration of one dataset.'), ('Binding', 'One widget\'s result driving another.')]
    for i, (t_, df) in enumerate(terms):
        y, dl = 150 - i * 140, 10 + 5 * i
        out += [T(d, f'{i + 1:02d}', f'Index {i + 1}', None, 26, SIGNAL, label=None, mono=True, x=-840, y=y - 10, anim=en(-840, y - 10, delay=dl)),
                T(d, t_, f'Term {i + 1}', 'black', 56, INK, label=f'Term {i + 1}', x=-760, y=y - 20, anim=en(-760, y - 20, dx=-20, delay=dl + 1)),
                T(d, df, f'Meaning {i + 1}', 'med', 36, INK2, label=f'Meaning {i + 1}', x=-200, y=y - 16, anim=en(-200, y - 16, dx=-20, delay=dl + 3)),
                d.solid(f'Row Rule {i + 1}', 1680, 2, LINE, 'Row Rule Color' if i == 0 else None, y=y - 70, **drawx(-840, 1680, dl + 2))]
    return slide(d, out, '17')


def ex_analogy(d):
    out = header(d, 'THINK OF IT LIKE —', 'An analogy')
    for side, (cx, eb, ttl, txt, fill, ink) in enumerate(((-480, 'THE CONCEPT', 'Dataset', 'A copy of your data, shaped for questions.', CARD, INK),
                                                         (480, 'IS LIKE', 'A printed report', 'Fast to read, but not where you edit.', NAVY, WHITE))):
        n = 'Left' if side == 0 else 'Right'
        dl = 8 + 12 * side
        out += [T(d, eb, f'{n} Eyebrow', None, 24, SIGNAL if side == 0 else GLOW, 'center', f'{n} Eyebrow', True, x=cx, y=120, anim=en(cx, 120, dy=-14, delay=dl + 2)),
                T(d, ttl, f'{n} Title', 'black', 72, ink, 'center', f'{n} Title', x=cx, y=10, anim=en(cx, 10, dy=-14, delay=dl + 3)),
                T(d, txt, f'{n} Text', 'med', 32, INK2 if side == 0 else FROST, 'center', f'{n} Text', x=cx, y=-80, anim=en(cx, -80, dy=-14, delay=dl + 4)),
                box(d, f'{n} Card', 740, 420, cx, -20, fill=fill, shadow=SHADOW, label=f'{n} Card', anim=en(cx, -20, dy=-30, delay=dl))]
    out += [T(d, '≈', 'Sign', 'black', 140, SIGNAL, 'center', 'Sign', y=-60, anim=en(0, -60, delay=16, scale=0.3)),
            T(d, 'WHERE IT BREAKS: a dataset can be refreshed on a schedule.', 'Caveat', None, 26, INK2, 'center', 'Caveat', True, y=-330, anim=en(0, -330, dy=-12, delay=30))]
    return slide(d, out, '18')


def ex_concept_map(d):
    out, links = [], []
    cx, cy = 0, -40
    sats = [(-560, 170, 'database', 'Datasets'), (560, 170, 'git-merge', 'Recipes'), (-560, -250, 'code', 'SAQL'), (560, -250, 'chart-bar', 'Dashboards')]
    for i, (x, y, ic, s) in enumerate(sats):
        dl = 14 + 5 * i
        links.append(line(d, f'Link {i + 1}', cx, cy, x, y, dl - 6, INK, BORDER, 10, 'Link Color' if i == 0 else None))
        out += tile(d, ic, f'Node Icon {i + 1}', x - 130, y, 90, delay=dl + 2, label='Node Tile' if i == 0 else f'Node Tile {i + 1}')
        out += [T(d, s, f'Node {i + 1}', 'black', 44, INK, label=f'Node {i + 1}', x=x - 60, y=y - 16, anim=en(x - 60, y - 16, dx=-14, delay=dl + 3)),
                box(d, f'Node Card {i + 1}', 400, 140, x, y, label='Node Card' if i == 0 else None, anim=en(x, y, delay=dl, scale=0.8))]
    hub = [T(d, 'CRM', 'Hub Top', None, 26, GLOW, 'center', 'Hub Eyebrow', True, y=36),
           T(d, 'Analytics', 'Hub', 'black', 60, WHITE, 'center', 'Hub', y=-40),
           box(d, 'Hub Card', 420, 200, fill=SIGNAL, shadow=SHADOW, label='Hub Card')]
    out = [d.group('Hub', hub, x=cx, y=cy, anim=en(cx, cy, delay=4, scale=0.6))] + out + links
    out = header(d, 'CONCEPT MAP —', 'How the pieces connect') + out
    return slide(d, out, '19')


# ================================================================== DATA & TABLES
OPPS = [('Acme Corp', 'AMER', 'Closed Won', '$120K'), ('Globex', 'EMEA', 'Prospecting', '$45K'), ('Initech', 'AMER', 'Closed Won', '$80K'),
        ('Umbrella', 'APAC', 'Negotiation', '$62K'), ('Stark Ind.', 'EMEA', 'Closed Won', '$210K'), ('Wayne Ent.', 'AMER', 'Closed Lost', '$95K')]
OPP_COLS = ('ACCOUNT', 'REGION', 'STAGE', 'AMOUNT')


def dt_table(d):
    wid = d.popup('Highlight Row', ['None'] + [f'Row {i + 1}' for i in range(len(OPPS))], 0)
    out = header(d, 'DATA —', 'Opportunities (6 rows)')
    t, _ = table(d, 'Table', OPP_COLS, OPPS, -840, 200, (520, 340, 460, 360), rh=88, delay=8, size=34, highlight=wid)
    return slide(d, out + t, '20')


def dt_builder(d):
    """'Dummy data': a sample dataset is generated row by row; the cells type in."""
    out = header(d, 'SAMPLE DATA —', 'Build a practice dataset')
    out += [T(d, 'GENERATE ▶', 'Button Text', None, 24, WHITE, 'center', 'Button', True, x=700, y=360, anim=en(700, 360, delay=4, scale=0.6)),
            box(d, 'Button', 240, 64, 700, 370, fill=SIGNAL, shadow=6, label='Button', anim=en(700, 370, delay=3, scale=0.6))]
    rows = [('0061', 'Acme Corp', 'AMER', '120000'), ('0062', 'Globex', 'EMEA', '45000'), ('0063', 'Initech', 'AMER', '80000'),
            ('0064', 'Umbrella', 'APAC', '62000'), ('0065', 'Stark Ind.', 'EMEA', '210000')]
    t, f = table(d, 'Table', ('ID', 'ACCOUNT', 'REGION', 'AMOUNT'), rows, -840, 200, (260, 560, 380, 480), rh=84, delay=12, size=34, typed_rows=True, fpc=0.6)
    out += t
    out += [T(d, '5 ROWS · 4 FIELDS · academy_opportunities.csv', 'Status', None, 24, GREEN, label='Status', mono=True, x=-840, y=-380, anim=en(-840, -380, dy=-10, delay=f + 2)),
            icon(d, 'circle-check', 'Done', 820, -370, 44, GREEN, 'Done Color', f + 3, well=False)]
    cur = d.image('bp_cursor.png', 'Cursor', color=INK, color_label='Cursor Color', x=730, y=330, sx=0.45, sy=0.45,
                  anim={'X': glide(0, 900, 10, 730), 'Y': glide(0, 120, 10, 330), 'Opacity': ease(0, 0, 4, 1) + ease(30, 1, 36, 0)})
    ring = d.image('bp_ring.png', 'Click', color=SIGNAL, x=700, y=370, anim={'SX': glide(11, 0.2, 24, 1.4), 'SY': glide(11, 0.2, 24, 1.4), 'Opacity': [key(0, 0), key(10, 0), key(11, 1), key(24, 0)]})
    return slide(d, [cur, ring] + out, '21')


def dt_schema(d):
    out = header(d, 'SCHEMA —', 'What\'s in the dataset')
    fields = [('Account.Name', 'DIMENSION', SIGNAL), ('Region', 'DIMENSION', SIGNAL), ('StageName', 'DIMENSION', SIGNAL),
              ('Amount', 'MEASURE', GREEN), ('Probability', 'MEASURE', GREEN), ('CloseDate', 'DATE', TIDE)]
    for i, (f_, ty, col) in enumerate(fields):
        c, r = divmod(i, 3)
        x, y, dl = -840 + c * 860, 150 - r * 150, 8 + 4 * i
        out += [icon(d, {'DIMENSION': 'tag', 'MEASURE': 'hash', 'DATE': 'calendar'}[ty], f'Field Icon {i + 1}', x + 50, y, 44, col, None, dl + 1, well=False),
                T(d, f_, f'Field {i + 1}', None, 36, INK, label=f'Field {i + 1}', mono=True, x=x + 110, y=y - 12, anim=en(x + 110, y - 12, dx=-16, delay=dl + 2)),
                T(d, ty, f'Type {i + 1}', None, 20, WHITE, 'center', None, True, x=x + 690, y=y - 8, anim=en(x + 690, y - 8, delay=dl + 3)),
                d.solid(f'Type Chip {i + 1}', 170, 40, col, None, x=x + 690, y=y, anim=en(x + 690, y, delay=dl + 3, scale=0.5)),
                box(d, f'Field Card {i + 1}', 800, 110, x + 400, y, label='Field Card' if i == 0 else None, anim=en(x + 400, y, dy=-16, delay=dl))]
    out += [d.solid(f'Legend {i}', 20, 20, c_, None, x=-840 + i * 260, y=-330, anim=en(-840 + i * 260, -330, delay=34)) for i, c_ in enumerate((SIGNAL, GREEN, TIDE))]
    out += [T(d, s, f'Legend Text {i}', None, 20, INK2, label=None, mono=True, x=-816 + i * 260, y=-338, anim=en(-816 + i * 260, -338, delay=34)) for i, s in enumerate(('GROUP BY IT', 'SUM / AVG IT', 'TIME AXIS'))]
    return slide(d, out, '22')


def dt_filter(d):
    """Rows that don't match fade back and get struck through; the matching ones stay."""
    out = header(d, 'FILTER —', 'Keep only Closed Won')
    out += chip(d, "filter q by 'StageName' == \"Closed Won\"", 'Filter', -840, 200, fill=NAVY, color=GLOW, size=26, delay=6, label='Filter')
    t, _ = table(d, 'Table', OPP_COLS, OPPS, -840, 130, (520, 340, 460, 360), rh=80, delay=8, size=32)
    out += t
    hit = 60
    for i, r in enumerate(OPPS):
        if r[2] == 'Closed Won':
            continue
        y = 130 - 80 * (i + 1.5)
        out.insert(0, d.solid(f'Fade {i + 1}', 1680, 78, PAPER, None, x=0, y=y, anim={'Opacity': ease(hit + 3 * i + 8, 0, hit + 3 * i + 16, 0.7) + ease(mc.LAST - 12, 0.7, mc.LAST - 6, 0)}))
        out.insert(0, d.solid(f'Strike {i + 1}', 1600, 4, RED, 'Strike Color' if i == 1 else None, anchor=(-800, 0), x=-820, y=y,
                              anim={'SX': out_keys(1.0, hit + 3 * i, 10)}))
    out.append(T(d, '3 OF 6 ROWS KEPT', 'Result', None, 26, SIGNAL, 'right', 'Result', True, x=840, y=-440, anim=en(840, -440, dy=-10, delay=hit + 26)))
    return slide(d, out, '23')


def dt_group_by(d):
    """Raw rows on the left collapse into one row per region on the right."""
    out = header(d, 'GROUP BY —', 'One row per region')
    rows = [('AMER', '$120K'), ('EMEA', '$45K'), ('AMER', '$80K'), ('APAC', '$62K'), ('EMEA', '$210K'), ('AMER', '$95K')]
    col = {'AMER': SIGNAL, 'EMEA': TIDE, 'APAC': GLOW}
    t, _ = table(d, 'Raw', ('REGION', 'AMOUNT'), rows, -840, 190, (300, 300), rh=76, delay=6, size=30)
    for i, (rg, _) in enumerate(rows):
        y = 190 - 76 * (i + 1.5)
        t.insert(0, d.solid(f'Tag {i + 1}', 12, 76, col[rg], None, x=-834, y=y, anim=en(-834, y, delay=10 + 3 * i)))
    a, f = arrow(d, 'Group Arrow', [(-180, -40), (40, -40)], 40, INK, 5, 10, 30, 'Arrow Color')
    out += t + a
    out.append(T(d, "group q by 'Region'", 'Step', None, 24, SIGNAL, 'center', 'Step', True, x=-70, y=0, anim=en(-70, 0, delay=40)))
    g, _ = table(d, 'Grouped', ('REGION', 'SUM(AMOUNT)', 'ROWS'), [('AMER', '$295K', '3'), ('EMEA', '$255K', '2'), ('APAC', '$62K', '1')],
                 140, 120, (260, 320, 180), rh=86, delay=f + 2, stagger=6, size=32)
    for i, rg in enumerate(('AMER', 'EMEA', 'APAC')):
        y = 120 - 86 * (i + 1.5)
        g.insert(0, d.solid(f'Group Tag {i + 1}', 12, 86, col[rg], None, x=146, y=y, anim=en(146, y, delay=f + 8 + 6 * i)))
    return slide(d, out + g, '24')


# ================================================================== DIAGRAMS (joins, nodes, dataflows)
JOINS = [('Inner', 'INNER JOIN — only rows that match in both', (0, 0)), ('Left', 'LEFT JOIN — every row of A, matches from B', (1, 0)),
         ('Right', 'RIGHT JOIN — every row of B, matches from A', (0, 1)), ('Full Outer', 'FULL OUTER — every row of both', (1, 1))]


def dg_venn(d):
    wid = d.popup('Join Type', [n for n, _, _ in JOINS], 1)
    out = header(d, 'JOINS —', 'Which rows survive?')
    r, off, cy = 250, 150, -60
    s = 2 * r / 400
    lx, rx = -off, off
    fill_l = d.rig_wrap('Fill A', d.image('circle_400.png', 'Fill A Shape', color=FROST, color_label='Fill Color', sx=s, sy=s), wid, {'Opacity': [float(f[0]) for _, _, f in JOINS]})
    fill_r = d.rig_wrap('Fill B', d.image('circle_400.png', 'Fill B Shape', color=FROST, sx=s, sy=s), wid, {'Opacity': [float(f[1]) for _, _, f in JOINS]})
    lens_h = 2 * math.sqrt(r * r - off * off)
    lens = d.image('circle_400.png', 'Match', color=SIGNAL, color_label='Match Color', sx=(2 * r - 2 * off) / 400, sy=lens_h / 400, y=cy,
                   anim=en(0, cy, delay=26, scale=0.0, sx=(2 * r - 2 * off) / 400, sy=lens_h / 400))
    ring = lambda n, x: d.image('ring_240.png', n, color=INK, color_label='Ring Color' if n == 'Ring A' else None, x=x, y=cy, sx=2 * r / 240, sy=2 * r / 240,
                                anim=en(x, cy, dx=-260 if x < 0 else 260, delay=8, dur=14, sx=2 * r / 240, sy=2 * r / 240))
    labels = []
    for i, (n, txt, _) in enumerate(JOINS):
        labels.append(d.rig_wrap(f'Caption {n}', T(d, txt, f'Caption {n} Text', None, 30, INK, 'center', f'{n} Caption', True, y=-420), wid,
                                 {'Opacity': [1.0 if k == i else 0.0 for k in range(len(JOINS))]}))
    out += [d.group('Captions', labels, anim=en(0, 0, dy=-12, delay=30)),
            T(d, 'A', 'Label A', 'black', 90, INK, 'center', 'Label A', x=lx - 130, y=cy - 30, anim=en(lx - 130, cy - 30, delay=18)),
            T(d, 'B', 'Label B', 'black', 90, INK, 'center', 'Label B', x=rx + 130, y=cy - 30, anim=en(rx + 130, cy - 30, delay=20)),
            T(d, 'OPPORTUNITIES', 'Table A', None, 24, SIGNAL, 'center', 'Table A', True, x=lx - 130, y=cy - 90, anim=en(lx - 130, cy - 90, delay=18)),
            T(d, 'ACCOUNTS', 'Table B', None, 24, SIGNAL, 'center', 'Table B', True, x=rx + 130, y=cy - 90, anim=en(rx + 130, cy - 90, delay=20)),
            ring('Ring A', lx), ring('Ring B', rx), lens,
            d.group('Fill A Move', [fill_l], x=lx, y=cy, anim=en(lx, cy, dx=-260, delay=8, dur=14)),
            d.group('Fill B Move', [fill_r], x=rx, y=cy, anim=en(rx, cy, dx=260, delay=8, dur=14))]
    return slide(d, out, '25')


def dg_join_tables(d):
    out = header(d, 'JOIN —', 'Match on the key')
    a, _ = table(d, 'Opps', ('OPPORTUNITY', 'ACCOUNTID', 'AMOUNT'), [('Renewal', '001A', '$120K'), ('Upsell', '001B', '$45K'), ('New Biz', '001A', '$80K')],
                 -840, 200, (280, 240, 200), rh=72, delay=6, size=28)
    b, _ = table(d, 'Accounts', ('ID', 'NAME', 'REGION'), [('001A', 'Acme Corp', 'AMER'), ('001B', 'Globex', 'EMEA')],
                 160, 200, (180, 280, 220), rh=72, delay=10, size=28)
    out += a + b
    # key columns light up, then link lines join matching rows
    for i, (yy, x0) in enumerate(((200 - 72 * 1.5, -580), (200 - 72 * 2.5, -580), (200 - 72 * 3.5, -580))):
        out.insert(0, d.solid(f'Key A {i + 1}', 236, 68, SIGNAL, 'Key Color' if i == 0 else None, x=-440, y=yy, opacity=0.18, anim={'Opacity': ease(28, 0, 34, 0.18) + ease(mc.LAST - 12, 0.18, mc.LAST - 6, 0)}))
    for i in range(2):
        yy = 200 - 72 * (i + 1.5)
        out.insert(0, d.solid(f'Key B {i + 1}', 176, 68, SIGNAL, None, x=250, y=yy, anim={'Opacity': ease(30, 0, 36, 0.18) + ease(mc.LAST - 12, 0.18, mc.LAST - 6, 0)}))
    for i, (ra, rb) in enumerate(((0, 0), (1, 1), (2, 0))):
        ya, yb = 200 - 72 * (ra + 1.5), 200 - 72 * (rb + 1.5)
        out.insert(0, line(d, f'Match {i + 1}', -114, ya, 154, yb, 38 + 5 * i, SIGNAL, 4, 10, 'Match Color' if i == 0 else None))
    out.append(T(d, "join ON Opps.AccountId = Accounts.Id", 'Key Note', None, 24, SIGNAL, label='Key Note', mono=True, x=-840, y=-120, anim=en(-840, -120, delay=50)))
    r, _ = table(d, 'Result', ('OPPORTUNITY', 'AMOUNT', 'NAME', 'REGION'), [('Renewal', '$120K', 'Acme Corp', 'AMER'), ('Upsell', '$45K', 'Globex', 'EMEA'),
                 ('New Biz', '$80K', 'Acme Corp', 'AMER')], -840, -160, (420, 300, 520, 440), rh=64, delay=62, size=28)
    return slide(d, out + r, '26')


def dg_append(d):
    out = header(d, 'APPEND —', 'Stack rows from two sources')
    a, _ = table(d, 'Q1', ('ACCOUNT', 'AMOUNT', 'SOURCE'), [('Acme Corp', '$120K', 'Q1'), ('Globex', '$45K', 'Q1')], -600, 180, (480, 340, 380), rh=78, delay=6, size=32)
    out += a
    rows = [('Initech', '$80K', 'Q2'), ('Umbrella', '$62K', 'Q2')]
    b, _ = table(d, 'Q2', ('ACCOUNT', 'AMOUNT', 'SOURCE'), rows, -600, 180 - 78 * 3, (480, 340, 380), rh=78, delay=10, size=32, head_row=False)
    out.append(d.group('Q2 Slide', b, anim={'Y': glide(30, -200, 46, 0) + ease_in(mc.LAST - 20, 0, mc.LAST - 8, -200), 'Opacity': ease(10, 0, 16, 1) + ease(mc.LAST - 12, 1, mc.LAST - 6, 0)}))
    out += [T(d, '+ 2 ROWS · SAME COLUMNS', 'Note', None, 26, SIGNAL, label='Note', mono=True, x=-600, y=-330, anim=en(-600, -330, dy=-10, delay=52)),
            T(d, 'Joins add columns. Appends add rows.', 'Rule', 'bold', 40, INK, label='Rule', x=-600, y=-400, anim=en(-600, -400, dy=-10, delay=56))]
    return slide(d, out, '27')


def node(d, name, x, y, ic, title_s, kind, fill=CARD, delay=0, label=None, w=340, h=130):
    tcol = WHITE if fill in (NAVY, SIGNAL, INK) else INK
    return [icon(d, ic, f'{name} Icon', x - w / 2 + 52, y, 48, WHITE, None, delay + 2, well=False),
            d.solid(f'{name} Badge', 76, 76, SIGNAL if fill != SIGNAL else INK, None, x=x - w / 2 + 52, y=y, anim=en(x - w / 2 + 52, y, delay=delay + 1, scale=0.0)),
            T(d, kind, f'{name} Kind', None, 18, GLOW if tcol == WHITE else SIGNAL, 'left', None, True, x=x - w / 2 + 104, y=y + 14, anim=en(x - w / 2 + 104, y + 14, delay=delay + 2)),
            T(d, title_s, f'{name} Title', 'black', 30, tcol, 'left', label, x=x - w / 2 + 104, y=y - 32, anim=en(x - w / 2 + 104, y - 32, delay=delay + 3)),
            box(d, f'{name} Card', w, h, x, y, fill=fill, label=None, anim=en(x, y, delay=delay, scale=0.8))]


def dg_recipe(d):
    out = header(d, 'RECIPE —', 'Data in, insight out')
    nodes = [('In A', -680, 90, 'database', 'Opportunity', 'INPUT', CARD), ('In B', -680, -230, 'database', 'Account', 'INPUT', CARD),
             ('Filter', -240, 90, 'search', 'Closed Won', 'FILTER', CARD), ('Join', 200, -70, 'git-merge', 'Lookup', 'JOIN', CARD),
             ('Agg', 640, -70, 'chart-bar', 'By Region', 'AGGREGATE', CARD), ('Out', 640, -330, 'download', 'opps_won', 'OUTPUT', NAVY)]
    pos = {n: (x, y) for n, x, y, *_ in nodes}
    order = {'In A': 6, 'In B': 10, 'Filter': 18, 'Join': 30, 'Agg': 42, 'Out': 54}
    links = [('In A', 'Filter'), ('Filter', 'Join'), ('In B', 'Join'), ('Join', 'Agg'), ('Agg', 'Out')]
    for i, (a, b) in enumerate(links):
        (xa, ya), (xb, yb) = pos[a], pos[b]
        if ya == yb:
            pts = [(xa + 174, ya), (xb - 180, yb)]
        elif xa == xb:
            pts = [(xa, ya - 68), (xb, yb + 74)]
        else:
            mx = (xa + 174 + xb - 180) / 2
            pts = [(xa + 174, ya), (mx, ya), (mx, yb), (xb - 180, yb)]
        lay, _ = arrow(d, f'Link {i + 1}', pts, order[b] - 8, INK, BORDER + 1, 4, 22, 'Link Color' if i == 0 else None)
        out += lay
    for n, x, y, ic, ttl, kind, fill in nodes:
        out += node(d, n, x, y, ic, ttl, kind, fill, order[n], f'{n} Title')
    out.append(T(d, '6 NODES · RUNS NIGHTLY', 'Meta', None, 22, INK2, label='Meta', mono=True, x=-840, y=-420, anim=en(-840, -420, delay=60)))
    return slide(d, out, '28')


def dg_dataflow(d):
    """sfdcDigest → augment → computeExpression → filter → sfdcRegister, with a packet travelling the wire."""
    out = header(d, 'DATAFLOW —', 'The classic pipeline')
    steps = [('download', 'sfdcDigest', 'EXTRACT'), ('git-merge', 'augment', 'JOIN'), ('code', 'computeExpression', 'DERIVE'),
             ('search', 'filter', 'REDUCE'), ('upload', 'sfdcRegister', 'REGISTER')]
    xs = [-680 + i * 340 for i in range(len(steps))]
    y = 0
    wire = d.solid('Wire', xs[-1] - xs[0], BORDER + 1, INK, 'Wire Color', anchor=(-(xs[-1] - xs[0]) / 2, 0), x=xs[0], y=y, anim={'SX': out_keys(1.0, 6, 30)})
    out.append(wire)
    # data packet: loops left -> right on the wire
    keys, sp = [], []
    for s in range(40, mc.LAST - 30, 70):
        keys += [key(s, xs[0]), key(s + 60, xs[-1])]
        sp.append((s, s + 60))
    pkt = d.solid('Packet', 26, 26, SIGNAL, 'Packet Color', x=xs[0], y=y, anim={'X': (keys, 'linear'), 'Opacity': show(sp)})
    out.insert(0, pkt)
    for i, ((ic, nm, kind), x) in enumerate(zip(steps, xs)):
        dl = 8 + 6 * i
        out = [icon(d, ic, f'Step Icon {i + 1}', x, y + 40, 52, WHITE, None, dl + 2, well=False)] + out
        out += [d.solid(f'Step Badge {i + 1}', 110, 110, NAVY if i in (0, 4) else SIGNAL, 'Badge Color' if i == 1 else ('Endpoint Color' if i == 0 else None),
                        x=x, y=y + 40, anim=en(x, y + 40, delay=dl, scale=0.0)),
                d.solid(f'Step Border {i + 1}', 110 + 2 * BORDER, 110 + 2 * BORDER, INK, None, x=x, y=y + 40, anim=en(x, y + 40, delay=dl, scale=0.0)),
                T(d, kind, f'Kind {i + 1}', None, 20, SIGNAL, 'center', None, True, x=x, y=y - 70, anim=en(x, y - 70, dy=-10, delay=dl + 3)),
                T(d, nm, f'Node {i + 1}', None, 26, INK, 'center', f'Node {i + 1}', True, x=x, y=y - 116, anim=en(x, y - 116, dy=-10, delay=dl + 4))]
    out.append(T(d, '"action": "sfdcDigest"  →  …  →  "action": "sfdcRegister"', 'JSON', None, 24, INK2, 'center', 'JSON', True, y=-330, anim=en(0, -330, dy=-10, delay=44)))
    return slide(d, out, '29')


def dg_object_model(d):
    out = header(d, 'DATA MODEL —', 'How the objects relate')
    objs = [('Account', 0, -40, 'home', True), ('Opportunity', -600, 140, 'chart-bar', False), ('Contact', 600, 140, 'user', False), ('Case', -600, -260, 'circle-alert', False),
            ('User', 600, -260, 'users', False)]
    links = []
    rel = [('Opportunity', '1 — N'), ('Contact', '1 — N'), ('Case', '1 — N'), ('User', 'OWNER')]
    pos = {n: (x, y) for n, x, y, *_ in objs}
    for i, (n, card_) in enumerate(rel):
        (x, y), (ax, ay) = pos[n], pos['Account']
        dl = 14 + 5 * i
        links.append(line(d, f'Rel {i + 1}', ax, ay, x, y, dl, INK, BORDER, 10, 'Line Color' if i == 0 else None))
        mx, my = (ax + x) / 2, (ay + y) / 2
        out.insert(0, d.group(f'Card {i + 1}', [T(d, card_, f'Cardinality {i + 1}', None, 20, WHITE, 'center', None, True, y=-7),
                                                d.solid(f'Cardinality Box {i + 1}', 110, 36, SIGNAL, 'Cardinality Color' if i == 0 else None)],
                              x=mx, y=my, anim=en(mx, my, delay=dl + 8, scale=0.4)))
    for i, (n, x, y, ic, hub) in enumerate(objs):
        out += node(d, f'Object {i + 1}', x, y, ic, n, 'OBJECT', SIGNAL if hub else CARD, 4 + 4 * i, f'Object {i + 1}', 340, 130)
    return slide(d, out + links, '30')


# ================================================================== DASHBOARDS
def kpi(d, i, x, y, w, h, label, num, prefix, suffix, delta, up=True, delay=0):
    n = f'KPI {i}'
    size, vy = 72, y - 46
    nw = len(str(num)) * size * 0.6
    nx = x - w / 2 + 28 + (size * 0.62 if prefix else 0) + nw / 2
    out = [T(d, label, f'{n} Label', None, 20, INK2, 'left', None, True, x=x - w / 2 + 28, y=y + h / 2 - 46, anim=en(x - w / 2 + 28, y + h / 2 - 46, delay=delay + 2)),
           T(d, prefix, f'{n} Prefix', 'black', size, INK, 'right', None, x=nx - nw / 2 - 2, y=vy, anim=en(nx - nw / 2 - 2, vy, delay=delay + 3)) if prefix else None,
           d.number(0, num, f'{n} Value', SANS['black'], size, INK, publish=f'{n}', x=nx, y=vy, anim=en(nx, vy, delay=delay + 3)),
           T(d, suffix, f'{n} Suffix', 'black', size, SIGNAL, 'left', None, x=nx + nw / 2 + 4, y=vy, anim=en(nx + nw / 2 + 4, vy, delay=delay + 3)) if suffix else None,
           T(d, ('▲ ' if up else '▼ ') + delta, f'{n} Delta', None, 20, GREEN if up else RED, 'right', None, True, x=x + w / 2 - 24, y=y + h / 2 - 46, anim=en(x + w / 2 - 24, y + h / 2 - 46, delay=delay + 5)),
           box(d, f'{n} Tile', w, h, x, y, label='Tile' if i == 1 else None, anim=en(x, y, dy=-20, delay=delay))]
    return [o for o in out if o]


def bars_chart(d, name, x, y, w, h, vals, labels, delay=0, color=SIGNAL, hl=None, wid=None, value_text=None):
    """Vertical bars growing from the baseline (y = baseline, x = left edge)."""
    n = len(vals)
    gap = w / n
    bw = gap * 0.56
    out = []
    for i, (v, lb) in enumerate(zip(vals, labels)):
        bx = x + gap * (i + 0.5)
        bh = h * v
        dl = delay + 3 * i
        bar = d.solid(f'{name} Bar {i + 1}', bw, bh, color, f'{name} Color' if i == 0 else None, anchor=(0, -bh / 2), x=bx, y=y,
                      anim={'SY': out_keys(1.0, dl, 14)})
        if wid is not None:
            hlb = d.rig_wrap(f'{name} Pick {i + 1}', d.solid(f'{name} Pick Bar {i + 1}', bw, bh, INK, None, x=bx, y=y + bh / 2), wid,
                             {'Opacity': [0.0] + [1.0 if k == i else 0.0 for k in range(n)]})
            out.append(d.group(f'{name} Pick Group {i + 1}', [hlb], anim={'Opacity': ease(dl + 14, 0, dl + 18, 1) + ease(mc.LAST - 12, 1, mc.LAST - 6, 0)}))
        out.append(bar)
        out.append(T(d, lb, f'{name} Label {i + 1}', None, 20, INK2, 'center', None, True, x=bx, y=y - 34, anim=en(bx, y - 34, delay=dl)))
        if value_text:
            out.append(T(d, value_text[i], f'{name} Value {i + 1}', 'bold', 26, INK, 'center', None, x=bx, y=y + bh + 14, anim=en(bx, y + bh + 14, dy=-10, delay=dl + 10)))
    out.append(d.solid(f'{name} Baseline', w, BORDER, INK, None, x=x + w / 2, y=y, anim=en(x + w / 2, y, delay=delay)))
    for k in range(1, 4):
        out.append(d.solid(f'{name} Grid {k}', w, 1, LINE, None, x=x + w / 2, y=y + h * k / 3, anim=en(x + w / 2, y + h * k / 3, delay=delay)))
    return out


def line_chart(d, name, x, y, w, h, vals, delay=0, color=SIGNAL, step=6):
    pts = [(x + w * i / (len(vals) - 1), y + h * v) for i, v in enumerate(vals)]
    out = []
    for i, ((x0, y0), (x1, y1)) in enumerate(zip(pts, pts[1:])):
        out.append(line(d, f'{name} Segment {i + 1}', x0, y0, x1, y1, delay + step * i, color, 6, step + 1, f'{name} Color' if i == 0 else None))
    for i, (px, py) in enumerate(pts):
        out.insert(0, d.solid(f'{name} Point {i + 1}', 16, 16, INK, None, x=px, y=py, anim=en(px, py, delay=delay + step * i, scale=0.0)))
    out.append(d.solid(f'{name} Baseline', w, BORDER, INK, None, x=x + w / 2, y=y, anim=en(x + w / 2, y, delay=delay - 4)))
    for k in range(1, 4):
        out.append(d.solid(f'{name} Grid {k}', w, 1, LINE, None, x=x + w / 2, y=y + h * k / 3, anim=en(x + w / 2, y + h * k / 3, delay=delay - 4)))
    return out


def widget(d, name, title_s, x, y, w, h, delay=0, label=None):
    return [T(d, title_s, f'{name} Title', 'bold', 28, INK, 'left', label, x=x - w / 2 + 28, y=y + h / 2 - 50, anim=en(x - w / 2 + 28, y + h / 2 - 50, delay=delay + 2)),
            box(d, f'{name} Widget', w, h, x, y, label='Widget' if label == 'Bar Widget' else None, anim=en(x, y, dy=-20, delay=delay))]


def db_mockup(d):
    out = []
    # top bar
    out += [T(d, 'Sales Pipeline · FY26', 'Dashboard Title', 'black', 40, WHITE, 'left', 'Dashboard Title', x=-900, y=448, anim=en(-900, 448, dx=-20, delay=3)),
            d.solid('Top Bar', 1920, 100, INK, 'Top Bar Color', y=465, anim=en(0, 465, dy=40))]
    for i, s in enumerate(('REGION: ALL', 'FY: 2026', 'OWNER: ME')):
        out += chip(d, s, f'Filter {i + 1}', 260 + i * 220, 465, fill=NAVY, color=GLOW, size=18, delay=6 + 2 * i)
    # KPIs
    for i, (lb, num, pre, suf, dlt, up) in enumerate((('PIPELINE', 42, '$', 'M', '12%', True), ('WON', 18, '$', 'M', '8%', True), ('WIN RATE', 38, '', '%', '3 PTS', False), ('DEALS', 264, '', '', '24', True))):
        out += kpi(d, i + 1, -660 + i * 440, 290, 400, 170, lb, num, pre, suf, dlt, up, 10 + 4 * i)
    # bar chart + line chart
    out += bars_chart(d, 'Region', -880, -380, 820, 300, (0.9, 0.62, 0.48, 0.3), ('AMER', 'EMEA', 'APAC', 'LATAM'), 30)
    out += line_chart(d, 'Trend', 70, -380, 800, 300, (0.2, 0.35, 0.3, 0.52, 0.6, 0.55, 0.78, 0.92), 36)
    out += widget(d, 'Bars', 'Pipeline by region', -470, -170, 900, 520, 24, 'Bar Widget')
    out += widget(d, 'Line', 'Bookings by month', 470, -170, 900, 520, 28, 'Line Widget')
    return G(d, out + [d.solid('Canvas', 1920, 1080, PAPER, 'Canvas Color')])


def db_kpis(d):
    out = header(d, 'KPIs —', 'The four numbers that matter')
    for i, (lb, num, pre, suf, dlt, up) in enumerate((('PIPELINE', 42, '$', 'M', '12%', True), ('WON', 18, '$', 'M', '8%', True), ('WIN RATE', 38, '', '%', '3 PTS', False), ('DEALS', 264, '', '', '24', True))):
        out += kpi(d, i + 1, -630 + i * 420, -40, 380, 260, lb, num, pre, suf, dlt, up, 8 + 5 * i)
    return slide(d, out, '31')


def db_bars(d):
    wid = d.popup('Highlight Bar', ['None', 'Bar 1', 'Bar 2', 'Bar 3', 'Bar 4', 'Bar 5', 'Bar 6'], 0)
    out = header(d, 'CHART —', 'Bookings by quarter')
    out += bars_chart(d, 'Chart', -800, -380, 1600, 520, (0.42, 0.55, 0.5, 0.72, 0.86, 1.0), ('Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26'), 8,
                      wid=wid, value_text=('$2.1M', '$2.8M', '$2.5M', '$3.6M', '$4.3M', '$5.0M'))
    return slide(d, out, '32')


def db_line(d):
    out = header(d, 'TREND —', 'Pipeline over 12 months')
    vals = (0.18, 0.26, 0.22, 0.38, 0.34, 0.5, 0.46, 0.62, 0.58, 0.74, 0.82, 0.95)
    out += line_chart(d, 'Trend', -800, -360, 1600, 540, vals, 10, step=5)
    for i, m in enumerate(('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC')):
        x = -800 + 1600 * i / 11
        out.append(T(d, m, f'Month {i + 1}', None, 18, INK2, 'center', None, True, x=x, y=-400, anim=en(x, -400, delay=6)))
    out += [T(d, '+128%', 'Callout', 'black', 56, SIGNAL, 'right', 'Callout', x=800, y=230, anim=en(800, 230, delay=70, scale=0.6)),
            T(d, 'YEAR OVER YEAR', 'Callout Label', None, 20, INK2, 'right', 'Callout Label', True, x=800, y=200, anim=en(800, 200, delay=72))]
    return slide(d, out, '33')


def db_funnel(d):
    out = header(d, 'FUNNEL —', 'Where deals drop out')
    stages = [('Prospecting', 1.0, '1,240'), ('Qualification', 0.74, '918'), ('Proposal', 0.5, '620'), ('Negotiation', 0.32, '397'), ('Closed Won', 0.18, '223')]
    for i, (s, v, n) in enumerate(stages):
        y, dl, w = 150 - i * 118, 8 + 6 * i, 1300 * v
        out += [d.solid(f'Stage {i + 1}', w, 96, SIGNAL if i == len(stages) - 1 else (NAVY if i % 2 else TIDE), 'Stage Color' if i == 0 else ('Won Color' if i == len(stages) - 1 else None),
                        x=150, y=y, anim={'SX': out_keys(1.0, dl, 12), 'Opacity': ease(dl, 0, dl + 3, 1)}),
                T(d, s, f'Stage Name {i + 1}', 'bold', 34, INK, 'right', f'Stage {i + 1}', x=-560, y=y - 12, anim=en(-560, y - 12, dx=-16, delay=dl + 2)),
                T(d, n, f'Stage Count {i + 1}', None, 30, WHITE, 'center', None, True, x=150, y=y - 11, anim=en(150, y - 11, delay=dl + 8))]
    out.append(T(d, '18% OF PROSPECTS CLOSE', 'Note', None, 26, SIGNAL, 'center', 'Note', True, x=150, y=-470 + 70, anim=en(150, -400, delay=44)))
    return slide(d, out, '34')


def db_ranked(d):
    out = header(d, 'LEADERBOARD —', 'Top reps by bookings')
    reps = [('Priya N.', 1.0, '$1.42M'), ('Marco L.', 0.86, '$1.22M'), ('Aisha K.', 0.71, '$1.01M'), ('Tom B.', 0.58, '$0.82M'), ('Lena V.', 0.44, '$0.63M')]
    for i, (s, v, n) in enumerate(reps):
        y, dl = 150 - i * 112, 8 + 5 * i
        out += [T(d, f'{i + 1}', f'Rank {i + 1}', 'black', 44, SIGNAL if i == 0 else INK2, 'center', None, x=-800, y=y - 16, anim=en(-800, y - 16, delay=dl, scale=0.5)),
                T(d, s, f'Rep {i + 1}', 'bold', 38, INK, 'left', f'Rep {i + 1}', x=-740, y=y - 14, anim=en(-740, y - 14, dx=-16, delay=dl + 1)),
                d.solid(f'Rank Bar {i + 1}', 900 * v, 56, SIGNAL if i == 0 else FROST, 'Leader Color' if i == 0 else ('Bar Color' if i == 1 else None),
                        anchor=(-450 * v, 0), x=-300, y=y, anim={'SX': out_keys(1.0, dl + 2, 14)}),
                T(d, n, f'Amount {i + 1}', 'bold', 32, INK, 'left', None, x=-300 + 900 * v + 20, y=y - 12, anim=en(-300 + 900 * v + 20, y - 12, delay=dl + 14))]
    return slide(d, out, '35')


# ================================================================== SCREEN AND CAMERA (titles with drop wells: drag the clips onto them)
def framed_well(d, fn, name, label, x, y, scale, wpx, hpx, bar=None):
    """A drop well in a Blueprint frame: ink border, hard shadow, optional window bar with lights."""
    w, h = wpx * scale, hpx * scale
    out = [d.well(fn, name, label, x=x, y=y, sx=scale, sy=scale)]
    extra = 0
    if bar:
        top = y + h / 2 + 24
        out = [T(d, bar, f'{name} Bar Text', None, 18, FROST, 'center', f'{name} Bar', True, x=x, y=top - 6)] + \
              [d.solid(f'{name} Light {i + 1}', 12, 12, c, None, x=x - w / 2 + 24 + i * 22, y=top) for i, c in enumerate((SIGNAL, TIDE, GLOW))] + \
              [d.solid(f'{name} Bar', w, 48, INK, None, x=x, y=top)] + out
        extra = 48
    out += [d.solid(f'{name} Border', w + 2 * BORDER, h + extra + 2 * BORDER, INK, f'{label} Border' if label else None, x=x, y=y + extra / 2),
            d.solid(f'{name} Shadow', w + 2 * BORDER, h + extra + 2 * BORDER, INK, None, x=x + SHADOW, y=y + extra / 2 - SHADOW)]
    return out


def name_tag(d, name_s, role_s, x, y, delay=0):
    return [T(d, name_s, 'Name', 'black', 32, INK, 'left', 'Name', x=x + 18, y=y + 2, anim=en(x + 18, y + 2, dx=-14, delay=delay + 2)),
            T(d, role_s, 'Role', None, 18, SIGNAL, 'left', 'Role', True, x=x + 18, y=y - 30, anim=en(x + 18, y - 30, dx=-14, delay=delay + 3)),
            box(d, 'Name Tag', 360, 92, x + 180, y - 4, label='Name Tag', anim=en(x + 180, y - 4, dx=-20, delay=delay))]


LAYOUTS = [('Camera Right', 1), ('Camera Left', -1)]


def sc_screen_cam(d):
    """Screen recording in a window + square camera; the layout pop-up mirrors it."""
    wid = d.popup('Layout', [n for n, _ in LAYOUTS], 0)
    scr = d.group('Screen', framed_well(d, 'well_16x9.png', 'Screen', 'Screen', 0, 0, 0.72, 1920, 1080, 'crmanalytics.imswarnil.com'),
                  anim=en(0, 0, dy=-30, delay=2))
    cam = d.group('Camera', [REC(d, -150, 160)] + framed_well(d, 'well_1x1.png', 'Camera', 'Camera', 0, 0, 0.36, 1080, 1080) + name_tag(d, 'Swarnil Singhai', 'INSTRUCTOR', -200, -300, 14),
                  anim=en(0, 0, delay=8, scale=0.8))
    out = [d.rig_wrap('Camera Place', cam, wid, {'X': [700 * s for _, s in LAYOUTS], 'Y': [-60, -60]}),
           d.rig_wrap('Screen Place', scr, wid, {'X': [-230 * s for _, s in LAYOUTS], 'Y': [40, 40]})]
    return G(d, out + backdrop(d))


def REC(d, x, y):
    blink = []
    for s in range(0, mc.LAST, 30):
        blink += [key(s, 1.0), key(s + 15, 0.25)]
    return d.group('Rec', [T(d, 'REC', 'Rec Text', None, 18, INK, 'left', None, True, x=x + 20, y=y - 7),
                           d.image('dot_32.png', 'Rec Dot', color=RED, color_label='Rec Color', x=x, y=y, sx=0.6, sy=0.6, anim={'Opacity': blink})])


def sc_side_by_side(d):
    """Screen on the left, a tall camera panel on the right with name and topic."""
    out = [d.group('Screen', framed_well(d, 'well_16x9.png', 'Screen', 'Screen', -240, 20, 0.68, 1920, 1080, 'crmanalytics.imswarnil.com'), anim=en(0, 0, dx=-40, delay=2)),
           d.group('Camera', [REC(d, 590, 360)] + framed_well(d, 'well_9x16.png', 'Camera', 'Camera', 700, 30, 0.4, 1080, 1920), anim=en(0, 0, dx=40, delay=6))]
    out += name_tag(d, 'Swarnil Singhai', 'INSTRUCTOR', 520, -420, 12)
    out += [T(d, 'NOW: DATA PREP', 'Topic', None, 22, SIGNAL, 'left', 'Topic', True, x=-880, y=-430, anim=en(-880, -430, dy=-10, delay=14))]
    return G(d, out + backdrop(d))


def sc_cam_focus(d):
    """Camera full frame, the screen as an inset: for the talking part of a lesson."""
    out = [d.group('Screen Inset', framed_well(d, 'well_16x9.png', 'Screen', 'Screen', 560, 260, 0.36, 1920, 1080, 'demo'), anim=en(0, 0, dx=60, delay=8)),
           d.well('well_16x9.png', 'Camera', 'Camera', sx=1.0, sy=1.0)]
    out = name_tag(d, 'Swarnil Singhai', 'INSTRUCTOR', -880, -380, 14) + out
    return G(d, out)


def sc_screen_steps(d):
    """Screen in a window with a step rail on the left (numbers light up one by one)."""
    out = [d.group('Screen', framed_well(d, 'well_16x9.png', 'Screen', 'Screen', 230, 10, 0.74, 1920, 1080, 'Data Manager'), anim=en(0, 0, dx=40, delay=2))]
    steps = ['Open Data Manager', 'Create recipe', 'Add a join', 'Run it']
    for i, s in enumerate(steps):
        y, dl = 300 - i * 170, 10 + 14 * i
        out += [T(d, f'{i + 1:02d}', f'Rail Num {i + 1}', 'black', 40, WHITE, 'center', None, x=-850, y=y - 14, anim=en(-850, y - 14, delay=dl + 1, scale=0.5)),
                d.solid(f'Rail Box {i + 1}', 80, 80, SIGNAL, 'Rail Color' if i == 0 else None, x=-850, y=y, anim=en(-850, y, delay=dl, scale=0.0)),
                T(d, s, f'Rail Step {i + 1}', 'bold', 26, INK, 'left', f'Step {i + 1}', x=-790, y=y - 10, anim=en(-790, y - 10, dx=-12, delay=dl + 2))]
        if i:
            out.append(line(d, f'Rail Line {i}', -850, y + 170 - 40, -850, y + 40, dl - 4, INK, BORDER, 6))
    return G(d, out + backdrop(d))


# ---- effects for the camera clip itself
CORNERS = [('Bottom Right', 640, -300), ('Bottom Left', -640, -300), ('Top Right', 640, 300), ('Top Left', -640, 300)]
SIZES = [('Medium', 1.0), ('Small', 0.75), ('Large', 1.3)]


def ef_cam_square(d):
    """Crops the camera clip to a square, frames it Blueprint-style with a name tag; corner + size pop-ups."""
    wc = d.popup('Corner', [n for n, _, _ in CORNERS], 0)
    ws = d.popup('Size', [n for n, _ in SIZES], 0)
    s = 0.36
    side = 1080 * s
    cam = d.drop_zone('Effect Source', sx=s, sy=s, crop=(420, 420, 0, 0), pub=[('./1/100/101', 'Framing')])
    box_ = [T(d, 'Swarnil Singhai', 'Name', 'black', 26, INK, 'left', 'Name', x=-side / 2 + 16, y=-side / 2 - 44),
            T(d, 'INSTRUCTOR', 'Role', None, 16, SIGNAL, 'left', 'Role', True, x=-side / 2 + 16, y=-side / 2 - 70),
            d.solid('Tag', side + 2 * BORDER, 84, CARD, 'Tag Color', y=-side / 2 - 42 - BORDER),
            cam,
            d.solid('Border', side + 2 * BORDER, side + 84 + 3 * BORDER, INK, 'Border Color', y=-42),
            d.solid('Shadow', side + 2 * BORDER, side + 84 + 3 * BORDER, INK, None, x=SHADOW, y=-42 - SHADOW, pub=[('./1/200/202', 'Shadow')])]
    g = d.rig_wrap('Size', d.group('Frame', box_), ws, {'SX': [v for _, v in SIZES], 'SY': [v for _, v in SIZES]})
    return d.group('Effect', [d.rig_wrap('Corner', g, wc, {'X': [x for _, x, _ in CORNERS], 'Y': [y for _, _, y in CORNERS]})])


def ef_screen_cam_space(d):
    """For the screen recording: shrinks it into a window top-left and leaves a framed slot for the camera."""
    s = 0.7
    w, h = 1920 * s, 1080 * s
    x, y = -230, 100
    clip = d.drop_zone('Effect Source', x=x, y=y, sx=s, sy=s, pub=[('./1/100/105', 'Screen Size'), ('./1/100/101', 'Screen Position')])
    top = y + h / 2 + 24
    bar = [T(d, 'crmanalytics.imswarnil.com', 'URL', None, 18, FROST, 'center', 'URL', True, x=x, y=top - 6)] + \
          [d.solid(f'Light {i + 1}', 12, 12, c, None, x=x - w / 2 + 24 + i * 22, y=top) for i, c in enumerate((SIGNAL, TIDE, GLOW))] + \
          [d.solid('Bar', w, 48, INK, 'Bar Color', x=x, y=top)]
    frame = [d.solid('Border', w + 2 * BORDER, h + 48 + 2 * BORDER, INK, 'Border Color', x=x, y=y + 24),
             d.solid('Shadow', w + 2 * BORDER, h + 48 + 2 * BORDER, INK, None, x=x + SHADOW, y=y + 24 - SHADOW)]
    slot = [T(d, 'CAMERA', 'Slot Label', None, 18, XGRAY, 'center', 'Slot Label', True, x=660, y=-310),
            d.image('slot_outline_640x360.png', 'Camera Slot', color=XGRAY, color_label='Slot Color', x=660, y=-300, sx=0.62, sy=1.1)]
    return d.group('Effect', bar + [clip] + frame + slot + backdrop(d))


# ================================================================== TEXT ANIMATIONS (overlay titles)
def ta_words(d):
    words = ['Filter', 'early,', 'join', 'late,', 'ship', 'fast.']
    size, gap = 96, 30
    out, x = [], -(sum(tw(w_, size, black=True) for w_ in words) + gap * (len(words) - 1)) / 2
    for i, w_ in enumerate(words):
        f = 4 + 5 * i
        col = SIGNAL if i in (1, 3, 5) else INK
        out.append(T(d, w_, f'Word {i + 1}', 'black', size, col, 'left', f'Word {i + 1}', x=x, y=-30,
                     anim={'Y': spring(f, -90, f + 10, -30, 0.1) + ease_in(mc.LAST - 14 - (5 - i), -30, mc.LAST - (5 - i) * 2, -70),
                           'Opacity': ease(f, 0, f + 4, 1) + ease(mc.LAST - 10 - (5 - i) * 2, 1, mc.LAST - (5 - i) * 2, 0)}))
        x += tw(w_, size, black=True) + gap
    return G(d, out)


def ta_typewriter(d):
    lines, f = [], 6
    for i, s in enumerate(('> load "opportunities"', '> filter by StageName == "Won"', '> ready.')):
        lay, f = typed(d, s, f'Line {i + 1}', 40, WHITE if i < 2 else GLOW, -700, 80 - i * 80, f, cover=NAVY, caret=GLOW, label=f'Line {i + 1}', blink=(i == 2), fpc=0.8)
        lines += lay
        f += 6
    return G(d, lines + [box(d, 'Console', 1500, 340, 0, 30, fill=NAVY, shadow=SHADOW, label='Console', anim=en(0, 30, dy=-30))])


def ta_highlight(d):
    """A sentence; a marker sweeps behind one word and turns it white."""
    pre, word, post = 'Recipes run on the ', 'full dataset', ', not the preview.'
    size, y = 72, -20
    x0 = -tw(pre + word + post, size) / 2
    xw = x0 + tw(pre, size)
    ww = tw(word, size) + 30
    lit = {'Opacity': show([(18, mc.LAST - 8)])}
    out = [T(d, word, 'Word Lit', 'black', size, WHITE, 'left', None, x=xw, y=y, anim=lit),
           d.solid('Marker', ww, size * 1.2, SIGNAL, 'Marker Color', anchor=(-ww / 2, 0), x=xw - 15, y=y + size * 0.32, anim={'SX': out_keys(1.0, 14, 10)}),
           T(d, pre, 'Before', 'bold', size, INK, 'left', 'Before', x=x0, y=y, anim=en(x0, y, dy=-20)),
           T(d, word, 'Word', 'black', size, INK, 'left', 'Highlight Word', x=xw, y=y, anim=en(xw, y, dy=-20, delay=1)),
           T(d, post, 'After', 'bold', size, INK, 'left', 'After', x=xw + ww, y=y, anim=en(xw + ww, y, dy=-20, delay=2))]
    return G(d, out)


def ta_strike(d):
    size = 96
    old, new = 'Spreadsheets', 'Dashboards'
    w = tw(old, size, black=True) + 20
    out = [T(d, 'STOP USING —', 'Eyebrow', None, 28, INK2, 'left', 'Eyebrow', True, x=-600, y=130, anim=en(-600, 130, dx=-20)),
           T(d, old, 'Old', 'black', size, INK2, 'left', 'Old Word', x=-600, y=0, anim={'Opacity': ease(2, 0, 6, 1) + ease(40, 1, 50, 0.35) + ease(mc.LAST - 10, 0.35, mc.LAST - 4, 0)}),
           d.solid('Strike', w, 10, RED, 'Strike Color', anchor=(-w / 2, 0), x=-610, y=size * 0.3, anim={'SX': out_keys(1.0, 24, 10)}),
           T(d, '→', 'Arrow', 'black', size, SIGNAL, 'left', None, x=-600 + w + 30, y=0, anim=en(-600 + w + 30, 0, dx=-30, delay=40))]
    out += rtext(d, new, 'New', 'black', size, SIGNAL, -600 + w + 150, 0, 46, bar=INK, label='New Word', w=tw(new, size, black=True) + 30)
    return G(d, out)


def ta_big_statement(d):
    out = [T(d, 'RULE OF THUMB —', 'Eyebrow', None, 30, SIGNAL, 'center', 'Eyebrow', True, y=170, anim=en(0, 170, dy=-20))]
    out.append(T(d, 'Less data.', 'Line 1', 'black', 180, INK, 'center', 'Line 1', y=10,
                 anim={'SX': spring(4, 1.4, 16, 1.0, 0.06) + ease_in(mc.LAST - 12, 1.0, mc.LAST - 4, 0.9), 'SY': spring(4, 1.4, 16, 1.0, 0.06) + ease_in(mc.LAST - 12, 1.0, mc.LAST - 4, 0.9),
                       'Opacity': ease(4, 0, 8, 1) + ease(mc.LAST - 10, 1, mc.LAST - 4, 0)}))
    out.append(T(d, 'Faster answers.', 'Line 2', 'black', 180, SIGNAL, 'center', 'Line 2', y=-170,
                 anim={'SX': spring(16, 1.4, 28, 1.0, 0.06) + ease_in(mc.LAST - 12, 1.0, mc.LAST - 4, 0.9), 'SY': spring(16, 1.4, 28, 1.0, 0.06) + ease_in(mc.LAST - 12, 1.0, mc.LAST - 4, 0.9),
                       'Opacity': ease(16, 0, 20, 1) + ease(mc.LAST - 10, 1, mc.LAST - 4, 0)}))
    out.append(d.image('bp_ruler.png', 'Ruler', color=INK, color_label='Ruler Color', y=-230, opacity=0.6, **drawx(-500, 1000, 26, full=0.52, local_w=1920)))
    return G(d, out)


def ta_counter(d):
    out = [d.number(0, 10000, 'Count', SANS['black'], 220, INK, publish='Count', y=-20, anim=en(0, -20, dy=-30)),
           T(d, 'ROWS PROCESSED IN 0.4 SECONDS', 'Caption', None, 32, SIGNAL, 'center', 'Caption', True, y=-120, anim=en(0, -120, dy=-14, delay=6)),
           d.solid('Rule', 900, BORDER, INK, 'Rule Color', y=-70, **drawx(-450, 900, 4))]
    return G(d, out)


def ta_question(d):
    out = [T(d, '?', 'Mark', 'black', 300, SIGNAL, 'left', 'Mark', x=-860, y=-100, anim=en(-860, -100, scale=0.3, dur=12))]
    for i, s in enumerate(('What happens when', 'two datasets disagree?')):
        out.append(T(d, s, f'Line {i + 1}', 'black', 92, INK, 'left', f'Line {i + 1}', x=-640, y=40 - i * 110, anim=en(-640, 40 - i * 110, dx=-30, delay=6 + 5 * i)))
    out.append(T(d, 'PAUSE AND THINK', 'Hint', None, 26, INK2, 'left', 'Hint', True, x=-636, y=-170, anim=en(-636, -170, dy=-10, delay=18)))
    return G(d, out)


def ta_keywords(d):
    words = ['LOAD', 'FILTER', 'GROUP', 'PROJECT']
    out = []
    for i, w_ in enumerate(words):
        y, f = 210 - i * 140, 4 + 8 * i
        out.append(T(d, w_, f'Keyword {i + 1}', 'black', 120, SIGNAL if i == len(words) - 1 else INK, 'left', f'Keyword {i + 1}', x=-500, y=y - 40,
                     anim={'X': glide(f, -560, f + 10, -500) + ease_in(mc.LAST - 14, -500, mc.LAST - 4, -440), 'Opacity': ease(f, 0, f + 4, 1) + ease(mc.LAST - 10, 1, mc.LAST - 4, 0)}))
        out.append(T(d, f'{i + 1:02d}', f'Index {i + 1}', None, 30, INK2, 'right', None, True, x=-560, y=y - 8, anim=en(-560, y - 8, delay=f + 2)))
    out.append(line(d, 'Spine', -530, 260, -530, -260, 2, SIGNAL, 4, 24, 'Spine Color'))
    return G(d, out)


# ================================================================== ARROWS AND ELEMENTS (overlay titles; Position, Size and Rotation in the Inspector)
def AG(d, children):
    return d.group('Title', children, pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size'), ('./1/100/102', 'Rotation'), ('./1/200/202', 'Opacity')])


def el_arrow(d):
    lay, _ = arrow(d, 'Arrow', [(-300, 0), (300, 0)], 0, SIGNAL, 8, 12, 46, 'Arrow Color')
    return AG(d, lay)


def el_arrow_label(d):
    lay, _ = arrow(d, 'Arrow', [(-120, 0), (300, 0)], 6, SIGNAL, 8, 10, 44, 'Arrow Color')
    lab = [T(d, 'Click here', 'Label', 'bold', 34, INK, 'center', 'Label', x=-290, y=-12, anim=en(-290, -12, delay=2)),
           box(d, 'Label Box', 320, 80, -290, 0, label='Label', anim=en(-290, 0, delay=0, scale=0.7))]
    return AG(d, lab + lay)


def el_elbow(d):
    lay, _ = arrow(d, 'Arrow', [(-300, 160), (200, 160), (200, -160)], 0, SIGNAL, 8, 9, 46, 'Arrow Color')
    return AG(d, lay)


def el_curved(d):
    r, cx, cy = 300, 0, -150
    pts = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in range(180, -1, -12)]
    lay, _ = arrow(d, 'Arrow', pts, 0, SIGNAL, 8, 2, 44, 'Arrow Color')
    return AG(d, lay)


def el_double(d):
    a, _ = arrow(d, 'Right', [(0, 0), (320, 0)], 0, SIGNAL, 8, 10, 44, 'Arrow Color')
    b, _ = arrow(d, 'Left', [(0, 0), (-320, 0)], 0, SIGNAL, 8, 10, 44)
    return AG(d, a + b)


def el_circle(d):
    s = 1.6
    ring = d.image('ring_240.png', 'Ring', color=SIGNAL, color_label='Ring Color', sx=s, sy=s, anim=en(0, 0, scale=1.6, sx=s, sy=s, dur=10))
    ring2 = d.image('ring_240.png', 'Ring Echo', color=SIGNAL, sx=s, sy=s, anim={'SX': glide(10, s, 30, s * 1.4), 'SY': glide(10, s, 30, s * 1.4), 'Opacity': [key(0, 0), key(9, 0), key(10, 0.8), key(30, 0)]})
    return AG(d, [ring, ring2])


def el_box(d):
    w, h = 600, 300
    out = [d.solid(f'Edge {n}', ew, eh, SIGNAL, 'Box Color' if n == 'Top' else None, anchor=anc, x=ax, y=ay, anim={k: out_keys(1.0, dl, 8)})
           for n, ew, eh, anc, ax, ay, k, dl in (('Top', w, 8, (-w / 2, 0), -w / 2, h / 2, 'SX', 0), ('Right', 8, h, (0, h / 2), w / 2, h / 2, 'SY', 6),
                                                 ('Bottom', w, 8, (w / 2, 0), w / 2, -h / 2, 'SX', 12), ('Left', 8, h, (0, -h / 2), -w / 2, -h / 2, 'SY', 18))]
    out.append(d.solid('Tint', w, h, SIGNAL, None, opacity=0.08, anim={'Opacity': ease(20, 0, 26, 0.08) + ease(mc.LAST - 10, 0.08, mc.LAST - 4, 0)}, pub=[('./1/200/202', 'Tint')]))
    out.insert(0, d.group('Label', [T(d, 'LOOK HERE', 'Label Text', None, 22, WHITE, 'center', 'Label', True, y=-8),
                                    d.solid('Label Plate', 200, 40, SIGNAL, None)], x=-w / 2 + 100, y=h / 2 + 24, anim=en(-w / 2 + 100, h / 2 + 24, dy=-12, delay=24)))
    return AG(d, out)


def el_underline(d):
    return AG(d, [d.solid('Underline', 700, 14, SIGNAL, 'Underline Color', anchor=(-350, 0), x=-350, anim={'SX': out_keys(1.0, 0, 10)}),
                  d.solid('Underline Shadow', 700, 14, INK, None, anchor=(-350, 0), x=-345, y=-5, anim={'SX': out_keys(1.0, 2, 10)})])


def el_bracket(d):
    h = 420
    out = [line(d, 'Spine', 0, h / 2, 0, -h / 2, 4, SIGNAL, 8, 12, 'Bracket Color'),
           line(d, 'Top Tick', 0, h / 2, -50, h / 2, 0, SIGNAL, 8, 6),
           line(d, 'Bottom Tick', 0, -h / 2, -50, -h / 2, 0, SIGNAL, 8, 6),
           line(d, 'Middle Tick', 0, 0, 40, 0, 14, SIGNAL, 8, 6),
           T(d, 'THESE 3 FIELDS', 'Label', None, 28, INK, 'left', 'Label', True, x=70, y=-10, anim=en(70, -10, dx=-14, delay=18))]
    return AG(d, out)


def el_steps(d):
    """Three numbered badges, each with its own Position in the Inspector."""
    out = []
    for i, (x, y) in enumerate(((-400, 200), (0, 0), (400, -200))):
        g = d.group(f'Badge {i + 1}', [T(d, f'{i + 1}', f'Number {i + 1}', 'black', 44, WHITE, 'center', None, y=-16),
                                       d.solid(f'Square {i + 1}', 80, 80, SIGNAL, 'Badge Color' if i == 0 else None),
                                       d.solid(f'Shadow {i + 1}', 80, 80, INK, None, x=6, y=-6)], x=x, y=y, anim=en(x, y, delay=8 * i, scale=0.0),
                    pub=[('./1/100/101', f'Badge {i + 1} Position')])
        out.append(g)
    return d.group('Title', out, pub=[('./1/100/105', 'Size'), ('./1/200/202', 'Opacity')])


MARKS = [('Check', 'check', GREEN), ('Cross', 'x', RED), ('Warning', 'circle-alert', '#E0A100'), ('Info', 'circle-info', SIGNAL)]


def el_stamp(d):
    wid = d.popup('Mark', [n for n, _, _ in MARKS], 0)
    out = []
    for i, (n, ic, col) in enumerate(MARKS):
        g = d.group(f'{n} Mark', [icon(d, ic, f'{n} Icon', 0, 0, 100, WHITE, None, 2, well=False),
                                  d.solid(f'{n} Square', 160, 160, col, f'{n} Color')])
        out.append(d.rig_wrap(f'{n} Rig', g, wid, {'Opacity': [1.0 if k == i else 0.0 for k in range(len(MARKS))]}))
    stamp = d.group('Stamp', out + [d.solid('Shadow', 160, 160, INK, None, x=8, y=-8)], anim=en(0, 0, scale=1.6, dur=8))
    return AG(d, [stamp])


def el_data_line(d):
    """Dotted wire with a data packet travelling along it, looping."""
    n, gap = 14, 50
    dots = [d.solid(f'Dot {i + 1}', 14, 14, INK, 'Dot Color' if i == 0 else None, x=-350 + i * gap, anim=en(-350 + i * gap, 0, delay=i, scale=0.0)) for i in range(n)]
    keys, sp = [], []
    for s in range(14, mc.LAST - 30, 45):
        keys += [key(s, -350), key(s + 40, -350 + (n - 1) * gap)]
        sp.append((s, s + 40))
    pkt = d.solid('Packet', 30, 30, SIGNAL, 'Packet Color', x=-350, anim={'X': (keys, 'linear'), 'Opacity': show(sp)})
    return AG(d, [pkt] + dots)


def el_tag(d):
    out = [T(d, 'MEASURE', 'Tag', None, 26, WHITE, 'left', 'Tag', True, x=40, y=-9, anim=en(40, -9, dx=-14, delay=8)),
           d.solid('Tag Plate', 190, 52, SIGNAL, 'Tag Color', anchor=(-95, 0), x=20, anim={'SX': out_keys(1.0, 6, 8)}),
           line(d, 'Leader', -200, -120, 20, 0, 0, INK, 4, 8, 'Line Color'),
           d.solid('Dot', 20, 20, INK, None, x=-200, y=-120, anim=en(-200, -120, scale=0.0))]
    return AG(d, out)


def el_plus(d):
    out = []
    for i, (s, x) in enumerate((('A', -460), ('+', -230), ('B', 0), ('=', 230), ('AB', 460))):
        op = s in '+='
        out.append(T(d, s, f'Part {i + 1}', 'black', 110 if not op else 90, SIGNAL if op else INK, 'center', f'Part {i + 1}', x=x, y=-36,
                     anim=en(x, -36, delay=6 * i, scale=0.4)))
        if not op:
            out.append(box(d, f'Part Box {i + 1}', 180 if s != 'AB' else 240, 160, x, 0, label='Box' if i == 0 else None, anim=en(x, 0, delay=6 * i, scale=0.6)))
    return AG(d, out)


# ================================================================== registry
INTROS3 = {'Lesson Intro': lesson_intro(), 'Lesson Intro Navy': lesson_intro(dark=True), 'Hook Question': hook_intro}
OUTROS = {'Thanks for Watching': outro_thanks(), 'Thanks for Watching Navy': outro_thanks(dark=True), 'Next Lesson': outro_next, 'Outro Minimal': outro_minimal}
GROUPS = [
    ('Explain', {'Definition': ex_definition, 'Worked Example': ex_example, 'Do and Dont': ex_do_dont, 'Glossary': ex_glossary,
                 'Analogy': ex_analogy, 'Concept Map': ex_concept_map}, 60),
    ('Data and Tables', {'Data Table': dt_table, 'Sample Data Builder': dt_builder, 'Dataset Schema': dt_schema, 'Filter Rows': dt_filter,
                         'Group By': dt_group_by}, 90),
    ('Diagrams', {'Join Venn': dg_venn, 'Join Tables': dg_join_tables, 'Append Rows': dg_append, 'Recipe Graph': dg_recipe,
                  'Dataflow Pipeline': dg_dataflow, 'Object Model': dg_object_model}, 80),
    ('Dashboards', {'Dashboard Mockup': db_mockup, 'KPI Tiles': db_kpis, 'Bar Chart': db_bars, 'Line Chart': db_line,
                    'Funnel': db_funnel, 'Leaderboard': db_ranked}, 70),
    ('Screen and Camera', {'Screen and Camera': sc_screen_cam, 'Side by Side': sc_side_by_side, 'Camera Focus': sc_cam_focus,
                           'Screen with Steps': sc_screen_steps}, 30),
]
OVERLAYS = [
    ('Text Animations', {'Word by Word': ta_words, 'Typewriter': ta_typewriter, 'Highlight Word': ta_highlight, 'Strike and Replace': ta_strike,
                         'Big Statement': ta_big_statement, 'Counter': ta_counter, 'Question': ta_question, 'Keyword Stack': ta_keywords}),
    ('Arrows and Elements', {'Arrow': el_arrow, 'Arrow with Label': el_arrow_label, 'Elbow Arrow': el_elbow, 'Curved Arrow': el_curved,
                             'Double Arrow': el_double, 'Circle Highlight': el_circle, 'Draw Box': el_box, 'Underline': el_underline,
                             'Bracket': el_bracket, 'Step Badges': el_steps, 'Status Stamp': el_stamp, 'Data Line': el_data_line,
                             'Field Tag': el_tag, 'Equation': el_plus}),
]
CAM_FX = {'Camera Square': ef_cam_square, 'Screen with Camera Space': ef_screen_cam_space}


def build_all(only=None):
    def want(name, folder):
        return not only or only in name or only in folder
    for folder, items in (('Intros', INTROS3), ('Outros', OUTROS)):
        for name, fn in items.items():
            if want(name, folder):
                d = doc('title', name, folder, 240, (200, 232), 190)
                d.write(fn(d), thumb_bp(name, folder[:-1]))
    for folder, items, build in GROUPS:
        for name, fn in items.items():
            if want(name, folder):
                d = doc('title', name, folder, 300, (build, 276), 150)
                d.write(fn(d), thumb_bp(name, folder))
    for folder, items in OVERLAYS:
        for name, fn in items.items():
            if want(name, folder):
                d = doc('title', name, folder, 300, (30, 276), 150)
                d.write(fn(d), thumb_bp(name, folder))
    for name, fn in CAM_FX.items():
        if want(name, 'Screen Capture'):
            d = doc('effect', name, 'Screen Capture', 300, poster=30, loop=True)
            d.write(fn(d), thumb_bp(name, 'Screen Capture'))
    mc.LAST = 299


if __name__ == '__main__':
    build_all(sys.argv[1] if len(sys.argv) > 1 else None)
