"""make_titles.py — Titles: Lower Thirds · Titles · Chapters & Lessons · Callouts · HUD Markers · Social · Icons

    python make_titles.py            -> ../Motion Templates/Titles.localized/<folder>/<name>/
"""
import os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozml import *

DUR, LAST = 300, 299
B = DUR_BASE                       # 11 frames = 360 ms (--im-duration-base)
BUILD = (36, DUR - 36)             # build in ends / build out starts (FCP stretches the middle)
POSTER = 150
LX, LY = -840, -330                # lower-third anchor (left edge, baseline) inside the title-safe area


def enter(x=0, y=0, dx=0, dy=0, delay=0, dur=B, fade=True, exit=True, scale=None, spring_=False, sx=1.0, sy=1.0):
    """Entrance (and mirrored exit) keys for a layer sitting at x, y with scale sx, sy: travel from (x+dx, y+dy), grow from scale*sx."""
    a = {}
    mk = spring if spring_ else glide
    if dx:
        a['X'] = mk(delay, x + dx, delay + dur, x) + (ease_in(LAST - dur - delay, x, LAST - delay, x + dx) if exit else [])
    if dy:
        a['Y'] = mk(delay, y + dy, delay + dur, y) + (ease_in(LAST - dur - delay, y, LAST - delay, y + dy) if exit else [])
    if fade:
        a['Opacity'] = ease(delay, 0, delay + min(dur, 8), 1) + (ease(LAST - min(dur, 8) - delay, 1, LAST - delay, 0) if exit else [])
    if scale is not None:
        for k, full in (('SX', sx), ('SY', sy)):
            a[k] = mk(delay, scale * full, delay + dur, full) + (ease_in(LAST - dur - delay, full, LAST - delay, scale * full) if exit else [])
    return a


def grow_x(x_left, w, delay=0, dur=B):
    """A bar that grows from its left edge: scale X 0 -> 1 with the anchor moved to the left edge."""
    return {'anchor': (-w / 2, 0), 'x': x_left,
            'anim': {'SX': glide(delay, 0.0, delay + dur, 1.0) + ease_in(LAST - dur - delay, 1.0, LAST - delay, 0.0)}}


def new(name, folder):
    return Doc('title', name, folder, DUR, BUILD, POSTER)


def G(doc, children, pub=None, **kw):
    """The title group: Position / Size / Opacity are always published (dedup by channel)."""
    seen, pubs = set(), []
    for ch, label in list(pub or []) + [('./1/100/101', 'Position'), ('./1/100/105', 'Size'), ('./1/200/202', 'Opacity')]:
        if ch not in seen:
            seen.add(ch)
            pubs.append((ch, label))
    return doc.group('Title', children, pub=pubs, **kw)


TH = {}        # thumbnail glyphs per folder


# ---- Animation preset (pop-up on a wrapper layer around the whole title)
def _fade(dur):
    f = min(dur, 8)
    return ease(0, 0, f, 1) + ease(LAST - f, 1, LAST, 0)


def _anim(kind, dur):
    io = lambda a, b, spring_=False: (spring if spring_ else glide)(0, a, dur, b) + ease_in(LAST - dur, b, LAST, a)
    e = {'X': 0, 'Y': 0, 'SX': 1, 'SY': 1, 'Opacity': 1}
    if kind == 'up':
        e.update(Y=io(-40, 0), Opacity=_fade(dur))
    elif kind == 'left':
        e.update(X=io(-60, 0), Opacity=_fade(dur))
    elif kind == 'right':
        e.update(X=io(60, 0), Opacity=_fade(dur))
    elif kind == 'fade':
        e.update(Opacity=_fade(dur))
    elif kind == 'pop':
        e.update(SX=io(0.6, 1, True), SY=io(0.6, 1, True), Opacity=_fade(dur))
    elif kind == 'drop':
        e.update(Y=io(60, 0, True), Opacity=_fade(dur))
    return e


# 17 entries: 6 animation types × speeds (rig widgets must declare type 2 = pop-up in <affecting>; see ozml)
ANIMATIONS = [('Slide Up', 'up', B), ('Slide Up · Fast', 'up', 6), ('Slide Up · Slow', 'up', 19),
              ('Slide Left', 'left', B), ('Slide Left · Fast', 'left', 6), ('Slide Left · Slow', 'left', 19),
              ('Slide Right', 'right', B), ('Slide Right · Fast', 'right', 6), ('Slide Right · Slow', 'right', 19),
              ('Fade', 'fade', B), ('Fade · Fast', 'fade', 6), ('Fade · Slow', 'fade', 19),
              ('Pop', 'pop', B), ('Pop · Fast', 'pop', 6), ('Pop · Slow', 'pop', 19),
              ('Drop Bounce', 'drop', B + 4), ('None', 'none', B)]
assert len(ANIMATIONS) == 17


