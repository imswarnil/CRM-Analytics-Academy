"""make_effects.py — Effects: Frames · Zoom · Overlays · Color Looks · Funny

Each effect = the clip (Effect Source) with layers/filters on top; the useful knobs are published.

    python make_effects.py
"""
import os, sys, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozml import *

DUR = 300
LAST = DUR - 1


def new(name, folder, loop=True):
    return Doc('effect', name, folder, DUR, poster=30, loop=loop)


def jitter(seed, every, dx, dy, lo=0, hi=DUR, scale=1.0):
    r = random.Random(seed)
    fr = list(range(0, DUR + 1, every))
    on = lambda f: lo <= f <= hi
    return {'X': ([(f, round(r.uniform(-dx, dx) * scale, 1) if on(f) else 0) for f in fr], 'hold'),
            'Y': ([(f, round(r.uniform(-dy, dy) * scale, 1) if on(f) else 0) for f in fr], 'hold')}


def src(d, filters=(), **kw):
    return d.drop_zone('Effect Source', filters, **kw)


def wrap(d, layers, src_node, pub=None):
    return d.group('Effect', list(layers) + [src_node], pub=pub)


# shared filters
VIG = lambda mix=0.6, size=1.0, fall=0.8, label='Vignette': Filter('PAEVignette', 'Vignette', {'Size#1': size, 'Falloff#5': fall, 'Darken#3': 1, 'Blur Amount#2': 6, 'Mix#10001': mix}, [('10001', label)])
SAT = lambda s, label='Saturation': Filter('PAEHSVAdjust', 'Color', {'Saturation#2': s}, [('2', label)])
CONTRAST = lambda c, label='Contrast': Filter('PAEContrast', 'Contrast', {'Contrast#1': c, 'Pivot#2': 0.45}, [('1', label)])
GAMMA = lambda g, label='Brightness': Filter('PAEGamma', 'Lift', {'Gamma#1': g}, [('1', label)])
TINT = lambda hexc, i, label='Tint': Filter('PAETint', label, {**{f'Color#1/{c}#{n}': v for (c, n), v in zip((('Red', 1), ('Green', 2), ('Blue', 3)), hex_rgb(hexc))}, 'Intensity#2': i},
                                            [('1', f'{label} Color'), ('2', f'{label} Amount')])
NOISE = lambda amt, mix, label='Grain': Filter('PAEAddNoise', 'Noise', {'Amount#1': amt, 'Monochrome#3': 1, 'Autoanimate#5': 1, 'Mix#10001': mix}, [('10001', label)])
BLUR = lambda amt, label='Blur': Filter('PAEGaussianBlur', 'Blur', {'Amount#1': amt, 'Crop#4': 0}, [('1', label)])
SHARP = lambda amt: Filter('PAESharpen', 'Sharpen', {'Amount#2': amt}, [('2', 'Sharpen')])


# ================================================================== FRAMES
def fr_browser(d):
    clip = src(d, sx=0.75, sy=0.75, y=-36, pub=[('./1/100/105', 'Picture Size'), ('./1/100/101', 'Picture Position')])
    cover = d.image('browser_cover.png', 'Backdrop', color=GRAY[950], color_label='Backdrop Color')
    chrome = d.image('browser_chrome.png', 'Window Bar', color=GRAY[800], color_label='Window Color')
    dots = d.image('browser_dots.png', 'Window Lights', pub=[('./1/200/202', 'Lights')])
    return wrap(d, [dots, chrome, cover], clip)


def fr_phone(d):
    clip = src(d, sx=0.88, sy=0.88, pub=[('./1/100/105', 'Picture Size'), ('./1/100/101', 'Picture Position')])
    cover = d.image('phone_cover.png', 'Backdrop', color=GRAY[950], color_label='Backdrop Color')
    bezel = d.image('phone_bezel.png', 'Bezel', color=GRAY[800], color_label='Bezel Color')
    return wrap(d, [bezel, cover], clip)


def fr_card(d):
    clip = src(d, sx=0.9, sy=0.9, pub=[('./1/100/105', 'Picture Size'), ('./1/100/101', 'Picture Position')])
    cover = d.image('card_cover.png', 'Backdrop', color=GRAY[950], color_label='Backdrop Color')
    return wrap(d, [cover], clip)


