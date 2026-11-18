"""make_kit.py — the CRMA Final Cut Pro kit, in the Namaste Salesforce design.

Navy #032D60 / #001A3E, signal #0176D3, bright #1B96FF, white cards, 6px
corners, Switzer type, uppercase tracked labels, quick ease-out motion.
Everything lands in one "CRMA" category in each Final Cut Pro browser.

    python3 -B active/finalcut/make_kit.py            # build every template
    python3 -B active/finalcut/make_kit.py "Key"      # only names containing "Key"
    active/finalcut/Install.command                    # copy the kit into Motion Templates

Every text, colour and the position is published, so it is edited in Final
Cut Pro's inspector — no Motion needed.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'engine'))
import ozml  # noqa: E402
from ozml import Doc, glide, ease, ease_in, spring, esc  # noqa: E402

ozml.OUT = os.path.join(ozml.KIT, 'Motion Templates')
ozml.CATEGORY = 'CRMA'

# ------------------------------------------------------------------ Namaste Salesforce tokens
NAVY, NAVY9, SIGNAL, BRIGHT, LIGHT, PALE = '#032D60', '#001A3E', '#0176D3', '#1B96FF', '#7CBEFF', '#B0D7FF'
WHITE, PAGE, INK, MUTED, LINE = '#FFFFFF', '#F4F6F8', '#181818', '#5C5A57', '#DDDBDA'
BOLD, SEMI, MED, REG, BLACK = 'Switzer-Bold', 'Switzer-Semibold', 'Switzer-Medium', 'Switzer-Regular', 'Switzer-Black'
MONO = 'Menlo-Bold'

DUR, LAST = 300, 299          # 10 s at 30 fps; build in 0–24, out 276–299
LX, LY = -820, -330           # lower-third anchor (bottom left, inside title-safe)
QUICK = 9                     # ~300 ms entrances


def enter(x=0, y=0, dx=0, dy=0, delay=0, dur=QUICK, scale=None, exit=True):
    """Ease-out entrance from (x+dx, y+dy) with a fade; mirrored exit."""
    a = {}
    if dx:
        a['X'] = glide(delay, x + dx, delay + dur, x) + (ease_in(LAST - dur, x, LAST, x + dx) if exit else [])
    if dy:
        a['Y'] = glide(delay, y + dy, delay + dur, y) + (ease_in(LAST - dur, y, LAST, y + dy) if exit else [])
    f = min(dur, 6)
    a['Opacity'] = ease(delay, 0, delay + f, 1) + (ease(LAST - f, 1, LAST, 0) if exit else [])
    if scale is not None:
        a['SX'] = spring(delay, scale, delay + dur + 3, 1.0) + (ease_in(LAST - dur, 1.0, LAST, scale) if exit else [])
        a['SY'] = spring(delay, scale, delay + dur + 3, 1.0) + (ease_in(LAST - dur, 1.0, LAST, scale) if exit else [])
    return a


def grow(x_left, w, delay=0, dur=QUICK + 3):
    """A bar drawn from its left edge."""
    return {'anchor': (-w / 2, 0), 'x': x_left, 'anim': {'SX': glide(delay, 0.0, delay + dur, 1.0) + ease_in(LAST - dur, 1.0, LAST, 0.0)}}


def T(d, s, name, font, size, color, align='left', label=None, **kw):
    return d.text(s, name, font, size, color, align, label, **kw)


def G(d, children, **kw):
    return d.group('Title', children, pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size'), ('./1/200/202', 'Opacity')], **kw)


def title_doc(name, folder):
    return Doc('title', name, folder, DUR, (24, DUR - 24), 150)


# ================================================================== LOWER THIRDS
def lt_name(d):
    bar = d.solid('Accent', 6, 120, SIGNAL, 'Accent Color', x=LX, y=LY + 40, anim=enter(LX, LY + 40, dy=-30))
    name = T(d, 'Swarnil Singhai', 'Name', BOLD, 58, WHITE, label='Name', x=LX + 28, y=LY + 58, anim=enter(LX + 28, LY + 58, dx=-30, delay=2))
    role = T(d, 'CRM ANALYTICS · SALESFORCE', 'Role', MONO, 22, LIGHT, label='Role', x=LX + 28, y=LY + 8, anim=enter(LX + 28, LY + 8, dx=-30, delay=4))
    plate = d.solid('Plate', 760, 150, NAVY9, 'Plate Color', x=LX + 370, y=LY + 40, opacity=0.86, anim=enter(LX + 370, LY + 40, dx=-30), pub=[('./1/200/202', 'Plate Opacity')])
    return G(d, [name, role, bar, plate])


def lt_topic(d):
    w = 520
    cx = LX + w / 2
    pill = d.solid('Pill', w, 64, SIGNAL, 'Pill Color', x=cx, y=LY + 20, anim=enter(cx, LY + 20, dx=-30))
    txt = T(d, 'OBJECTS · FIELDS · RELATIONSHIPS', 'Topic', MONO, 22, WHITE, 'center', 'Topic', x=cx, y=LY + 11, anim=enter(cx, LY + 11, dx=-30, delay=3))
    return G(d, [txt, pill])


def lt_source(d):
    w = 760
    cx = LX + w / 2
    card = d.solid('Card', w, 100, WHITE, 'Card Color', x=cx, y=LY + 20, anim=enter(cx, LY + 20, dy=-30))
    edge = d.solid('Edge', 6, 100, SIGNAL, 'Edge Color', x=LX + 3, y=LY + 20, anim=enter(LX + 3, LY + 20, dy=-30))
    eb = T(d, 'SOURCE', 'Label', MONO, 18, SIGNAL, label='Label', x=LX + 28, y=LY + 40, anim=enter(LX + 28, LY + 40, dy=-20, delay=3))
    tx = T(d, 'Salesforce Help · Data Sync', 'Source', MED, 32, INK, label='Source', x=LX + 28, y=LY - 2, anim=enter(LX + 28, LY - 2, dy=-20, delay=4))
    return G(d, [eb, tx, edge, card])


LOWER_THIRDS = {'Name and Role': lt_name, 'Topic Tag': lt_topic, 'Source Credit': lt_source}


# ================================================================== LESSON CARDS (full screen)
def bg_navy(d):
    return d.solid('Background', 1920, 1080, NAVY9, 'Background Color', anim={'Opacity': ease(0, 0, 6, 1) + ease(LAST - 6, 1, LAST, 0)})


def lc_lesson_title(d):
    eb = T(d, 'SECTION 01 · LESSON 1', 'Eyebrow', MONO, 28, LIGHT, label='Eyebrow', x=-760, y=150, anim=enter(-760, 150, dy=-24, delay=4))
    tt = T(d, 'Objects, Fields and Relationships', 'Title', BLACK, 104, WHITE, label='Title', x=-760, y=40, anim=enter(-760, 40, dy=-30, delay=6))
    sub = T(d, 'The data model behind every dashboard', 'Subtitle', MED, 44, PALE, label='Subtitle', x=-760, y=-40, anim=enter(-760, -40, dy=-24, delay=9))
    bar = d.solid('Bar', 220, 10, SIGNAL, 'Bar Color', y=-120, **grow(-760, 220, delay=12))
    top = d.solid('Top Rule', 1920, 10, SIGNAL, 'Top Rule Color', y=535)
    return G(d, [eb, tt, sub, bar, top, bg_navy(d)])


def lc_section(d):
    num = T(d, '01', 'Number', BLACK, 240, SIGNAL, label='Number', x=-760, y=40, anim=enter(-760, 40, dx=-40, delay=2))
    tt = T(d, 'Salesforce Foundations', 'Section', BOLD, 92, WHITE, label='Section', x=-420, y=90, anim=enter(-420, 90, dx=-30, delay=6))
    sub = T(d, '4 lessons · the platform under every dashboard', 'Detail', MED, 38, PALE, label='Detail', x=-420, y=20, anim=enter(-420, 20, dx=-30, delay=9))
    return G(d, [num, tt, sub, bg_navy(d)])


def lc_key_point(d):
    card = d.solid('Card', 1300, 300, WHITE, 'Card Color', anim=enter(0, 0, dy=-30, scale=0.96))
    edge = d.solid('Edge', 12, 300, SIGNAL, 'Edge Color', x=-644, anim=enter(-644, 0, dy=-30))
    eb = T(d, 'KEY POINT', 'Label', MONO, 24, SIGNAL, label='Label', x=-590, y=80, anim=enter(-590, 80, dy=-20, delay=4))
    tx = T(d, 'Every join in a recipe uses an Id, never a name.', 'Point', BOLD, 60, INK, label='Point', x=-590, y=-10, anim=enter(-590, -10, dy=-20, delay=6))
    return G(d, [eb, tx, edge, card])


def lc_definition(d):
    term = T(d, 'Master-detail', 'Term', BLACK, 84, WHITE, label='Term', x=-760, y=120, anim=enter(-760, 120, dx=-30, delay=3))
    kind = T(d, 'RELATIONSHIP', 'Kind', MONO, 26, LIGHT, label='Kind', x=-760, y=200, anim=enter(-760, 200, dx=-30, delay=2))
    rule = d.solid('Rule', 1520, 3, LIGHT, 'Rule Color', y=60, opacity=0.4, **grow(-760, 1520, delay=6))
    df = T(d, 'The child cannot exist without its parent,\ninherits its sharing, and is deleted with it.', 'Definition', MED, 50, PALE, label='Definition', x=-760, y=-30, anim=enter(-760, -30, dy=-20, delay=8))
    return G(d, [kind, term, rule, df, bg_navy(d)])


def lc_step(d):
    badge = d.solid('Badge', 120, 120, SIGNAL, 'Badge Color', x=-700, y=0, anim=enter(-700, 0, scale=0.6))
    n = T(d, '1', 'Step Number', BLACK, 72, WHITE, 'center', 'Step Number', x=-700, y=-26, anim=enter(-700, -26, scale=0.6, delay=2))
    tx = T(d, 'Open Setup → Object Manager → Opportunity', 'Step', SEMI, 56, WHITE, label='Step', x=-600, y=-20, anim=enter(-600, -20, dx=-30, delay=5))
    plate = d.solid('Plate', 1600, 200, NAVY9, 'Plate Color', opacity=0.9, anim=enter(0, 0, dy=-20))
    return G(d, [n, badge, tx, plate])


def lc_recap(d):
    eb = T(d, 'RECAP', 'Label', MONO, 28, LIGHT, label='Label', x=-760, y=260, anim=enter(-760, 260, dy=-20, delay=2))
    items = []
    for i, (s, lab) in enumerate((('Objects are tables, records are rows', 'Point 1'), ('Relationships connect them through Ids', 'Point 2'), ('Datasets, not objects, feed dashboards', 'Point 3'))):
        y = 140 - i * 130
        items.append(d.solid(f'Dot {i + 1}', 22, 22, SIGNAL, 'Dot Color' if i == 0 else None, x=-748, y=y + 18, anim=enter(-748, y + 18, scale=0.4, delay=6 + i * 4)))
        items.append(T(d, s, lab, SEMI, 58, WHITE, label=lab, x=-700, y=y, anim=enter(-700, y, dx=-30, delay=7 + i * 4)))
    return G(d, [eb, *items, bg_navy(d)])


def lc_big_number(d):
    num = T(d, '18', 'Number', BLACK, 300, WHITE, 'center', 'Number', y=0, anim=enter(0, 0, scale=0.8, delay=2))
    lab = T(d, 'CHARACTERS IN A CASE-SAFE SALESFORCE ID', 'Label', MONO, 30, LIGHT, 'center', 'Label', y=-120, anim=enter(0, -120, dy=-20, delay=6))
    return G(d, [num, lab, bg_navy(d)])


def lc_quote(d):
    mark = T(d, '“', 'Mark', BLACK, 240, SIGNAL, label='Mark Color', x=-780, y=110, anim=enter(-780, 110, scale=0.6))
    q = T(d, 'A dashboard with no decision\nattached is decoration.', 'Quote', BOLD, 72, WHITE, label='Quote', x=-660, y=60, anim=enter(-660, 60, dy=-24, delay=4))
    by = T(d, '— SWARNIL', 'Attribution', MONO, 26, LIGHT, label='Attribution', x=-660, y=-140, anim=enter(-660, -140, dy=-20, delay=8))
    return G(d, [mark, q, by, bg_navy(d)])


def lc_chapter(d):
    pill = d.solid('Pill', 420, 56, WHITE, 'Pill Color', x=-720, y=470, anim=enter(-720, 470, dy=24))
    txt = T(d, '02 · LOOKUP VS MASTER-DETAIL', 'Chapter', MONO, 20, NAVY, 'center', 'Chapter', x=-720, y=462, anim=enter(-720, 462, dy=24, delay=2))
    return G(d, [txt, pill])


def lc_end_screen(d):
    tt = T(d, 'Keep going', 'Title', BLACK, 96, WHITE, 'center', 'Title', y=330, anim=enter(0, 330, dy=-24, delay=2))
    sub = T(d, 'Next lesson and the full course at crmanalytics.imswarnil.com', 'Subtitle', MED, 36, PALE, 'center', 'Subtitle', y=260, anim=enter(0, 260, dy=-20, delay=5))
    # Two frames where YouTube's end-screen elements go (video left, subscribe right).
    left = d.solid('Video Slot', 760, 428, '#0B3B78', 'Slot Color', x=-430, y=-60, anim=enter(-430, -60, scale=0.94, delay=6))
    right = d.solid('Subscribe Slot', 300, 300, '#0B3B78', None, x=520, y=-60, anim=enter(520, -60, scale=0.94, delay=8))
    sl = T(d, 'SUBSCRIBE', 'Subscribe Label', MONO, 24, LIGHT, 'center', 'Subscribe Label', x=520, y=-250, anim=enter(520, -250, dy=-16, delay=10))
    return G(d, [tt, sub, sl, left, right, bg_navy(d)])


LESSONS = {
    'Lesson Title': lc_lesson_title, 'Section Card': lc_section, 'Key Point': lc_key_point, 'Definition': lc_definition,
    'Step': lc_step, 'Recap': lc_recap, 'Big Number': lc_big_number, 'Quote': lc_quote, 'Chapter Marker': lc_chapter, 'End Screen': lc_end_screen
}


# ================================================================== TRANSITIONS
N, MID = 45, 22
E = N - 1


def tr_doc(name):
    return Doc('transition', name, 'Transitions', N, poster=MID)


def tr_brand_wipe(d):
    """A Salesforce-blue panel sweeps across; the next clip is under it."""
    a = d.transition_zone('A', anim={'CropR': glide(0, 0, MID, 1920)})
    b = d.transition_zone('B', anim={'CropL': glide(MID - 4, 1920, E, 0)})
    panel = d.solid('Panel', 1920, 1080, SIGNAL, 'Panel Color', anim={'X': glide(0, 1920, MID, 0) + glide(MID + 2, 0, E, -1920)})
    edge = d.solid('Edge', 24, 1080, BRIGHT, 'Edge Color', anim={'X': glide(0, 960, MID, -960)})
    return d.group('Transition', [edge, panel, b, a])


def tr_slide(d):
    b = d.transition_zone('B', anim={'X': glide(0, 1920, E, 0)})
    a = d.transition_zone('A', anim={'X': glide(0, 0, E, -600), 'Opacity': ease(0, 1, E, 0.4)})
    return d.group('Transition', [b, a])


def tr_navy_dip(d):
    a = d.transition_zone('A', anim={'Opacity': ([(0, 1), (MID, 0)], 'hold')})
    b = d.transition_zone('B', anim={'Opacity': ([(0, 0), (MID, 1)], 'hold')})
    dip = d.solid('Dip', 1920, 1080, NAVY9, 'Dip Color', anim={'Opacity': ease(0, 0, MID, 1) + ease(MID, 1, E, 0)})
    return d.group('Transition', [dip, b, a])


TRANSITIONS = {'Brand Wipe': tr_brand_wipe, 'Slide': tr_slide, 'Navy Dip': tr_navy_dip}


# ================================================================== GENERATORS (backgrounds)
def gn_doc(name):
    return Doc('generator', name, 'Backgrounds', 600, poster=60)


def gn_navy(d):
    bg = d.solid('Navy', 1920, 1080, NAVY9, 'Background Color')
    top = d.solid('Top Rule', 1920, 10, SIGNAL, 'Rule Color', y=535)
    return d.group('Background', [top, bg])


def gn_light(d):
    bg = d.solid('Page', 1920, 1080, PAGE, 'Background Color')
    top = d.solid('Top Rule', 1920, 10, SIGNAL, 'Rule Color', y=535)
    return d.group('Background', [top, bg])


GENERATORS = {'Navy Background': gn_navy, 'Light Background': gn_light}


# ================================================================== thumbnails + build
def thumb(name, kind):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 -140 640 640">'
            f'<rect y="-140" width="640" height="640" fill="{NAVY9}"/><rect y="-140" width="640" height="8" fill="{SIGNAL}"/>'
            f'<rect x="32" y="40" width="10" height="26" rx="2" fill="{LIGHT}"/><rect x="48" y="28" width="10" height="38" rx="2" fill="{BRIGHT}"/><rect x="64" y="14" width="10" height="52" rx="2" fill="{WHITE}"/>'
            f'<text x="32" y="300" fill="{WHITE}" font-family="Switzer, Helvetica" font-weight="700" font-size="40">{esc(name)}</text>'
            f'<text x="32" y="336" fill="{LIGHT}" font-family="Menlo" font-size="17" letter-spacing="3">{esc(kind.upper())}</text></svg>')


def build(only=None):
    jobs = [('Lower Thirds', LOWER_THIRDS), ('Lessons', LESSONS)]
    for folder, items in jobs:
        for name, fn in items.items():
            if only and only not in name and only not in folder:
                continue
            d = title_doc(name, folder)
            d.write(fn(d), thumb(name, folder))
    for name, fn in TRANSITIONS.items():
        if not only or only in name or only == 'Transitions':
            d = tr_doc(name)
            d.write(fn(d), thumb(name, 'Transition'))
    for name, fn in GENERATORS.items():
        if not only or only in name or only == 'Backgrounds':
            d = gn_doc(name)
            d.write(fn(d), thumb(name, 'Background'))


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else None)