def with_animation(d, body):
    wid = d.popup('Animation', [n for n, _, _ in ANIMATIONS], 0)
    entries = [_anim(k, dur) for _, k, dur in ANIMATIONS]
    snaps = {ch: [e[ch] for e in entries] for ch in ('X', 'Y', 'SX', 'SY', 'Opacity')}
    return d.rig_group('Animation', [body], wid, snaps)


# ================================================================== LOWER THIRDS
def lt_name_bar(d):
    bar = d.image('bar_v.png', 'Accent Bar', color=ACCENT, color_label='Bar Color', x=LX, y=LY + 44, sy=0.95,
                  anim={'SY': glide(0, 0.0, B, 0.95) + ease_in(LAST - B, 0.95, LAST, 0.0)})
    name = d.text('Your Name', 'Name', 'semibold', 60, WHITE, 'left', 'Name', x=LX + 32, y=LY + 48, anim=enter(LX + 32, LY + 48, dx=-40, delay=3))
    role = d.text('What you do', 'Role', 'medium', 32, MUTED, 'left', 'Role', x=LX + 32, y=LY - 2, anim=enter(LX + 32, LY - 2, dx=-40, delay=6))
    return G(d, [name, role, bar], pub=[('./1/100/101', 'Position')])


def lt_name_line(d):
    line = d.solid('Line', 520, 4, ACCENT, 'Line Color', y=LY + 16, **grow_x(LX, 520, 2))
    name = d.text('Your Name', 'Name', 'semibold', 60, WHITE, 'left', 'Name', x=LX, y=LY + 40, anim=enter(LX, LY + 40, dy=-24, delay=0))
    role = d.text('What you do', 'Role', 'medium', 30, MUTED, 'left', 'Role', x=LX, y=LY - 26, anim=enter(LX, LY - 26, dy=18, delay=5))
    return G(d, [name, role, line], pub=[('./1/100/101', 'Position')])


def lt_name_tag(d):
    pill = d.image('pill_600x120.png', 'Tag', color=WHITE, color_label='Tag Color', x=LX + 300, y=LY + 60, sx=1.0, sy=0.85,
                   anim=enter(LX + 300, LY + 60, dx=-40, delay=0, scale=0.9, spring_=True, sx=1.0, sy=0.85),
                   pub=[('./1/100/105/1', 'Tag Width')])
    name = d.text('Your Name', 'Name', 'semibold', 48, GRAY[950], 'left', 'Name', x=LX + 36, y=LY + 44, anim=enter(LX + 36, LY + 44, dx=-40, delay=2))
    role = d.text('What you do', 'Role', 'medium', 30, WHITE, 'left', 'Role', x=LX + 4, y=LY - 30, anim=enter(LX + 4, LY - 30, dx=-40, delay=6))
    return G(d, [name, role, pill], pub=[('./1/100/101', 'Position')])


def lt_glass_card(d):
    panel = d.image('panel_1400x320.png', 'Glass', color=GRAY[900], color_label='Panel Color', x=LX + 420, y=LY + 60, sx=0.6, sy=0.5, opacity=0.72,
                    anim={'SX': glide(0, 0.0, B + 3, 0.6) + ease_in(LAST - B - 3, 0.6, LAST, 0.0)},
                    pub=[('./1/200/202', 'Panel Opacity'), ('./1/100/105/1', 'Panel Width')])
    dot = d.image('dot_32.png', 'Dot', color=ACCENT, color_label='Dot Color', x=LX + 40, y=LY + 62, anim=enter(LX + 40, LY + 62, delay=4, scale=0.0, spring_=True))
    name = d.text('Your Name', 'Name', 'semibold', 52, WHITE, 'left', 'Name', x=LX + 76, y=LY + 72, anim=enter(LX + 76, LY + 72, dx=-30, delay=4))
    role = d.text('What you do · @handle', 'Role', 'mono', 26, MUTED, 'left', 'Role', x=LX + 76, y=LY + 22, anim=enter(LX + 76, LY + 22, dx=-30, delay=8))
    return G(d, [name, role, dot, panel], pub=[('./1/100/101', 'Position')])


def lt_social_handle(d):
    pill = d.image('pill_400x96.png', 'Pill', color=ACCENT, color_label='Pill Color', x=LX + 200, y=LY + 48, sx=1.1,
                   anim=enter(LX + 200, LY + 48, dx=-40, scale=0.8, spring_=True, sx=1.1), pub=[('./1/100/105/1', 'Pill Width')])
    icon = d.image('icon_user.png', 'Icon', color=WHITE, color_label='Icon Color', x=LX + 44, y=LY + 48, sx=0.11, sy=0.11, anim=enter(LX + 44, LY + 48, delay=3, scale=0.0, spring_=True, sx=0.11, sy=0.11))
    handle = d.text('@yourhandle', 'Handle', 'mono-bold', 34, WHITE, 'left', 'Handle', x=LX + 84, y=LY + 36, anim=enter(LX + 84, LY + 36, dx=-24, delay=4))
    return G(d, [handle, icon, pill], pub=[('./1/100/101', 'Position')])