def fr_letterbox(d):
    clip = src(d)
    top = d.solid('Top Bar', 1920, 132, BLACK, 'Bar Color', y=474, pub=[('./1/100/105/2', 'Bar Height')])
    bot = d.solid('Bottom Bar', 1920, 132, BLACK, None, y=-474)
    return wrap(d, [top, bot], clip)


def fr_vertical_pad(d):
    """Blurred, enlarged copy of the clip behind the clip (9:16 pads, 'podcast' look)."""
    back = src(d, [BLUR(60, 'Background Blur'), GAMMA(0.7, 'Background Brightness')], sx=2.2, sy=2.2, pub=[('./1/100/105', 'Background Size')])
    front = src(d, pub=[('./1/100/105', 'Picture Size'), ('./1/100/101', 'Picture Position')])
    return d.group('Effect', [front, back])


FRAMES = {'Browser Window': fr_browser, 'Phone Frame': fr_phone, 'Rounded Card': fr_card, 'Letterbox Cinema': fr_letterbox, 'Blurred Background Pad': fr_vertical_pad}


# ================================================================== ZOOM (on the clip itself) — Amount preset + Zoom Center
AMOUNT = [('Normal', 1.0), ('Subtle', 0.5), ('Big', 2.0), ('Huge', 3.0)]


def amount(d, label='Zoom Amount'):
    return d.popup(label, [n for n, _ in AMOUNT], 0), [f for _, f in AMOUNT]


def zoom_fx(curve):
    """curve(f) -> scale keys for amount factor f."""
    def build(d):
        wid, F = amount(d)
        clip = src(d, pub=[('./1/100/101', 'Zoom Center')], rigs=[(wid, {'SX': [curve(f) for f in F], 'SY': [curve(f) for f in F]})])
        return wrap(d, [], clip)
    return build


ZOOM = {'Punch In': zoom_fx(lambda f: glide(0, 1.0, 4, 1 + 0.15 * f)),
        'Punch Out': zoom_fx(lambda f: glide(0, 1 + 0.15 * f, 4, 1.0)),
        'Slow Zoom In': zoom_fx(lambda f: ease(0, 1.0, LAST, 1 + 0.12 * f)),
        'Slow Zoom Out': zoom_fx(lambda f: ease(0, 1 + 0.12 * f, LAST, 1.0)),
        'Zoom Hold': zoom_fx(lambda f: glide(0, 1.0, 5, 1 + 0.2 * f) + ease_in(LAST - 5, 1 + 0.2 * f, LAST, 1.0)),
        'Zoom Bounce': zoom_fx(lambda f: spring(0, 1.0, 10, 1 + 0.1 * f) + ease_in(LAST - 6, 1 + 0.1 * f, LAST, 1.0))}


# ================================================================== OVERLAYS
def ov_grain(d):
    wid = d.popup('Grain Size', ['Normal', 'Fine', 'Coarse'], 0)
    clip = src(d)
    g = d.image('grain.png', 'Grain', opacity=0.25, anim=jitter(3, 1, 300, 200), pub=[('./1/200/202', 'Grain Amount')],
                rigs=[(wid, {'SX': [1.0, 0.6, 1.8], 'SY': [1.0, 0.6, 1.8]})])
    return wrap(d, [g], clip)


def ov_vignette(d):
    clip = src(d)
    v = d.image('vignette.png', 'Vignette', opacity=0.7, pub=[('./1/200/202', 'Vignette Amount'), ('./1/100/105', 'Vignette Size')])
    return wrap(d, [v], clip)