def lt_two_line(d):
    name = d.text('Your Name', 'Name', 'bold', 64, WHITE, 'left', 'Name', x=LX, y=LY + 44, anim=enter(LX, LY + 44, dy=-30))
    role = d.text('WHAT YOU DO', 'Role', 'mono', 26, ACCENT, 'left', 'Role', x=LX, y=LY - 6, anim=enter(LX, LY - 6, dy=-30, delay=4))
    return G(d, [name, role], pub=[('./1/100/101', 'Position')])


LOWER_THIRDS = {'Name Bar': lt_name_bar, 'Name Line': lt_name_line, 'Name Tag': lt_name_tag, 'Glass Card': lt_glass_card,
                'Social Handle': lt_social_handle, 'Two Line Minimal': lt_two_line}
TH['Lower Thirds'] = f'<rect x="32" y="40" width="8" height="120" fill="{ACCENT}"/><rect x="60" y="60" width="300" height="34" rx="6" fill="#fff"/><rect x="60" y="112" width="200" height="22" rx="6" fill="{MUTED}"/>'


# ================================================================== TITLES
def ti_big(d):
    txt = d.text('BIG TITLE', 'Title', 'black', 150, WHITE, 'center', 'Title', y=-40, anim=enter(0, -40, dy=-60, dur=B + 4))
    return G(d, [txt], pub=[('./1/100/101', 'Position')])


def ti_title_sub(d):
    title = d.text('Title Goes Here', 'Title', 'bold', 104, WHITE, 'center', 'Title', y=10, anim=enter(0, 10, dy=-40))
    bar = d.solid('Bar', 120, 6, ACCENT, 'Bar Color', y=-40, anim={'SX': glide(4, 0.0, B + 4, 1.0) + ease_in(LAST - B - 4, 1.0, LAST - 4, 0.0)})
    sub = d.text('A short subtitle underneath', 'Subtitle', 'medium', 40, MUTED, 'center', 'Subtitle', y=-104, anim=enter(0, -104, dy=30, delay=5))
    return G(d, [title, bar, sub], pub=[('./1/100/101', 'Position')])


def ti_statement(d):
    box = d.image('outline_1200x200.png', 'Outline', color=GRAY[600], color_label='Outline Color', y=0, anim=enter(0, 0, scale=0.9, spring_=True),
                  pub=[('./1/100/105/1', 'Outline Width')])
    txt = d.text('One clear statement.', 'Statement', 'medium', 60, WHITE, 'center', 'Text', y=-20, anim=enter(0, -20, dy=-20, delay=3))
    return G(d, [txt, box], pub=[('./1/100/101', 'Position')])


def ti_quote(d):
    mark = d.text('“', 'Mark', 'black', 260, ACCENT, 'center', 'Mark', x=-30, y=40, anim=enter(-30, 40, dy=20, dur=B + 2))
    txt = d.text('The quote goes here, kept to one line.', 'Quote', 'medium', 56, WHITE, 'center', 'Quote', y=-30, anim=enter(0, -30, dy=-20, delay=3))
    who = d.text('— WHO SAID IT', 'Author', 'mono', 26, MUTED, 'center', 'Author', y=-110, anim=enter(0, -110, dy=16, delay=8))
    return G(d, [txt, who, mark], pub=[('./1/100/101', 'Position')])


def ti_section(d):
    dot = d.image('dot_32.png', 'Dot', color=ACCENT, color_label='Dot Color', x=-840, y=412, anim=enter(-840, 412, scale=0.0, spring_=True))
    txt = d.text('SECTION LABEL', 'Label', 'mono', 30, WHITE, 'left', 'Label', x=-804, y=400, anim=enter(-804, 400, dx=-30, delay=3))
    return G(d, [txt, dot], pub=[('./1/100/101', 'Position')])


def ti_episode(d):
    panel = d.image('round_1200x240.png', 'Panel', color=GRAY[950], color_label='Panel Color', x=-300, y=-300, sx=1.1, opacity=0.9,
                    anim=enter(-300, -300, dx=-60), pub=[('./1/200/202', 'Panel Opacity'), ('./1/100/105/1', 'Panel Width')])
    ep = d.text('S01 · E04', 'Episode', 'mono-bold', 30, ACCENT, 'left', 'Episode', x=-900, y=-268, anim=enter(-900, -268, dx=-40, delay=3))
    title = d.text('Episode Title', 'Title', 'bold', 72, WHITE, 'left', 'Title', x=-900, y=-350, anim=enter(-900, -350, dx=-40, delay=6))
    return G(d, [title, ep, panel], pub=[('./1/100/101', 'Position')])


TITLES = {'Big Title': ti_big, 'Title & Subtitle': ti_title_sub, 'Statement Box': ti_statement, 'Quote': ti_quote,
          'Section Label': ti_section, 'Episode Card': ti_episode}
TH['Titles'] = '<rect x="120" y="70" width="400" height="48" rx="8" fill="#fff"/><rect x="200" y="136" width="240" height="24" rx="6" fill="' + MUTED + '"/>'


# ================================================================== CHAPTERS & LESSONS
def ch_number(d):
    num = d.text('01', 'Number', 'black', 220, ACCENT, 'left', 'Number', x=-840, y=-120, anim=enter(-840, -120, dy=-50, dur=B + 3))
    name = d.text('Chapter Name', 'Chapter', 'semibold', 64, WHITE, 'left', 'Chapter', x=-840, y=-200, anim=enter(-840, -200, dx=-40, delay=5))
    return G(d, [num, name], pub=[('./1/100/101', 'Position')])


def ch_lesson(d):
    label = d.text('LESSON 3', 'Label', 'mono', 30, ACCENT, 'left', 'Label', x=-840, y=60, anim=enter(-840, 60, dx=-30))
    title = d.text('Lesson title goes here', 'Title', 'bold', 84, WHITE, 'left', 'Title', x=-840, y=-40, anim=enter(-840, -40, dy=-30, delay=4))
    line = d.solid('Line', 1680, 2, GRAY[700], 'Line Color', y=-90, **grow_x(-840, 1680, 6))
    sub = d.text('What you will learn in this part', 'Subtitle', 'medium', 34, MUTED, 'left', 'Subtitle', x=-840, y=-140, anim=enter(-840, -140, dy=16, delay=9))
    return G(d, [label, title, line, sub], pub=[('./1/100/101', 'Position')])


def ch_step(d):
    pill = d.image('pill_400x96.png', 'Pill', color=ACCENT, color_label='Pill Color', x=-640, y=412, sx=0.9, sy=0.8, anim=enter(-640, 412, scale=0.7, spring_=True, sx=0.9, sy=0.8),
                   pub=[('./1/100/105/1', 'Pill Width')])
    txt = d.text('STEP 1 OF 5', 'Step', 'mono-bold', 30, WHITE, 'center', 'Step', x=-640, y=400, anim=enter(-640, 400, delay=3))
    what = d.text('What this step does', 'Text', 'medium', 40, WHITE, 'left', 'Text', x=-430, y=398, anim=enter(-430, 398, dx=-30, delay=6))
    return G(d, [txt, what, pill], pub=[('./1/100/101', 'Position')])


def ch_key_point(d):
    panel = d.image('round_1200x240.png', 'Panel', color=GRAY[900], color_label='Panel Color', x=-240, y=-320, opacity=0.9,
                    anim=enter(-240, -320, dy=-40), pub=[('./1/200/202', 'Panel Opacity'), ('./1/100/105/1', 'Panel Width')])
    bar = d.image('bar_v.png', 'Bar', color=ACCENT, color_label='Bar Color', x=-830, y=-320, sy=1.2, anim={'SY': glide(3, 0.0, B + 3, 1.2) + ease_in(LAST - B - 3, 1.2, LAST - 3, 0.0)})
    label = d.text('KEY POINT', 'Label', 'mono', 26, ACCENT, 'left', 'Label', x=-790, y=-280, anim=enter(-790, -280, dx=-30, delay=4))
    txt = d.text('The one thing to remember from this lesson', 'Text', 'medium', 42, WHITE, 'left', 'Text', x=-790, y=-350, anim=enter(-790, -350, dx=-30, delay=7))
    return G(d, [txt, label, bar, panel], pub=[('./1/100/101', 'Position')])


def ch_tip(d):
    txt = d.text('a quick note →', 'Note', 'hand', 84, ACCENT, 'left', 'Note', x=-400, y=200, rot=-4, anim=enter(-400, 200, dy=20, scale=0.8, spring_=True))
    return G(d, [txt], pub=[('./1/100/101', 'Position')])


def ch_timestamp(d):
    pill = d.image('pill_400x96.png', 'Pill', color=GRAY[900], color_label='Pill Color', x=-740, y=416, sx=0.72, sy=0.76, opacity=0.8,
                   anim=enter(-740, 416, dx=-30), pub=[('./1/200/202', 'Pill Opacity'), ('./1/100/105/1', 'Pill Width')])
    dot = d.image('dot_32.png', 'Dot', color=ACCENT, color_label='Dot Color', x=-854, y=416, sx=0.6, sy=0.6, anim=enter(-854, 416, delay=3, scale=0.0, spring_=True, sx=0.6, sy=0.6))
    tc = d.text('00:00', 'Time', 'mono-bold', 30, WHITE, 'left', 'Time', x=-826, y=404, anim=enter(-826, 404, dx=-20, delay=4))
    what = d.text('Timestamp label', 'Label', 'medium', 32, WHITE, 'left', 'Label', x=-580, y=404, anim=enter(-580, 404, dx=-30, delay=6))
    return G(d, [tc, what, dot, pill], pub=[('./1/100/101', 'Position')])