def ov_leak(d):
    wid = d.popup('Leak Motion', ['Slow', 'Still', 'Fast', 'Drift'], 0)
    clip = src(d)
    sweep = lambda n: sum(([key(i * (DUR // n), -500 if i % 2 == 0 else 500)] for i in range(n + 1)), [])
    leak = d.image('leak.png', 'Leak', sx=1.3, sy=1.3, opacity=0.55, pub=[('./1/200/202', 'Leak Strength'), ('./1/100/105', 'Leak Size')],
                   rigs=[(wid, {'X': [sweep(2), 0, sweep(8), sweep(1)]})])
    return wrap(d, [leak], clip)


def ov_spot(d):
    clip = src(d)
    s = d.image('spot_dark.png', 'Spotlight', opacity=0.8, pub=[('./1/200/202', 'Darkness'), ('./1/100/101', 'Spot Position'), ('./1/100/105', 'Spot Size')])
    return wrap(d, [s], clip)


def ov_grid(d):
    clip = src(d)
    g = d.image('grid_lines.png', 'Grid', color=WHITE, color_label='Grid Color', opacity=0.18, pub=[('./1/200/202', 'Grid Opacity'), ('./1/100/105', 'Grid Spacing')])
    return wrap(d, [g], clip)


def ov_scanlines(d):
    clip = src(d, [Filter('PAEBadTV', 'Scanlines', {'Waviness#1': 0, 'Roll#2': 0, 'Static#3': 0, 'Color Synch#4': 0, 'Saturate#5': 0, 'Scan Line Brightness#6': 1.2,
                                                     'Scan Line Thickness#7': 2, 'Scan Line Distance#8': 1, 'Mix#10001': 1}, [('6', 'Scanlines'), ('7', 'Thickness')])])
    return wrap(d, [], clip)


OVERLAYS = {'Film Grain': ov_grain, 'Vignette': ov_vignette, 'Light Leak': ov_leak, 'Spotlight Dim': ov_spot, 'Grid Overlay': ov_grid, 'Scanlines': ov_scanlines}


# ================================================================== COLOR LOOKS
LOOKS = {
    'Clean Punch': [CONTRAST(1.15), SAT(0.12), SHARP(1.5)],
    'Warm Film': [TINT('#ffb070', 0.18, 'Warmth'), GAMMA(1.06), CONTRAST(0.92), NOISE(0.3, 0.3), VIG(0.5)],
    'Cool Teal': [TINT('#5fd4ff', 0.16, 'Cool'), CONTRAST(1.08), SAT(-0.1), VIG(0.4)],
    'Mono': [SAT(-1, 'Color'), CONTRAST(1.2), GAMMA(1.05), VIG(0.5)],
    'Faded Matte': [GAMMA(1.18), CONTRAST(0.82), SAT(-0.2), NOISE(0.25, 0.25)],
    'Night': [GAMMA(0.75), TINT('#5a78ff', 0.22, 'Night'), SAT(-0.3), VIG(0.8)],
    'Vivid': [SAT(0.35), CONTRAST(1.1)],
}


def look(filters):
    def build(d):
        for f in filters:
            if not any(p == '10001' for p, _ in f.pub):
                f.pub = list(f.pub) + [('10001', f'{f.name} Amount')]
        return wrap(d, [], src(d, filters))
    return build


COLOR = {k: look(v) for k, v in LOOKS.items()}


# ================================================================== FUNNY / MEME — every one has a Preset pop-up + sliders
LEVELS = [('Normal', 1.0), ('Mild', 0.45), ('Wild', 1.8), ('Insane', 3.0)]


def preset(d, label='Preset'):
    return d.popup(label, [n for n, _ in LEVELS], 0), [f for _, f in LEVELS]


def jit_keys(seed, every, dx, dy, lo=0, hi=DUR):
    base = jitter(seed, every, dx, dy, lo, hi)
    return base['X'][0], base['Y'][0]


def fn_earthquake(d):
    wid, F = preset(d)
    clip = src(d, [Filter('PAEEarthquake', 'Earthquake', {'Twist#1': 0.3, 'Horizontal Shake#2': 0.5, 'Vertical Shake#3': 0.5}, [('1', 'Twist')],
                          rig=(wid, '2', 'Horizontal Shake', [0.5 * f for f in F], 0, 100)),
                   Filter('PAEEarthquake', 'Earthquake Vertical', {'Twist#1': 0, 'Horizontal Shake#2': 0, 'Vertical Shake#3': 0.5}, [('10001', 'Vertical Mix')],
                          rig=(wid, '3', 'Vertical Shake', [0.5 * f for f in F], 0, 100))],
               sx=1.08, sy=1.08, pub=[('./1/100/105', 'Zoom (hides edges)')])
    return wrap(d, [], clip)


def fn_vibrate(d):
    wid, F = preset(d)
    xs, ys = jit_keys(7, 1, 14, 10)
    clip = src(d, sx=1.04, sy=1.04, pub=[('./1/100/105', 'Zoom (hides edges)')],
               rigs=[(wid, {'X': [[(f, v * m) for f, v in xs] for m in F], 'Y': [[(f, v * m) for f, v in ys] for m in F]}, 'hold')])
    return wrap(d, [], clip)


def fn_bulge(d):
    wid, F = preset(d, 'Bulge Size')
    clip = src(d, [Filter('Bulge', 'Bulge', {'Amount#2': 420, 'Scale#3': 0.8, 'Crop#4': 0}, [('3', 'Bulge Strength'), ('1', 'Bulge Center')],
                          rig=(wid, '2', 'Amount', [420 * f for f in F], 0, 5000))])
    return wrap(d, [], clip)


def fn_bulge_pulse(d):
    wid = d.popup('Pulse Speed', ['Normal', 'Slow', 'Fast', 'Frantic'], 0)
    def pulse(n):
        k = []
        for s in range(0, DUR, n):
            k += [key(s, 0.1, 'steep'), key(s + int(n * 0.4), 0.9, 'soft'), key(s + n - 1, 0.1)]
        return k
    clip = src(d, [Filter('Bulge', 'Bulge', {'Amount#2': 400, 'Scale#3': pulse(20), 'Crop#4': 0}, [('2', 'Bulge Size'), ('1', 'Bulge Center')],
                          rig=(wid, '3', 'Scale', [pulse(20), pulse(40), pulse(10), pulse(5)], 0, 10))])
    return wrap(d, [], clip)


def fn_meme_zoom(d):
    wid, F = preset(d, 'Zoom Amount')
    def k(f):
        out = []
        for s in range(0, DUR, 45):
            out += [key(s, 1.0, 'steep'), key(s + 4, 1 + 0.25 * f, 'soft'), key(s + 30, 1 + 0.25 * f), key(s + 44, 1.0)]
        return out
    clip = src(d, anim=jitter(11, 1, 6, 6), pub=[('./1/100/101', 'Zoom Center')], rigs=[(wid, {'SX': [k(f) for f in F], 'SY': [k(f) for f in F]})])
    return wrap(d, [], clip)


def fn_shocked(d):
    wid, F = preset(d, 'Zoom Amount')
    k = lambda f: glide(0, 1.0, 3, 1 + 0.4 * f) + ease(3, 1 + 0.4 * f, 60, 1 + 0.45 * f) + ease_in(60, 1 + 0.45 * f, 70, 1.0)
    clip = src(d, [Filter('PAEZoomBlur', 'Zoom Blur', {'Amount#1': [key(0, 0), key(3, 60), key(10, 0)], 'Crop#3': 0}, [('10001', 'Blur Amount')])],
               anim=jitter(5, 1, 18, 14, 0, 60), pub=[('./1/100/101', 'Zoom Center')], rigs=[(wid, {'SX': [k(f) for f in F], 'SY': [k(f) for f in F]})])
    flash = d.solid('Flash', 1920, 1080, WHITE, 'Flash Color', anim={'Opacity': [key(0, 1), key(6, 0)]}, pub=[('./1/200/202', 'Flash')])
    vig = d.image('vignette.png', 'Vignette', color=ACCENT, color_label='Vignette Color', anim={'Opacity': ease(0, 0, 4, 0.8) + ease(4, 0.8, 70, 0)})
    return wrap(d, [flash, vig], clip)


def fn_triggered(d):
    wid, F = preset(d)
    clip = src(d, [Filter('PAEEarthquake', 'Shake', {'Twist#1': 0.4, 'Horizontal Shake#2': 1.0, 'Vertical Shake#3': 0.8}, [('10001', 'Shake Mix')],
                          rig=(wid, '2', 'Horizontal Shake', [1.0 * f for f in F], 0, 100)),
                   Filter('PAEPrism', 'Split', {'Amount#1': 14, 'Crop#3': 0}, [('1', 'Color Split')])], sx=1.12, sy=1.12,
               anim={'SX': [key(f, 1.12 + 0.05 * ((f // 3) % 2)) for f in range(0, DUR + 1, 3)], 'SY': [key(f, 1.12 + 0.05 * ((f // 3) % 2)) for f in range(0, DUR + 1, 3)]})
    red = d.image('vignette.png', 'Red Vignette', color=ACCENT, color_label='Vignette Color', anim={'Opacity': [(f, 0.55 + 0.35 * ((f // 2) % 2)) for f in range(0, DUR + 1, 2)]},
                  pub=[('./1/200/202', 'Red Amount')])
    return wrap(d, [red], clip)


def fn_sad(d):
    wid = d.popup('Mood', ['Blue', 'Grey', 'Dark', 'Cold'], 0)
    k = (ease(0, 1.05, LAST, 1.0), 'linear')
    clip = src(d, [SAT(-0.7, 'Color Drain'), TINT('#6f8cff', 0.2, 'Blue'), GAMMA(0.85), VIG(0.85)], anim={'SX': k, 'SY': k})
    rain = d.image('rain.png', 'Rain', opacity=0.5, anim={'Y': (ease(0, 540, LAST, -540 * 7), 'linear')}, pub=[('./1/200/202', 'Rain')])
    rain2 = d.image('rain.png', 'Rain 2', opacity=0.35, sx=1.3, sy=1.3, anim={'Y': (ease(0, 700, LAST, -700 * 5), 'linear')})
    tears = []
    for i, x in enumerate((-110, 110)):
        drop = []
        for s in range(10, DUR, 40):
            drop += [key(s, 60, 'steep'), key(s + 30, -300, 'infast')]
        tears.append(d.image('tear.png', f'Tear {i + 1}', color='#9fd3ff', color_label='Tear Color' if i == 0 else None, x=x, sx=0.5, sy=0.5,
                             anim={'Y': (drop, 'bezier'), 'Opacity': ([(f, 1 if (f - 10) % 40 < 30 else 0) for f in range(0, DUR + 1, 2)], 'hold')}))
    tg = d.group('Tears', tears, pub=[('./1/100/101', 'Tears Position'), ('./1/200/202', 'Tears'), ('./1/100/105', 'Tears Size')])
    tint = d.solid('Mood Tint', 1920, 1080, '#3b4d99', 'Mood Color', opacity=0.0, rigs=[(wid, {'Opacity': [0.0, 0.0, 0.35, 0.15]})])
    grey = d.solid('Grey Wash', 1920, 1080, GRAY[500], None, opacity=0.0, rigs=[(wid, {'Opacity': [0.0, 0.3, 0.0, 0.0]})])
    cold = d.solid('Cold Wash', 1920, 1080, '#9fd3ff', None, opacity=0.0, rigs=[(wid, {'Opacity': [0.0, 0.0, 0.0, 0.2]})])
    return d.group('Effect', [tint, grey, cold, tg, rain2, rain, clip])


def fn_excited(d):
    wid, F = preset(d, 'Energy')
    def k(f):
        out = []
        for s in range(0, DUR, 16):
            out += [key(s, 1.0, 'steep'), key(s + 5, 1 + 0.12 * f, 'soft'), key(s + 15, 1.0)]
        return out
    clip = src(d, [SAT(0.4, 'Pop'), CONTRAST(1.1)], anim={'Rot': [key(f, 2 * (1 if (f // 8) % 2 else -1)) for f in range(0, DUR + 1, 8)]},
               rigs=[(wid, {'SX': [k(f) for f in F], 'SY': [k(f) for f in F]})])
    r = random.Random(21)
    sparks = []
    for i in range(10):
        s0 = r.randint(0, 30)
        pop = []
        for s in range(s0, DUR, 36):
            pop += [key(s, 0.0, 'steep'), key(s + 6, 0.5, 'soft'), key(s + 20, 0.0, 'infast')]
        sparks.append(d.image('sparkle.png', f'Spark {i + 1}', color='#ffd54a', color_label='Sparkle Color' if i == 0 else None,
                              x=r.randint(-860, 860), y=r.randint(-460, 460), anim={'SX': pop, 'SY': pop, 'Rot': (ease(0, 0, LAST, 360 * (1 if i % 2 else -1)), 'linear')}))
    sg = d.group('Sparkles', sparks, pub=[('./1/200/202', 'Sparkles'), ('./1/100/105', 'Sparkle Size')])
    return wrap(d, [sg], clip)


def fn_dramatic(d):
    wid, F = preset(d, 'Zoom Amount')
    clip = src(d, [CONTRAST(1.25), SAT(-0.25), VIG(1.0, 0.9, 0.7)], rigs=[(wid, {'SX': [(ease(0, 1.0, LAST, 1 + 0.35 * f), 'linear') if False else ease(0, 1.0, LAST, 1 + 0.35 * f) for f in F],
                                                                                 'SY': [ease(0, 1.0, LAST, 1 + 0.35 * f) for f in F]})])
    red = d.image('vignette.png', 'Red Edge', color=ACCENT, color_label='Edge Color', anim={'Opacity': [key(f, 0.5 if (f // 15) % 4 == 0 else 0.0) for f in range(0, DUR + 1, 15)]},
                  pub=[('./1/200/202', 'Red Pulse')])
    return wrap(d, [red], clip)


def fn_spin_fail(d):
    clip = src(d, anim={'SX': glide(0, 1.0, 10, 0.8) + glide(18, 0.8, 30, 1.0), 'SY': glide(0, 1.0, 10, 0.8) + glide(18, 0.8, 30, 1.0),
                        'Rot': spring(0, 0, 18, 360, 0.08) + ease(18, 360, LAST, 360)}, pub=[('./1/100/101', 'Spin Center')])
    return wrap(d, [], clip)


def fn_flip(d):
    wid = d.popup('Flip', ['Upside Down', 'Mirror Left-Right', 'Both'], 0)
    clip = src(d, rot=180, rigs=[(wid, {'SX': [1.0, -1.0, -1.0], 'SY': [1.0, -1.0, 1.0]})])
    return wrap(d, [], clip)


def fn_mirror(d):
    clip = src(d, [Filter('PAEMirror', 'Mirror', {'Angle#2': 0}, [('2', 'Mirror Angle'), ('1', 'Mirror Center'), ('10001', 'Mix')])])
    return wrap(d, [], clip)


def fn_deep_fried(d):
    wid, F = preset(d, 'Fry Level')
    clip = src(d, [Filter('PAEContrast', 'Fry', {'Contrast#1': 2.2, 'Pivot#2': 0.45}, rig=(wid, '1', 'Contrast', [1 + 1.2 * f for f in F], 0, 10)),
                   SAT(1.2, 'Color Burn'), SHARP(6), NOISE(0.6, 0.6, 'Crunch'), Filter('PAEPosterize', 'Posterize', {'Levels#1': 6}, [('1', 'Posterize Levels'), ('10001', 'Posterize Mix')])])
    return wrap(d, [], clip)


def fn_wobble(d):
    wid, F = preset(d)
    clip = src(d, [Filter('PAEWave', 'Wobble', {'Amplitude#1': 22, 'Wavelength#2': 320, 'Offset#3': [(0, 0), (LAST, 3000)], 'Repeat Edges#5': 1}, [('2', 'Wobble Size')],
                          rig=(wid, '1', 'Amplitude', [22 * f for f in F], 0, 1000))], sx=1.05, sy=1.05, pub=[('./1/100/105', 'Zoom (hides edges)')])
    return wrap(d, [], clip)


def fn_drunk(d):
    wid, F = preset(d)
    sway = ease(0, -3, 40, 3) + ease(40, 3, 80, -3) + ease(80, -3, 120, 3) + ease(120, 3, 160, -3) + ease(160, -3, 200, 3) + ease(200, 3, 240, -3) + ease(240, -3, LAST, 3)
    clip = src(d, [Filter('PAEWave', 'Sway', {'Amplitude#1': 14, 'Wavelength#2': 500, 'Offset#3': [(0, 0), (LAST, 2000)], 'Repeat Edges#5': 1},
                          rig=(wid, '1', 'Amplitude', [14 * f for f in F], 0, 1000)),
                   BLUR(3, 'Blur')], sx=1.1, sy=1.1, anim={'Rot': sway}, pub=[('./1/100/105', 'Zoom (hides edges)')])
    return wrap(d, [], clip)


def fn_pixel_censor(d):
    wid = d.popup('Pixel Size', ['Normal', 'Fine', 'Huge'], 0)
    clip = src(d, [Filter('PAEPixellate', 'Censor', {'Scale#2': 40}, [('1', 'Center'), ('10001', 'Mix')], rig=(wid, '2', 'Scale', [40, 16, 110], 1, 1000))])
    return wrap(d, [], clip)


def fn_jelly(d):
    wid, F = preset(d, 'Wobble Amount')
    def kk(f, sign):
        kx = []
        for s in range(0, DUR, 24):
            kx += [key(s, 1.0), key(s + 6, 1 + 0.08 * f * sign), key(s + 12, 1 - 0.06 * f * sign), key(s + 18, 1 + 0.04 * f * sign), key(s + 23, 1.0)]
        return kx
    clip = src(d, anchor=(0, -540), rigs=[(wid, {'SX': [kk(f, 1) for f in F], 'SY': [kk(f, -1) for f in F]})])
    return wrap(d, [], clip)


def fn_tiny(d):
    wid = d.popup('Size', ['Tiny', 'Small', 'Micro', 'Half'], 0)
    k = lambda v: glide(0, 1.0, 12, v) + ease(12, v, LAST, v)
    clip = src(d, pub=[('./1/100/101', 'Position')], rigs=[(wid, {'SX': [k(0.35), k(0.55), k(0.18), k(0.5)], 'SY': [k(0.35), k(0.55), k(0.18), k(0.5)]})])
    return wrap(d, [], clip)


def fn_funhouse(d):
    wid, F = preset(d)
    clip = src(d, [Filter('PAEFunHouse', 'Fun House', {'Width#2': 300, 'Amount#3': 5}, [('2', 'Warp Width'), ('1', 'Warp Center')],
                          rig=(wid, '3', 'Amount', [5 * f for f in F], 0, 100))], sx=1.05, sy=1.05)
    return wrap(d, [], clip)


FUNNY = {'Earthquake': fn_earthquake, 'Vibrate': fn_vibrate, 'Face Bulge': fn_bulge, 'Bulge Pulse': fn_bulge_pulse, 'Meme Zoom': fn_meme_zoom, 'Shocked': fn_shocked,
         'Triggered': fn_triggered, 'Sad Frame': fn_sad, 'Excited Frame': fn_excited, 'Dramatic Zoom': fn_dramatic, 'Spin Fail': fn_spin_fail, 'Flip': fn_flip,
         'Mirror Face': fn_mirror, 'Deep Fried': fn_deep_fried, 'Wobble': fn_wobble, 'Drunk Cam': fn_drunk, 'Pixel Censor': fn_pixel_censor, 'Jelly Bounce': fn_jelly,
         'Tiny Mode': fn_tiny, 'Fun House Mirror': fn_funhouse}


# ================================================================== build
FOLDERS = [('Frames', FRAMES), ('Zoom', ZOOM), ('Overlays', OVERLAYS), ('Color Looks', COLOR), ('Funny', FUNNY)]
TH = {'Frames': f'<rect x="120" y="40" width="400" height="200" rx="16" fill="none" stroke="#fff" stroke-width="6"/><rect x="120" y="40" width="400" height="36" rx="16" fill="{GRAY[700]}"/>',
      'Zoom': '<rect x="220" y="60" width="200" height="112" rx="8" fill="none" stroke="#fff" stroke-width="6"/><rect x="170" y="32" width="300" height="168" rx="8" fill="none" stroke="' + ACCENT + '" stroke-width="4" stroke-dasharray="10 8"/>',
      'Overlays': '<rect x="120" y="40" width="400" height="200" rx="12" fill="#fff" opacity=".12"/><rect x="140" y="60" width="360" height="160" rx="10" fill="#fff" opacity=".12"/>',
      'Color Looks': ''.join(f'<rect x="{120 + i * 82}" y="60" width="70" height="140" rx="8" fill="{c}"/>' for i, c in enumerate(('#f22f46', '#ffb070', '#5fd4ff', '#a1a1a1', '#5a78ff'))),
      'Funny': f'<text x="320" y="200" text-anchor="middle" font-size="150">😂</text>'}


def build_all(only=None):
    for folder, items in FOLDERS:
        for name, fn in items.items():
            if only and only not in name and only not in folder:
                continue
            d = new(name, folder)
            d.write(fn(d), thumb_svg(name, 'effect', TH.get(folder, '')))


if __name__ == '__main__':
    build_all(sys.argv[1] if len(sys.argv) > 1 else None)