CHAPTERS = {'Chapter Number': ch_number, 'Lesson Title': ch_lesson, 'Step Counter': ch_step, 'Key Point': ch_key_point,
            'Hand Note': ch_tip, 'Timestamp Label': ch_timestamp}
TH['Chapters & Lessons'] = f'<text x="40" y="190" fill="{ACCENT}" font-family="Geist, Helvetica" font-weight="900" font-size="150">01</text>'


# ================================================================== CALLOUTS
def co_pointer(d):
    ptr = d.image('pointer.png', 'Pointer', color=ACCENT, color_label='Line Color', x=-200, y=-100, anim=enter(-200, -100, scale=0.6, spring_=True))
    txt = d.text('Label', 'Label', 'semibold', 40, WHITE, 'left', 'Label', x=-10, y=12, anim=enter(-10, 12, dx=-30, delay=5))
    return G(d, [txt, ptr], pub=[('./1/100/101', 'Position')])


def co_key(d):
    cap = d.image('keycap.png', 'Key', color=GRAY[100], color_label='Key Color', sx=1.6, sy=1.0, anim={**enter(0, 0, scale=0.8, spring_=True, sx=1.6, sy=1.0),
                  'SY': glide(0, 0.8, B, 1.0) + ease(40, 1.0, 44, 0.9) + ease(44, 0.9, 50, 1.0) + ease_in(LAST - B, 1.0, LAST, 0.8)},
                  pub=[('./1/100/105/1', 'Key Width')])
    txt = d.text('⌘ K', 'Key Text', 'semibold', 64, GRAY[950], 'center', 'Key', y=-22, anim=enter(0, -22, delay=2))
    return G(d, [txt, cap], pub=[('./1/100/101', 'Position')])


def co_code(d):
    pill = d.image('pill_600x120.png', 'Pill', color=GRAY[900], color_label='Pill Color', sx=0.8, sy=0.7, anim=enter(0, 0, dy=-20), pub=[('./1/100/105/1', 'Pill Width')])
    txt = d.text('npm run build', 'Code', 'mono', 36, ACCENT, 'center', 'Code', y=-12, anim=enter(0, -12, dy=-20, delay=3))
    return G(d, [txt, pill], pub=[('./1/100/101', 'Position')])


def co_highlight(d):
    pill = d.image('pill_600x120.png', 'Highlight', color=ACCENT, color_label='Highlight Color', sx=0.9, sy=0.8, **grow_x(-270, 540, 0), pub=[('./1/100/105/1', 'Highlight Width')])
    txt = d.text('highlighted words', 'Text', 'semibold', 44, WHITE, 'center', 'Text', y=-16, anim=enter(0, -16, delay=4))
    return G(d, [txt, pill], pub=[('./1/100/101', 'Position')])


def co_arrow(d):
    arrow = d.image('arrow.png', 'Arrow', color=ACCENT, color_label='Arrow Color', x=-100, y=0, sx=0.7, sy=0.7, anim=enter(-100, 0, dx=-80, dur=B + 2))
    txt = d.text('look here', 'Text', 'semibold', 40, WHITE, 'left', 'Text', x=-330, y=-14, anim=enter(-330, -14, dx=-30, delay=4))
    return G(d, [txt, arrow], pub=[('./1/100/101', 'Position')])


CALLOUTS = {'Pointer Label': co_pointer, 'Keyboard Key': co_key, 'Code Tag': co_code, 'Highlight Pill': co_highlight, 'Arrow Note': co_arrow}
TH['Callouts'] = f'<circle cx="80" cy="200" r="10" fill="{ACCENT}"/><line x1="80" y1="200" x2="200" y2="90" stroke="{ACCENT}" stroke-width="6"/><line x1="200" y1="90" x2="420" y2="90" stroke="{ACCENT}" stroke-width="6"/>'


# ================================================================== HUD MARKERS
def hud_brackets(d):
    out = []
    for i, (x, y) in enumerate(((-880, 460), (880, 460), (880, -460), (-880, -460))):
        out.append(d.image('bracket.png', f'Corner {i + 1}', color=WHITE, color_label='Bracket Color' if i == 0 else None, x=x, y=y, rot=-90 * i, sx=0.8, sy=0.8,
                           anim=enter(x, y, dx=-40 if x < 0 else 40, dy=40 if y > 0 else -40, dur=B + 2)))
    label = d.text('CAM 01 · 4K · 24 FPS', 'Label', 'mono', 26, WHITE, 'left', 'Label', x=-800, y=430, anim=enter(-800, 430, dx=-30, delay=5))
    return G(d, out + [label], pub=[('./1/100/105', 'Spread')])


def hud_focus(d):
    box = d.image('box_800x450.png', 'Box', color=WHITE, color_label='Box Color', anim=enter(0, 0, scale=1.3, dur=B + 3), pub=[('./1/100/105', 'Box Size')])
    corners = [d.image('bracket.png', f'Corner {i + 1}', color=ACCENT, color_label='Corner Color' if i == 0 else None, x=x, y=y, rot=-90 * i, sx=0.5, sy=0.5,
                       anim=enter(x, y, scale=1.6, dur=B + 3, sx=0.5, sy=0.5)) for i, (x, y) in enumerate(((-420, 245), (420, 245), (420, -245), (-420, -245)))]
    label = d.text('FOCUS · SUBJECT', 'Label', 'mono', 26, WHITE, 'left', 'Label', x=-400, y=-290, anim=enter(-400, -290, dy=-16, delay=6))
    return G(d, corners + [box, label], pub=[('./1/100/101', 'Position')])


def hud_crosshair(d):
    ch = d.image('crosshair.png', 'Crosshair', color=WHITE, color_label='Color', sx=0.7, sy=0.7,
                 anim={**enter(0, 0, scale=1.6, dur=B + 3), 'Rot': (ease(0, 0, LAST, 180), 'linear')})
    ring = d.image('ring_240.png', 'Ring', color=ACCENT, color_label='Ring Color', anim={**enter(0, 0, scale=0.2, dur=B + 3), 'Rot': (ease(0, 0, LAST, -360), 'linear')})
    label = d.text('TARGET', 'Label', 'mono', 24, WHITE, 'center', 'Label', y=-190, anim=enter(0, -190, dy=-16, delay=6))
    return G(d, [ch, ring, label], pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size')])


def hud_rec(d):
    blink = [(f, 1 if (f // 15) % 2 == 0 else 0) for f in range(0, DUR + 1, 15)]
    dot = d.image('dot_32.png', 'Dot', color=ACCENT, color_label='Dot Color', x=-840, y=440, anim={'Opacity': (blink, 'hold')})
    rec = d.text('REC', 'REC', 'mono-bold', 34, WHITE, 'left', 'REC', x=-808, y=428, anim=enter(-808, 428))
    tc = d.text('00:00:00:00', 'Timecode', 'mono', 34, WHITE, 'left', 'Timecode', x=-700, y=428, anim=enter(-700, 428, delay=3))
    bat = d.text('▮▮▮▯ 4K', 'Status', 'mono', 28, WHITE, 'right', 'Status', x=840, y=428, anim=enter(840, 428, delay=3))
    return G(d, [rec, tc, bat, dot])


def hud_readout(d):
    lines = ['LAT 28.6139 N', 'LON 77.2090 E', 'ALT 216 M']
    out = [d.text(s, f'Line {i + 1}', 'mono', 28, WHITE if i == 0 else MUTED, 'left', f'Line {i + 1}', x=-840, y=380 - 44 * i,
                  anim=enter(-840, 380 - 44 * i, dx=-20, delay=4 * i)) for i, s in enumerate(lines)]
    bar = d.image('bar_v.png', 'Bar', color=ACCENT, color_label='Bar Color', x=-860, y=330, anim={'SY': glide(0, 0.0, B, 1.0) + ease_in(LAST - B, 1.0, LAST, 0.0)})
    return G(d, out + [bar], pub=[('./1/100/101', 'Position')])


def hud_coordinate(d):
    br = d.image('bracket.png', 'Bracket', color=ACCENT, color_label='Bracket Color', x=-20, y=20, sx=0.4, sy=0.4, anim=enter(-20, 20, scale=2.0, sx=0.4, sy=0.4))
    br2 = d.image('bracket.png', 'Bracket 2', color=ACCENT, x=200, y=-60, sx=0.4, sy=0.4, rot=180, anim=enter(200, -60, scale=2.0, sx=0.4, sy=0.4))
    txt = d.text('X 1024 · Y 512', 'Text', 'mono', 26, WHITE, 'left', 'Text', x=0, y=-30, anim=enter(0, -30, delay=4))
    return G(d, [txt, br, br2], pub=[('./1/100/101', 'Position')])


HUD = {'Corner Brackets': hud_brackets, 'Focus Box': hud_focus, 'Crosshair': hud_crosshair, 'REC Indicator': hud_rec,
       'Data Readout': hud_readout, 'Coordinate Tag': hud_coordinate}
TH['HUD Markers'] = ('<g fill="none" stroke="#fff" stroke-width="6"><path d="M40 90 v-50 h50"/><path d="M600 90 v-50 h-50"/><path d="M40 170 v50 h50"/><path d="M600 170 v50 h-50"/></g>'
                     f'<circle cx="320" cy="130" r="30" fill="none" stroke="{ACCENT}" stroke-width="5"/>')


# ================================================================== SOCIAL
def so_subscribe(d):
    pill = d.image('pill_600x120.png', 'Button', color=ACCENT, color_label='Button Color', sx=0.9, sy=0.9, anim={**enter(0, 0, scale=0.6, spring_=True, sx=0.9, sy=0.9),
                   'SX': spring(0, 0.5, B, 0.9) + ease(48, 0.9, 52, 0.84) + ease(52, 0.84, 58, 0.9) + ease_in(LAST - B, 0.9, LAST, 0.5)}, pub=[('./1/100/105/1', 'Button Width')])
    bell = d.image('icon_bell.png', 'Bell', color=WHITE, color_label='Icon Color', x=-200, y=0, sx=0.12, sy=0.12, anim={**enter(-200, 0, delay=3, scale=0.0, spring_=True, sx=0.12, sy=0.12),
                   'Rot': ease(56, 0, 60, -18) + ease(60, -18, 64, 18) + ease(64, 18, 68, -10) + ease(68, -10, 72, 0)})
    txt = d.text('SUBSCRIBE', 'Text', 'bold', 44, WHITE, 'left', 'Text', x=-150, y=-16, anim=enter(-150, -16, delay=3))
    return G(d, [txt, bell, pill], pub=[('./1/100/101', 'Position')])


def so_like_strip(d):
    items = [('icon_thumbs-up.png', 'LIKE'), ('icon_message.png', 'COMMENT'), ('icon_bell.png', 'SUBSCRIBE')]
    out = []
    for i, (fn, label) in enumerate(items):
        x = -360 + i * 360
        out.append(d.image('ring_64.png', f'Ring {i + 1}', color=GRAY[600], color_label='Ring Color' if i == 0 else None, x=x, y=20, sx=1.6, sy=1.6, anim=enter(x, 20, delay=4 * i, scale=0.0, spring_=True, sx=1.6, sy=1.6)))
        out.append(d.image(fn, f'Icon {i + 1}', color=WHITE, color_label='Icon Color' if i == 0 else None, x=x, y=20, sx=0.11, sy=0.11, anim=enter(x, 20, delay=4 * i + 2, scale=0.0, spring_=True, sx=0.11, sy=0.11)))
        out.append(d.text(label, f'Label {i + 1}', 'mono', 26, WHITE, 'center', f'Label {i + 1}', x=x, y=-70, anim=enter(x, -70, dy=-16, delay=4 * i + 4)))
    return G(d, out, pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size')])


def so_follow(d):
    pill = d.image('pill_600x120.png', 'Pill', color=GRAY[900], color_label='Pill Color', sx=0.9, sy=0.8, opacity=0.9, anim=enter(0, 0, dy=-30), pub=[('./1/100/105/1', 'Pill Width')])
    ico = d.image('icon_user.png', 'Icon', color=ACCENT, color_label='Icon Color', x=-210, y=0, sx=0.12, sy=0.12, anim=enter(-210, 0, delay=3, scale=0.0, spring_=True, sx=0.12, sy=0.12))
    txt = d.text('@yourhandle · follow', 'Text', 'mono-bold', 34, WHITE, 'left', 'Text', x=-160, y=-12, anim=enter(-160, -12, dx=-20, delay=4))
    return G(d, [txt, ico, pill], pub=[('./1/100/101', 'Position')])


def so_logo_dot(d):
    letter = d.text('S', 'Letter', 'semibold', 200, WHITE, 'center', 'Letter', x=0, y=-70, anim=enter(0, -70, dy=-30, dur=B + 3))
    dot = d.image('dot_64.png', 'Dot', color=ACCENT, color_label='Dot Color', x=92, y=78, sx=0.6, sy=0.6, anim=enter(92, 78, delay=6, scale=0.0, spring_=True, sx=0.6, sy=0.6),
                  pub=[('./1/100/101', 'Dot Position'), ('./1/100/105', 'Dot Size')])
    return G(d, [dot, letter], pub=[('./1/100/101', 'Position')])


SOCIAL = {'Subscribe Button': so_subscribe, 'Like Comment Subscribe': so_like_strip, 'Follow Handle': so_follow, 'Logo Dot': so_logo_dot}
TH['Social'] = f'<rect x="160" y="80" width="320" height="90" rx="45" fill="{ACCENT}"/><text x="320" y="142" fill="#fff" text-anchor="middle" font-family="Geist, Helvetica" font-weight="700" font-size="38">SUBSCRIBE</text>'


# ================================================================== FUNNY (meme titles)
def fu_emoji_pop(d):
    e = d.text('😂', 'Emoji', 'AppleColorEmoji', 260, WHITE, 'center', None, y=-100, anim=enter(0, -100, scale=0.0, spring_=True, dur=B + 3))
    return G(d, [e], pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size')])


def fu_emoji_rain(d):
    import random
    r = random.Random(3)
    out = []
    for i in range(14):
        x, start, speed = r.randint(-900, 900), r.randint(0, 60), r.randint(50, 90)
        fall = []
        for s in range(start, DUR, speed):
            fall += [key(s, 640, 'slope', 'slope'), key(s + speed - 1, -700, 'slope', 'slope')]
        vis = [(f, 1 if f >= start else 0) for f in range(0, DUR + 1, 2)]
        out.append(d.text(r.choice(['😂', '🔥', '💀', '👏', '❤️', '😭']), f'Emoji {i + 1}', 'AppleColorEmoji', r.randint(70, 130), WHITE, 'center', None, x=x,
                          anim={'Y': (fall, 'linear'), 'Opacity': (vis, 'hold'), 'Rot': (ease(0, 0, LAST, r.choice([-360, 360])), 'linear')}))
    return G(d, out, pub=[('./1/200/202', 'Amount')])


def fu_meme_caption(d):
    pill = d.image('round_1200x240.png', 'Box', color=BLACK, color_label='Box Color', y=-400, sx=1.2, sy=0.55, opacity=0.85, anim=enter(0, -400, dy=-40),
                   pub=[('./1/200/202', 'Box Opacity'), ('./1/100/105/1', 'Box Width')])
    txt = d.text('WHEN THE RENDER FINALLY WORKS', 'Caption', 'black', 54, WHITE, 'center', 'Caption', y=-418, anim=enter(0, -418, dy=-40, delay=2))
    return G(d, [txt, pill], pub=[('./1/100/101', 'Position')])


def fu_sticker(d):
    pill = d.image('pill_600x120.png', 'Sticker', color=ACCENT, color_label='Sticker Color', rot=-8, sx=0.8, sy=1.1, anim=enter(0, 0, scale=0.0, spring_=True, sx=0.8, sy=1.1),
                   pub=[('./1/100/105/1', 'Sticker Width')])
    txt = d.text('WOW', 'Text', 'black', 80, WHITE, 'center', 'Text', y=-28, rot=-8, anim=enter(0, -28, scale=0.0, spring_=True, delay=2))
    return G(d, [txt, pill], pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size')])


def fu_big_reaction(d):
    e = d.text('💀', 'Emoji', 'AppleColorEmoji', 180, WHITE, 'center', None, x=0, y=-60,
               anim={**enter(0, -60, scale=0.0, spring_=True), 'Rot': [key(f, 6 * (1 if (f // 6) % 2 else -1)) for f in range(0, DUR + 1, 6)]})
    txt = d.text('BRO.', 'Text', 'black', 90, WHITE, 'center', 'Text', y=-220, anim=enter(0, -220, dy=-30, delay=4))
    return G(d, [txt, e], pub=[('./1/100/101', 'Position'), ('./1/100/105', 'Size')])


FUNNY = {'Emoji Pop': fu_emoji_pop, 'Emoji Rain': fu_emoji_rain, 'Meme Caption': fu_meme_caption, 'Sticker': fu_sticker, 'Big Reaction': fu_big_reaction}
TH['Funny'] = '<text x="320" y="200" text-anchor="middle" font-size="150">😂</text>'


# ================================================================== ICONS (one title per icon, from the icon set)
def icon_title(fn):
    def build(d):
        ic = d.image(fn, 'Icon', color=WHITE, color_label='Icon Color', sx=0.5, sy=0.5, anim=enter(0, 0, scale=0.0, spring_=True, dur=B + 2, sx=0.5, sy=0.5),
                     pub=[('./1/100/105', 'Icon Size')])
        return G(d, [ic], pub=[('./1/100/101', 'Position')])
    return build


ICONS = {}
for p in sorted(glob.glob(os.path.join(MEDIA, 'icon_*.png'))):
    fn = os.path.basename(p)
    ICONS['Icon ' + fn[5:-4].replace('-', ' ').title()] = icon_title(fn)


# ================================================================== build
FOLDERS = [('Lower Thirds', LOWER_THIRDS), ('Titles', TITLES), ('Chapters & Lessons', CHAPTERS), ('Callouts', CALLOUTS),
           ('HUD Markers', HUD), ('Social', SOCIAL), ('Funny', FUNNY), ('Icons', ICONS)]


def build_all(only=None):
    for folder, items in FOLDERS:
        for name, fn in items.items():
            if only and only not in name and only not in folder:
                continue
            d = new(name, folder)
            body = with_animation(d, fn(d))
            glyph = TH.get(folder, '')
            if folder == 'Icons':
                glyph = f'<rect x="270" y="50" width="100" height="100" rx="20" fill="{GRAY[800]}"/>'
            d.write(body, thumb_svg(name, folder, glyph))


if __name__ == '__main__':
    build_all(sys.argv[1] if len(sys.argv) > 1 else None)
