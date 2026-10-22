"""ozml.py — shared engine for the FCP Kit (titles, transitions, generators, effects).

Everything is written the way Apple's own templates write it (Motion 5.6 OZML):
  * bezier keyframes carry NO interpolation attribute; linear = 1; hold = 0
  * markers: Build In = 4, Build Out = 6, Loop End = 7, Poster = 8
  * text nodes are copied from Apple's "Fade" title (same factory table, ids 1-25)
  * Apple filters are copied from the stock effects (Filter), PNG layers get Colorize for colour
"""
import os, re, glob, shutil, subprocess, tempfile, html
from xml.dom import minidom

HERE = os.path.dirname(os.path.abspath(__file__))            # <repo>/content-creation/source/kit
SRC = os.path.dirname(HERE)                                   # <repo>/content-creation/source
KIT = os.path.join(os.path.dirname(SRC), 'kit')              # <repo>/content-creation/kit, the installable kit
MEDIA = os.path.join(SRC, 'media')
OUT = os.path.join(KIT, 'Motion Templates')
STOCK = ('/Applications/Final Cut Pro Creator Studio.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/'
         'PETemplates.localized/')

# ------------------------------------------------------------------ design tokens (design.imswarnil.com)
ACCENT = '#f22f46'
WHITE, BLACK = '#ffffff', '#000000'
GRAY = {50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a1a1a1', 500: '#737373',
        600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a'}
CANVAS, INK, MUTED, LINE = GRAY[950], WHITE, GRAY[400], GRAY[700]
FONT = {'sans': 'Geist-Regular', 'medium': 'Geist-Medium', 'semibold': 'Geist-SemiBold', 'bold': 'Geist-Bold',
        'black': 'Geist-Black', 'mono': 'GeistMono-Medium', 'mono-bold': 'GeistMono-Bold', 'pixel': 'GeistPixel-Square',
        'hand': 'Caveat-Regular', 'hand-bold': 'CaveatRoman-Bold'}
# motion tokens in frames @30fps: instant 120ms · fast 200ms · base 360ms · slow 640ms · long 900ms
DUR_INSTANT, DUR_FAST, DUR_BASE, DUR_SLOW, DUR_LONG = 4, 6, 11, 19, 27

# ------------------------------------------------------------------ factories (Apple "Fade" title table + extras)
FACTORIES = [
    ('03ce4d4f0ea74b3b9af072a0e4a61ab7', 'Channel'), ('044beba5ad3211d7ac9b000393833f6a', 'Style'),
    ('0a5c0b1d4acd11d8b650000a95a6b5a8', 'Channel'), ('0e8d443513b611d89395000a95af9f7e', 'Channel'),
    ('10405f52139811d8b4db000a95af9f7e', 'Channel'), ('1595b452229211d78c7f00039389b702', 'Channel'),
    ('1c5986a34e9646e08fa8e92b03ba1aaf', 'Channel'), ('27f3ee8b229211d7925a00039389b702', 'Channel'),
    ('402246385249454b90e08b2ee1b6bf06', 'Rig'), ('46c844a813d311d8a438000a95af9f7e', 'Channel'),
    ('558f10b4a1c011d7998900039389b702', 'Channel'), ('65cb4dc9d4504fa281921f5f751fba06', 'Widget'),
    ('69f1e0a52e7911d8b19a000a95b0025a', 'Channel'), ('7644521e2e7911d891a6000a95b0025a', 'Channel'),
    ('7d468273c013498e9806a0d7bc32fddf', 'Project'), ('878a64bd193011d8bac3000a95af9f7e', 'Channel'),
    ('9279a0e120d64a82b26b4cf79391ff47', 'Sequence Text'), ('aee0a63927494ed19a9667c9f83badfd', 'Material'),
    ('babfc7777f4711d7aaa7000393833f6a', 'Text'), ('dbca752470fd11d7980100039389b702', 'Channel'),
    ('dd0036f96c9e4bfdadb82f71fbf5c9d8', 'Rig Behavior'), ('e35c74f01d5042f6b468eb530169bfb7', 'Widget'),
    ('f4c2c6ef713f4a18ae987242c8b7f619', 'Channel'), ('fca4a88380df4dab943a0962bdb1ae75', 'Channel'),
    ('fdc1944b229111d7b1c300039389b702', 'Channel'),
    # extras
    ('66fc0d6af6a911d6a7a7000393670732', 'Image'), ('deca4859b16011d7a12d0003936f6f92', 'ProPlugin Filter'),
    ('615c4bf6406511d88802000a95af90f2', 'Generator'), ('a1a40f72a21111d7a40e00039366fb58', 'Fade In/Fade Out'),
    ('68fba2c1aa094655bf4b81587efec626', 'Link'), ('6d5e3b5e92ee4a349864eb75a700d6a1', 'Text Generator'),
]
F = {u: i + 1 for i, (u, _) in enumerate(FACTORIES)}
FID = lambda uuid: F[uuid]
F_STYLE, F_TEXT, F_PROJECT, F_WIDGET = 2, 19, 15, 12
F_RIG, F_RIGW, F_RIGB = 9, 22, 21
F_IMAGE, F_FILTER, F_GEN = F['66fc0d6af6a911d6a7a7000393670732'], F['deca4859b16011d7a12d0003936f6f92'], F['615c4bf6406511d88802000a95af90f2']
F_TEXTGEN = F['6d5e3b5e92ee4a349864eb75a700d6a1']
PREFIX = 'Custom - '          # every kit folder inside Final Cut Pro
FLOAT, PERCENT = F['fdc1944b229111d7b1c300039389b702'], F['27f3ee8b229211d7925a00039389b702']
GROUP_UUID, FILTER_UUID = 'ee6b4918387a11d7a02100039375d2ba', 'deca4859b16011d7a12d0003936f6f92'
FACTORY_XML = ''.join(f'<factory id="{i + 1}" uuid="{u}"><description>{d}</description><manufacturer>Apple</manufacturer><version>1</version></factory>\n'
                      for i, (u, d) in enumerate(FACTORIES))

# ------------------------------------------------------------------ time
t = lambda f: f'{int(round(f * 4004))} 120000 1 0'
SEC = lambda f: f * 4004 / 120000


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(round(int(h[i:i + 2], 16) / 255, 4) for i in (0, 2, 4))


def esc(s):
    return html.escape(str(s), quote=True)


# ------------------------------------------------------------------ curves
# handle per key side: (segment seconds, segment change) -> (handle time, handle value)
TANGENT = {
    'flat':  lambda dt, dv: (dt / 3, 0),            # ease
    'slope': lambda dt, dv: (dt / 3, dv / 3),       # straight
    'steep': lambda dt, dv: (dt * 0.22, dv),        # ease-glide fast side  (cubic-bezier .22,1,.36,1)
    'soft':  lambda dt, dv: (dt * 0.64, 0),         # ease-glide long gentle side
    'in':    lambda dt, dv: (dt * 0.5, 0),          # ease-in slow side     (cubic-bezier .5,0,.9,.4)
    'infast': lambda dt, dv: (dt * 0.1, dv * 0.6),  # ease-in fast side
}


def key(f, v, out='flat', inn='flat'):
    return (f, v, out, inn)


def glide(f0, v0, f1, v1):
    """ease-glide: quick start, long soft landing (entrances)."""
    return [key(f0, v0, 'steep', 'steep'), key(f1, v1, 'soft', 'soft')]


def ease_in(f0, v0, f1, v1):
    """ease-in: slow start, fast finish (exits)."""
    return [key(f0, v0, 'in', 'in'), key(f1, v1, 'infast', 'infast')]


def ease(f0, v0, f1, v1):
    return [key(f0, v0), key(f1, v1)]


def spring(f0, v0, f1, v1, over=0.12):
    """ease-spring: overshoot then settle (cubic-bezier .34,1.56,.64,1)."""
    mid = f0 + round((f1 - f0) * 0.62)
    return [key(f0, v0, 'steep', 'steep'), key(mid, v1 + (v1 - v0) * over), key(f1, v1, 'soft', 'soft')]


def inout(dur, last, a, b, hold=None, kind='glide'):
    """Entrance a->b at the start and exit b->a at the end (title build in / build out)."""
    first = glide(0, a, dur, b) if kind == 'glide' else spring(0, a, dur, b)
    return first + ease_in(last - dur, b, last, a)


def curve_xml(keys, lo=None, hi=None, mode='bezier'):
    """keys: [(frame, value[, out, in])]. mode: bezier | linear | hold."""
    keys = [k if len(k) == 4 else (k[0], k[1], 'flat', 'flat') for k in keys]
    lohi = f'<min>{lo}</min><max>{hi}</max>' if lo is not None else ''
    out = [f'<curve type="1" default="{keys[0][1]}" value="{keys[0][1]}"><numberOfKeypoints>{len(keys)}</numberOfKeypoints>{lohi}']
    for i, (f, v, o, inn) in enumerate(keys):
        if mode == 'hold':
            out.append(f'<keypoint interpolation="0" flags="0"><time>{t(f)}</time><value>{v}</value></keypoint>')
            continue
        k = (f'<keypoint interpolation="1" flags="0">' if mode == 'linear' else '<keypoint flags="0">') + f'<time>{t(f)}</time><value>{v}</value>'
        if i > 0:
            pf, pv = keys[i - 1][0], keys[i - 1][1]
            tt, tv = TANGENT[inn](SEC(f - pf), v - pv) if mode == 'bezier' else (SEC(f - pf) / 3, (v - pv) / 3)
            k += f'<inputTangentTime>{-tt}</inputTangentTime><inputTangentValue>{-tv}</inputTangentValue>'
        if i < len(keys) - 1:
            nf, nv = keys[i + 1][0], keys[i + 1][1]
            tt, tv = TANGENT[o](SEC(nf - f), nv - v) if mode == 'bezier' else (SEC(nf - f) / 3, (nv - v) / 3)
            k += f'<outputTangentTime>{tt}</outputTangentTime><outputTangentValue>{tv}</outputTangentValue>'
        out.append(k + '</keypoint>')
    return ''.join(out) + '</curve>'


def param(name, pid, v, default=0, keys=None, lo=None, hi=None, mode='bezier', flags='8606711824'):
    if keys:
        return f'<parameter name="{name}" id="{pid}" flags="{flags}">{curve_xml(keys, lo, hi, mode)}</parameter>'
    return f'<parameter name="{name}" id="{pid}" flags="{flags}" default="{default}" value="{v}"/>'


# ------------------------------------------------------------------ Apple filters
_SOURCES = {}


def _find(plugin):
    if not _SOURCES:
        for f in sorted(glob.glob(STOCK + 'Effects.localized/**/*.moef', recursive=True)):
            s = open(f, encoding='utf-8', errors='ignore').read()
            for m in re.finditer(r'<filter name="[^"]*" id="\d+" factoryID="\d+"([^>]*pluginName="([^"]+)"[^>]*)>(.*?)</filter>', s, re.S):
                if 'factoryID=' not in m.group(3):
                    _SOURCES.setdefault(m.group(2), (m.group(1), m.group(3)))
    return _SOURCES[plugin]


class Filter:
    """One Apple filter. sets: {'Name#id' or 'Parent#id/Name#id': value | keys-list}; pub: [(path, label)]"""
    def __init__(self, plugin, name, sets=None, pub=(), mode='bezier', rig=None):
        self.plugin, self.name, self.sets, self.pub, self.mode = plugin, name, sets or {}, pub, mode
        self.rig = rig          # (wid, 'path', 'Snapshot Name', [snap per entry], lo, hi) -> pop-up drives this filter channel

    def xml(self, fid, timing):
        attrs, body = _find(self.plugin)
        body = re.sub(r'<timing in="[^"]+" out="[^"]+" offset="[^"]+"/>', timing, body, count=1)
        for k, v in self.sets.items():
            *parent, leaf = k.split('/')
            n, i = leaf.split('#')
            pat = r'<parameter name="%s" id="%s" flags="(\d+)" default="([^"]*)" value="[^"]*"/>' % (re.escape(n), i)

            def rep(m):
                if isinstance(v, list):
                    return f'<parameter name="{n}" id="{i}" flags="{m.group(1)}">{curve_xml(v, mode=self.mode)}</parameter>'
                return f'<parameter name="{n}" id="{i}" flags="{m.group(1)}" default="{m.group(2)}" value="{v}"/>'
            if parent:
                pn, pi = parent[0].split('#')
                m = re.search(r'<parameter name="%s" id="%s"[^>]*>(.*?)</parameter>\s*(?=<parameter name="[^"]+" id="\d+" flags="\d+"(?: default|>))' % (re.escape(pn), pi), body, re.S)
                assert m, f'{self.plugin}: no {parent[0]}'
                inner, c = re.subn(pat, rep, m.group(1), count=1)
                if not c:
                    inner = re.sub(r'^(\s*<foldFlags>\d+</foldFlags>)?', lambda mm: (mm.group(0) or '') +
                                   f'<parameter name="{n}" id="{i}" flags="8606711824" default="{v}" value="{v}"/>', inner, count=1)
                body = body[:m.start(1)] + inner + body[m.end(1):]
            else:
                body, c = re.subn(pat, rep, body, count=1)
                assert c, f'{self.plugin}: no {k}'
        return f'<filter name="{esc(self.name)}" id="{fid}" factoryID="{F_FILTER}"{attrs}>{body}</filter>'


def colorize(hexc):
    r, g, b = hex_rgb(hexc)
    return Filter('PAEColorize', 'Color', {'Remap Black To#1/Red#1': r, 'Remap Black To#1/Green#2': g, 'Remap Black To#1/Blue#3': b,
                                           'Remap White To#2/Red#1': r, 'Remap White To#2/Green#2': g, 'Remap White To#2/Blue#3': b,
                                           'Intensity#3': 1, 'Mix#10001': 1})


# ------------------------------------------------------------------ media sizes
_SIZES = {}


def size_of(fn):
    if fn not in _SIZES:
        out = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', os.path.join(MEDIA, fn)], capture_output=True, text=True).stdout
        _SIZES[fn] = tuple(int(x) for x in re.findall(r'pixel(?:Width|Height): (\d+)', out))
    return _SIZES[fn]


# ------------------------------------------------------------------ the document
class Doc:
    """One template. kind: 'title' | 'effect' | 'transition' | 'generator'."""
    EXT = {'title': 'moti', 'effect': 'moef', 'transition': 'motr', 'generator': 'motn'}
    KIND_DIR = {'title': 'Titles', 'effect': 'Effects', 'transition': 'Transitions', 'generator': 'Generators'}

    def __init__(self, kind, name, folder, dur=300, build=None, poster=None, loop=False, w=1920, h=1080):
        self.kind, self.name, self.folder, self.dur, self.w, self.h = kind, name, folder, dur, w, h
        self.last = dur - 1
        self.n, self.clips, self.pubs, self.rigs, self.markers = 40000, [], [], [], []
        self.timing = f'<timing in="{t(0)}" out="{t(dur)}" offset="0 1 1 0"/>'
        self.media_used = set()
        if build:                       # (in_end_frame, out_start_frame)
            self.markers += [(build[0], 4), (build[1], 6)]
        if poster is not None:
            self.markers.append((poster, 8))
        if loop:
            self.markers.append((dur, 7))

    def nid(self):
        self.n += 1
        return self.n

    def pub(self, obj, channel, label):
        self.pubs.append(f'<target object="{obj}" channel="{channel}" name="{esc(label)}"/>')

    # ---- properties block shared by layers / images / text
    def props(self, x=0, y=0, sx=1.0, sy=1.0, rot=0, opacity=1.0, anim=None, anchor=None, crop=None, extra='', blend=None):
        """anim: {'X'|'Y'|'SX'|'SY'|'Rot'|'Opacity'|'CropL'|'CropR'|'CropB'|'CropT': keys[, mode]}"""
        anim = anim or {}

        def ch(k, name, pid, v, d, lo=None, hi=None):
            if k in anim:
                a = anim[k]
                keys, mode = (a if isinstance(a, tuple) else (a, 'bezier'))
                return param(name, pid, v, d, keys, lo, hi, mode)
            return param(name, pid, v, d)
        rot_v = rot * 3.141592653589793 / 180
        rk = anim.get('Rot')
        if rk:                                      # rotation keys are given in degrees
            keys, mode = rk if isinstance(rk, tuple) else (rk, 'bezier')
            anim = dict(anim)
            anim['Rot'] = ([(k[0], k[1] * 3.141592653589793 / 180) + tuple(k[2:]) for k in keys], mode)
        xml = ('<parameter name="Properties" id="1" flags="8589938704"><parameter name="Transform" id="100" flags="8589938704">'
               f'<parameter name="Position" id="101" flags="8589938704">{ch("X", "X", 1, x, 0)}{ch("Y", "Y", 2, y, 0)}</parameter>'
               f'<parameter name="Rotation" id="102" flags="8589938704">{ch("Rot", "Z", 3, rot_v, 0)}</parameter>'
               f'<parameter name="Scale" id="105" flags="8589938704">{ch("SX", "X", 1, sx, 1)}{ch("SY", "Y", 2, sy, 1)}</parameter>')
        if anchor:
            xml += f'<parameter name="Anchor Point" id="107" flags="8589938704">{param("X", 1, anchor[0])}{param("Y", 2, anchor[1])}</parameter>'
        xml += '</parameter>'
        blend_xml = f'<parameter name="Blend Mode" id="203" flags="12901744656" default="0" value="{blend}"/>' if blend is not None else ''
        xml += f'<parameter name="Blending" id="200" flags="8589938704">{ch("Opacity", "Opacity", 202, opacity, 1, 0, 1)}{blend_xml}</parameter>'
        if crop or any(k.startswith('Crop') for k in anim):
            c = crop or (0, 0, 0, 0)
            xml += ('<parameter name="Crop" id="216" flags="8589971474"><foldFlags>131087</foldFlags>'
                    f'{ch("CropL", "Left", 1, c[0], 0)}{ch("CropR", "Right", 2, c[1], 0)}{ch("CropB", "Bottom", 3, c[2], 0)}{ch("CropT", "Top", 4, c[3], 0)}</parameter>')
        return xml + extra + '</parameter>'

    # ---- objects
    def group(self, name, children, filters='', **kw):
        gid = kw.pop('gid', None) or self.nid()
        pubs = kw.pop('pub', None)
        if pubs:
            for channel, label in pubs:
                self.pub(gid, channel, label)
        return (f'<layer name="{esc(name)}" id="{gid}">{"".join(children)}<aspectRatio>1</aspectRatio><flags>0</flags>{self.timing}<baseFlags>524304</baseFlags>'
                f'{self.props(**kw)}<parameter name="Object" id="2" flags="8589938704"/>{filters}</layer>')

    def image(self, fn, name=None, color=None, color_label=None, filters=(), **kw):
        """PNG from media/. color: hex -> Colorize (publish as color_label)."""
        name = name or fn.rsplit('.', 1)[0]
        cid, sid = self.nid(), self.nid()
        w, h = size_of(fn)
        self.media_used.add(fn)
        self.clips.append(
            f'<clip name="{esc(name)}" id="{cid}"><relativeURL>Media/{fn}</relativeURL><missingWidth>{w}</missingWidth><missingHeight>{h}</missingHeight>'
            '<missingDuration>0.033333333333333333</missingDuration><creationDuration>1</creationDuration><mediaID></mediaID><flags>0</flags>'
            f'<timing in="0 1 1 0" out="0 120000 1 0" offset="0 1 1 0"/><foldFlags>0</foldFlags><baseFlags>524304</baseFlags><parameter name="Properties" id="1" flags="8589938704"/>'
            '<parameter name="Object" id="2" flags="8589938704"><parameter name="Alpha Type" id="100" flags="8589938704"><parameter name="Alpha Type" id="101" flags="8590000128" default="0" value="1"/></parameter>'
            '<parameter name="Pixel Aspect Ratio" id="104" flags="12884901888" default="1" value="1"/><parameter name="Frame Rate" id="107" flags="8589934592" default="0" value="30"/>'
            f'<parameter name="Fixed Width" id="114" flags="12884901888" default="{w}" value="{w}"/><parameter name="Fixed Height" id="115" flags="12884901888" default="{h}" value="{h}"/>'
            '<parameter name="Missing Is Still" id="128" flags="8589934610" default="0" value="1"/></parameter></clip>')
        media = f'<parameter name="Media" id="324" flags="8589938704"><parameter name="Source Media" id="300" flags="81604444176" default="{cid}" value="{cid}"/></parameter>'
        fx = ''
        if color:
            fid = self.nid()
            fx += colorize(color).xml(fid, self.timing)
            if color_label:
                self.pub(fid, './2', color_label)
        fx += self._filters(filters)
        pubs = kw.pop('pub', None)
        if pubs:
            for channel, label in pubs:
                self.pub(sid, channel, label)
        rigs = kw.pop('rigs', None)
        return self._wrap_rigs(f'<scenenode name="{esc(name)}" id="{sid}" factoryID="{F_IMAGE}" version="5"><validTracks>1</validTracks><aspectRatio>1</aspectRatio><flags>0</flags>'
                f'{self.timing}<foldFlags>16384</foldFlags><baseFlags>524304</baseFlags>{self.props(extra=media, **kw)}<parameter name="Object" id="2" flags="8589938704"/>{fx}</scenenode>', name, rigs)

    def solid(self, name, w, h, color, color_label=None, filters=(), **kw):
        """Apple Color Solid generator: crisp rectangle, colour publishable directly.
        The Color Solid ignores Anchor Point (it always scales about its centre), so an anchored rectangle is
        drawn as a white image scaled to w x h instead (anchor given in on-screen px, SX/SY keys relative to w/h)."""
        if kw.get('anchor'):
            return self._anchored_rect(name, w, h, color, color_label, filters, **kw)
        sid = self.nid()
        r, g, b = hex_rgb(color)
        if color_label:
            self.pub(sid, './2/1/1', color_label)
        pubs = kw.pop('pub', None)
        if pubs:
            for channel, label in pubs:
                self.pub(sid, channel, label)
        fx = ''
        fx += self._filters(filters)
        rigs = kw.pop('rigs', None)
        return self._wrap_rigs(f'<scenenode name="{esc(name)}" id="{sid}" factoryID="{F_GEN}" pluginUUID="C18E8B62-C24F-4F8D-8597-858675A40BBC" pluginVersion="0" pluginName="Color Solid" version="5">'
                f'<aspectRatio>1</aspectRatio><flags>0</flags>{self.timing}<foldFlags>16384</foldFlags><baseFlags>524304</baseFlags>{self.props(**kw)}'
                '<parameter name="Object" id="2" flags="8589938704"><parameter name="Color Solid" id="1" flags="8589938704">'
                f'<parameter name="Width" id="300" flags="8589934608" default="1920" value="{w}"/><parameter name="Height" id="301" flags="12884901904" default="1080" value="{h}"/>'
                f'<parameter name="Color" id="1" flags="8589938704"><foldFlags>11</foldFlags>{param("Red", 1, r, 1)}{param("Green", 2, g, 1)}{param("Blue", 3, b, 1)}</parameter>'
                f'<parameter name="Flip" id="10002" flags="12889161760" default="0" value="0"/></parameter></parameter>{fx}</scenenode>', name, rigs)

    def _anchored_rect(self, name, w, h, color, color_label, filters, **kw):
        bx, by = w / 1920, h / 16
        ax, ay = kw.pop('anchor')
        kw['anchor'] = (ax / bx, ay / by)
        kw['sx'], kw['sy'] = kw.get('sx', 1.0) * bx, kw.get('sy', 1.0) * by
        anim = dict(kw.get('anim') or {})
        for k, f in (('SX', bx), ('SY', by)):
            if k in anim:
                a = anim[k]
                keys, mode = a if isinstance(a, tuple) else (a, None)
                keys = [(kk[0], kk[1] * f) + tuple(kk[2:]) for kk in keys]
                anim[k] = (keys, mode) if mode else keys
        if anim:
            kw['anim'] = anim
        return self.image('px_white.png', name, color=color, color_label=color_label, filters=filters, **kw)

    def text(self, string, name=None, font='semibold', size=66, color=WHITE, align='left', publish=None, filters=(), **kw):
        """Live text (Apple text object). align: left | center | right. publish: label prefix -> Font/Size/Color published."""
        name = name or string
        tid, pid, sid = self.nid(), self.nid(), self.nid()
        al = {'left': 0, 'center': 1, 'right': 2}[align]
        r, g, b = hex_rgb(color)
        fontname = FONT.get(font, font)
        tex = lambda i: (f'<parameter name="Texture" id="{i}" flags="77313609744"><parameter name="Image" id="1" flags="77326254096" default="0" value="0"/>'
                         '<parameter name="Wrap Mode" id="5" flags="8590000144" default="0" value="1"/></parameter>')
        style = (f'<style name="Style" id="{sid}" factoryID="{F_STYLE}"><copyFlags>65535</copyFlags><previewWidth>0</previewWidth><previewHeight>0</previewHeight>'
                 f'<presetName>Normal</presetName>{self.timing}<baseFlags>8657043504</baseFlags><foldFlags>786432</foldFlags>'
                 f'<parameter name="Font" id="83" flags="12884906000"><font>{fontname}</font><defaultFont>Helvetica</defaultFont></parameter>'
                 f'<parameter name="Size" id="3" flags="8606711824" default="48" value="{size}"/>'
                 f'<parameter name="Face" id="14" flags="8589938704"><foldFlags>131072</foldFlags><parameter name="Color" id="16" flags="8589938704"><foldFlags>15</foldFlags>'
                 f'{param("Red", 1, r, 1)}{param("Green", 2, g, 1)}{param("Blue", 3, b, 1)}</parameter>{tex(18)}</parameter>'
                 f'<parameter name="Drop Shadow" id="21" flags="8589971472"><foldFlags>131072</foldFlags>{tex(25)}</parameter>'
                 f'<parameter name="Outline" id="30" flags="8589971472"><foldFlags>131072</foldFlags>{tex(34)}</parameter>'
                 f'<parameter name="Glow" id="38" flags="8589973520"><foldFlags>131072</foldFlags>{tex(42)}</parameter>'
                 '<parameter name="3D Text" id="89" flags="8589971472"><foldFlags>131072</foldFlags><parameter name="Lighting" id="527" flags="8589938704"><foldFlags>8388608</foldFlags>'
                 '<parameter name="Environment" id="512" flags="12884906000"><foldFlags>131076</foldFlags></parameter></parameter></parameter></style>')
        if publish:
            self.pub(sid, './83', f'{publish} Font')
            self.pub(sid, './3', f'{publish} Size')
            self.pub(sid, './14/16', f'{publish} Color')
        pubs = kw.pop('pub', None)
        if pubs:
            for channel, label in pubs:
                self.pub(tid, channel, label)
        fx = ''
        fx += self._filters(filters)
        stubs = ('<parameter name="Lighting" id="230" flags="8589938706"><foldFlags>15</foldFlags></parameter><parameter name="Shadows" id="234" flags="8589938706"><foldFlags>15</foldFlags></parameter>'
                 '<parameter name="Reflection" id="223" flags="8589971474"><foldFlags>131087</foldFlags></parameter><parameter name="Drop Shadow" id="208" flags="8589971474"><foldFlags>131087</foldFlags></parameter>'
                 '<parameter name="Four Corner" id="207" flags="8589971458"><foldFlags>131087</foldFlags></parameter>')
        return (f'<scenenode name="{esc(name)}" id="{tid}" factoryID="{F_TEXT}" version="5"><paragraphMarginsCached cached="0"/><scrollMarginsCached cached="0"/><crawlMarginsCached cached="0"/>'
                f'<host hostID="0"/><textPathModified textPathModifiedVal="0"/><paragraphStyle id="{pid}"><parameter name="Alignment" id="401" flags="8590000144" default="0" value="{al}"/></paragraphStyle>'
                f'{style}<styleRun style="{sid}" offset="0" length="{len(string)}"/><aspectRatio>1</aspectRatio><flags>0</flags>{self.timing}<foldFlags>1</foldFlags><baseFlags>34078736</baseFlags>'
                f'{self.props(extra=stubs, **kw)}'
                f'<parameter name="Object" id="2" flags="8589938704"><parameter name="Text" id="369" flags="8606777344"><text>{esc(string)}</text></parameter>'
                '<parameter name="Render Text" id="360" flags="8590000146" default="0" value="0"/><parameter name="Face Camera" id="352" flags="8589934610" default="0" value="0"/>'
                '<parameter name="Path Options" id="329" flags="8589938704"><parameter name="Shape Source" id="339" flags="77326254096" default="0" value="0"/><parameter name="Align to Path" id="333" flags="8589934610" default="1" value="1"/></parameter>'
                f'<parameter name="Paragraphs" id="354" flags="8589938704"><parameter name="Paragraph" id="{pid}" flags="8589938832"><parameter name="Alignment" id="401" flags="8590000144" default="0" value="{al}"/></parameter></parameter>'
                '<parameter name="Basic" id="2000" flags="12884938770" factoryID="1"><parameter name="Substance" id="3001926012" flags="12884906002" factoryID="23"><parameter name="Color" id="1" flags="4295004162"><foldFlags>15</foldFlags></parameter>'
                f'<parameter name="Opacity" id="2" flags="4295000066" default="1" value="1"/></parameter></parameter></parameter>{fx}</scenenode>')

    def well(self, fn, name, label, **kw):
        """A user-fillable image well (drop zone) showing a placeholder PNG until the user drops media on it.
        Published as '<label>' (the Source Media channel) plus Pan / Scale."""
        xml = self.image(fn, name, **kw)
        sid = int(re.search(r'<scenenode name="[^"]*" id="(\d+)"', xml).group(1))
        w, h = size_of(fn)
        obj = ('<parameter name="Object" id="2" flags="8589938704"><parameter name="Drop Zone" id="311" flags="8589934738" default="0" value="1"/>'
               '<parameter name="Fit" id="317" flags="8606777360" default="0" value="0"/><parameter name="Replaced" id="312" flags="8589934610" default="0" value="0"/>'
               '<parameter name="Pan" id="326" flags="8589938704"><foldFlags>15</foldFlags>' + param('X', 1, 0) + param('Y', 2, 0) + '</parameter>'
               '<parameter name="Scale" id="327" flags="8589938704"><foldFlags>15</foldFlags>' + param('X', 1, 1, 1) + param('Y', 2, 1, 1) + '</parameter>'
               '<parameter name="Fill Opaque" id="328" flags="8606711824" default="0" value="0"/><parameter name="Clear" id="315" flags="8606777360" default="0" value="0"/>'
               f'<parameter name="Width" id="313" flags="8589934610" default="1" value="{w}"/><parameter name="Height" id="314" flags="8589934610" default="1" value="{h}"/></parameter>')
        xml = xml.replace('<parameter name="Object" id="2" flags="8589938704"/>', obj, 1)
        self.pub(sid, './1/324/300', label)
        self.pub(sid, './2/327', f'{label} Scale')
        self.pub(sid, './2/326', f'{label} Pan')
        return xml

    def number(self, start, end, name='Number', font='bold', size=200, color=WHITE, decimals=0, publish='Count', **kw):
        """Counting number (Apple Text Generator): counts from start to end across the whole template length."""
        tid, pid, sid = self.nid(), self.nid(), self.nid()
        r, g, b = hex_rgb(color)
        fontname = FONT.get(font, font)
        tex = lambda i: (f'<parameter name="Texture" id="{i}" flags="77313609744"><parameter name="Image" id="1" flags="77326254096" default="0" value="0"/>'
                         '<parameter name="Wrap Mode" id="5" flags="8590000144" default="0" value="1"/></parameter>')
        style = (f'<style name="Style" id="{sid}" factoryID="{F_STYLE}"><copyFlags>65535</copyFlags><previewWidth>0</previewWidth><previewHeight>0</previewHeight>'
                 f'<presetName>Normal</presetName>{self.timing}<baseFlags>8657043504</baseFlags><foldFlags>786432</foldFlags>'
                 f'<parameter name="Font" id="83" flags="8589938704"><font>{fontname}</font><defaultFont>Helvetica</defaultFont></parameter>'
                 f'<parameter name="Size" id="3" flags="8606711824" default="48" value="{size}"/>'
                 f'<parameter name="Face" id="14" flags="8589938704"><foldFlags>131072</foldFlags><parameter name="Color" id="16" flags="8589938704"><foldFlags>15</foldFlags>'
                 f'{param("Red", 1, r, 1)}{param("Green", 2, g, 1)}{param("Blue", 3, b, 1)}</parameter>{tex(18)}</parameter>'
                 f'<parameter name="Drop Shadow" id="21" flags="8589971472"><foldFlags>131072</foldFlags>{tex(25)}</parameter>'
                 f'<parameter name="Outline" id="30" flags="8589971472"><foldFlags>131072</foldFlags>{tex(34)}</parameter>'
                 f'<parameter name="Glow" id="38" flags="8589973520"><foldFlags>131072</foldFlags>{tex(42)}</parameter>'
                 '<parameter name="3D Text" id="89" flags="8589971472"><foldFlags>131072</foldFlags><parameter name="Lighting" id="527" flags="8589938704"><foldFlags>8388608</foldFlags>'
                 '<parameter name="Environment" id="512" flags="12884906000"><foldFlags>131076</foldFlags></parameter></parameter></parameter></style>')
        if publish:
            self.pub(tid, './2/513/506', f'{publish} Start')
            self.pub(tid, './2/513/507', f'{publish} End')
            self.pub(tid, './2/513/504', f'{publish} Decimals')
            self.pub(sid, './83', f'{publish} Font')
            self.pub(sid, './3', f'{publish} Size')
            self.pub(sid, './14/16', f'{publish} Color')
        pubs = kw.pop('pub', None)
        if pubs:
            for channel, label in pubs:
                self.pub(tid, channel, label)
        stubs = ('<parameter name="Lighting" id="230" flags="8589938706"><foldFlags>15</foldFlags></parameter><parameter name="Shadows" id="234" flags="8589938706"><foldFlags>15</foldFlags></parameter>'
                 '<parameter name="Reflection" id="223" flags="8589971474"><foldFlags>131087</foldFlags></parameter><parameter name="Drop Shadow" id="208" flags="8589971474"><foldFlags>131087</foldFlags></parameter>'
                 '<parameter name="Four Corner" id="207" flags="8589971458"><foldFlags>131087</foldFlags></parameter>')
        return (f'<scenenode name="{esc(name)}" id="{tid}" factoryID="{F_TEXTGEN}" version="5"><paragraphMarginsCached cached="0"/><scrollMarginsCached cached="0"/><crawlMarginsCached cached="0"/>'
                f'<host hostID="0"/><textPathModified textPathModifiedVal="0"/><paragraphStyle id="{pid}"><parameter name="Alignment" id="401" flags="8590000144" default="0" value="1"/></paragraphStyle>'
                f'{style}<aspectRatio>1</aspectRatio><flags>0</flags>{self.timing}<foldFlags>0</foldFlags><baseFlags>34078736</baseFlags>'
                f'{self.props(extra=stubs, **kw)}'
                '<parameter name="Object" id="2" flags="8589938704"><parameter name="Render Text" id="360" flags="8590000146" default="0" value="0"/><parameter name="Face Camera" id="352" flags="8589934610" default="0" value="0"/>'
                '<parameter name="Layout Method" id="314" flags="8606777360" default="0" value="1"/>'
                '<parameter name="Left Margin" id="323" flags="8606711824" default="0" value="-800"/><parameter name="Right Margin" id="324" flags="8606711824" default="0" value="800"/>'
                f'<parameter name="Top Margin" id="325" flags="8606711824" default="0" value="{size * 0.9}"/><parameter name="Bottom Margin" id="326" flags="8606711824" default="0" value="{-size * 0.3}"/>'
                '<parameter name="Path Options" id="329" flags="8589971472"><parameter name="Shape Source" id="339" flags="8610971664" default="0" value="0"/><parameter name="Align to Path" id="333" flags="8589934610" default="1" value="1"/></parameter>'
                f'<parameter name="Paragraphs" id="354" flags="8589938704"><parameter name="Paragraph" id="{pid}" flags="8589938832"><parameter name="Alignment" id="401" flags="8590000144" default="0" value="1"/></parameter></parameter>'
                '<parameter name="Crop At Margins" id="372" flags="8606744592" default="0" value="0"/>'
                '<parameter name="Numbers" id="513" flags="8589938704"><parameter name="Format" id="501" flags="8606777360" default="0" value="0"/>'
                f'<parameter name="Decimals" id="504" flags="8606711824" default="0" value="{decimals}"/><parameter name="Start" id="506" flags="8606711824" default="0" value="{start}"/>'
                f'<parameter name="End" id="507" flags="8606711824" default="100" value="{end}"/><parameter name="Thousands Separator" id="508" flags="8606711824" default="0" value="0"/>'
                '<parameter name="Minimum Digits" id="511" flags="8606711824" default="0" value="1"/></parameter>'
                '<parameter name="Basic" id="2000" flags="12884938770" factoryID="1"><parameter name="Substance" id="3001926012" flags="12884906002" factoryID="23"><parameter name="Color" id="1" flags="4295004162"><foldFlags>15</foldFlags></parameter>'
                '<parameter name="Opacity" id="2" flags="4295000066" default="1" value="1"/></parameter></parameter></parameter></scenenode>')

    # ---- drop zones
    def drop_zone(self, name='Effect Source', filters=(), clip_name=None, dz_type=3, flags='81621221392', **kw):
        """Effect Source (effects) / Title Background (titles): the clip the template is applied to."""
        cid, sid = self.nid(), self.nid()
        self.clips.append(
            f'<clip name="{esc(clip_name or name)}" id="{cid}"><pathURL>Drop Zone.tiff</pathURL><missingWidth>1200</missingWidth><missingHeight>1200</missingHeight>'
            '<missingDuration>0.033333333333333333</missingDuration><creationDuration>1</creationDuration><mediaID></mediaID>'
            f'<flags>0</flags><timing in="{t(0)}" out="{t(0)}" offset="0 1 1 0"/><baseFlags>524304</baseFlags><parameter name="Properties" id="1" flags="8589938704"/>'
            '<parameter name="Object" id="2" flags="8589938704"/></clip>')
        media = f'<parameter name="Media" id="324" flags="8589938704"><parameter name="Source Media" id="300" flags="{flags}" default="{cid}" value="{cid}"/></parameter>'
        fx = ''
        fx += self._filters(filters)
        pubs = kw.pop('pub', None)
        if pubs:
            for channel, label in pubs:
                self.pub(sid, channel, label)
        rigs = kw.pop('rigs', None)
        return self._wrap_rigs(f'<scenenode name="{esc(name)}" id="{sid}" factoryID="{F_IMAGE}" version="5"><validTracks>1</validTracks><aspectRatio>1</aspectRatio><flags>0</flags>'
                f'{self.timing}<foldFlags>16384</foldFlags><baseFlags>524304</baseFlags>{self.props(extra=media, **kw)}'
                '<parameter name="Object" id="2" flags="8589938704"><parameter name="Drop Zone" id="311" flags="8589934738" default="0" value="1"/>'
                f'<parameter name="Type" id="321" flags="8590000146" default="0" value="{dz_type}"/><parameter name="Width" id="313" flags="8589934610" default="1" value="{self.w}"/>'
                f'<parameter name="Height" id="314" flags="8589934610" default="1" value="{self.h}"/></parameter>{fx}</scenenode>', name, rigs)

    def transition_zone(self, which, filters=(), **kw):
        """Transition A (outgoing) / Transition B (incoming), copied from Apple's Push (retime curves included)."""
        src = open(os.path.join(HERE, 'ref', f'push_Transition_{which}.xml'), encoding='utf-8').read()
        cid, sid = self.nid(), self.nid()
        old_sid, old_cid = ('1999869843', '1999869842') if which == 'A' else ('1999869841', '1999869839')
        n = self.dur
        self.clips.append(
            f'<clip name="Transition {which}" id="{cid}"><pathURL>Drop Zone Transition {which}.tiff</pathURL><missingWidth>1200</missingWidth><missingHeight>1200</missingHeight>'
            '<missingDuration>0.033333333333333333</missingDuration><creationDuration>1</creationDuration><mediaID></mediaID><flags>0</flags>'
            '<timing in="0 1 1 0" out="0 120000 1 0" offset="0 1 1 0"/><foldFlags>0</foldFlags><baseFlags>524304</baseFlags><parameter name="Properties" id="1" flags="8589938704"/>'
            '<parameter name="Object" id="2" flags="8589938704"><parameter name="Pixel Aspect Ratio" id="104" flags="12884901888" default="1" value="1"/>'
            '<parameter name="Frame Rate" id="107" flags="8589934592" default="0" value="30"/><parameter name="Fixed Width" id="114" flags="12884901888" default="600" value="600"/>'
            '<parameter name="Fixed Height" id="115" flags="12884901888" default="600" value="600"/><parameter name="Use Background Color" id="116" flags="8589934594" default="0" value="0"/>'
            '<parameter name="Background Color" id="117" flags="8589971458"><foldFlags>15</foldFlags><parameter name="Red" id="1" flags="8589967376" default="1" value="1"/>'
            '<parameter name="Green" id="2" flags="8589967376" default="1" value="1"/><parameter name="Blue" id="3" flags="8589967376" default="1" value="1"/></parameter>'
            '<parameter name="Missing Is Still" id="128" flags="8589934610" default="0" value="1"/></parameter></clip>')
        s = src.replace(f'id="{old_sid}" factoryID="6"', f'id="{sid}" factoryID="{F_IMAGE}"').replace(f'default="{old_cid}" value="{old_cid}"', f'default="{cid}" value="{cid}"')
        assert f'id="{sid}" factoryID="{F_IMAGE}"' in s
        s = s.replace('<enabled>0</enabled>', '')
        node_rigs = kw.pop('rigs', None)
        # our transform goes in front of the Apple properties (Push's own Transform block was removed from the ref copy)
        props = self.props(**kw)
        inner = props[len('<parameter name="Properties" id="1" flags="8589938704">'):-len('</parameter>')]
        s = s.replace('<parameter name="Properties" id="1" flags="8589938704">', '<parameter name="Properties" id="1" flags="8589938704">' + inner, 1)
        fx = ''
        fx += self._filters(filters)
        s = s.rstrip()
        assert s.endswith('</scenenode>')
        return self._wrap_rigs(s[:-len('</scenenode>')] + fx + '</scenenode>', f'Transition {which}', node_rigs)

    # ---- rig pop-ups (Apple pattern: snapshot named after the channel, Apple channel types)
    CH = {'X': ('./1/100/101/1', 'X', 'FLOAT', -6000, 6000), 'Y': ('./1/100/101/2', 'Y', 'FLOAT', -6000, 6000),
          'SX': ('./1/100/105/1', 'X', 'FLOAT', -100, 100), 'SY': ('./1/100/105/2', 'Y', 'FLOAT', -100, 100),
          'Opacity': ('./1/200/202', 'Opacity', 'PERCENT', 0, 1)}
    IMAGE_UUID, GEN_UUID = '66fc0d6af6a911d6a7a7000393670732', '615c4bf6406511d88802000a95af90f2'

    def rig_links(self, target, affects, wid, snaps, mode='bezier'):
        """snaps: {'X'|'Y'|'SX'|'SY'|'Opacity': [snapshot per pop-up entry (number or keys)]} -> Rig Behaviors xml."""
        out = ''
        for k, per_entry in snaps.items():
            ch, name, ctype, lo, hi = self.CH[k]
            out += self.link(wid, target, affects, ch, name, FLOAT if ctype == 'FLOAT' else PERCENT, per_entry, lo, hi, mode)
        return out

    def rig_wrap(self, name, child, wid, snaps, mode='bezier', **kw):
        """Nested wrapper layers, ONE rig behavior (one channel) per layer — Motion crashes when several
        rig behaviors sit on the same object. kw (anchor, x, y …) goes on every wrapper."""
        xml = child
        for k in reversed(list(snaps)):
            gid = self.nid()
            ch, cname, ctype, lo, hi = self.CH[k]
            link = self.link(wid, gid, GROUP_UUID, ch, cname, FLOAT if ctype == 'FLOAT' else PERCENT, snaps[k], lo, hi, mode)
            xml = self.group(f'{name} {cname if k in ("X", "Y") else k}', [xml], gid=gid, filters=link, **kw)
        return xml

    def rig_group(self, name, children, wid, snaps, mode='bezier', **kw):
        """Children grouped, then wrapped in single-channel rig layers driven by pop-up `wid`."""
        return self.rig_wrap(name, self.group(name, children), wid, snaps, mode, **kw)

    def popup(self, label, entries, initial=0):
        wid = self.nid()
        self.rigs.append((wid, label, entries, initial))
        self.pub(wid, './2/100', label)
        return wid

    def link(self, wid, target, affects, channel, snap_name, ctype, snaps, lo, hi, mode='bezier'):
        parts = []
        for i, v in enumerate(snaps, 1):
            c = (curve_xml(v, lo, hi, mode) if isinstance(v, list)
                 else f'<curve type="1" default="0" value="{v}"><min>{lo}</min><max>{hi}</max></curve>')
            parts.append(f'<parameter name="{snap_name}" id="{i}" factoryID="{ctype}"><flags>8606711824</flags>{c}</parameter>')
        bid = self.nid()
        return (f'<behavior name="Rig Behavior {bid}" id="{bid}" factoryID="{F_RIGB}">'
                f'<channelBehavior affectingFactory="{affects}" affectingChannel="{channel}" sliderRange="{len(snaps) - 1}"/>{self.timing}'
                '<baseFlags>8589934610</baseFlags>'
                f'<parameter name="Affecting Object (Hidden)" id="199" flags="8590000146" default="0" value="{target}"/>'
                f'<parameter name="Widget" id="200" flags="8590000144" default="0" value="{wid}"/>'
                f'<parameter name="Snapshots" id="202" flags="8590004242"><flags>8590004242</flags>{"".join(parts)}</parameter></behavior>')

    def _node_rigs(self, sid, uuid, rigs):
        return ''          # node-level rigs are applied as wrapper layers by _wrap_rigs (see below)

    def _wrap_rigs(self, xml, name, rigs):
        for r in rigs or []:
            wid, snaps = r[0], r[1]
            mode = r[2] if len(r) > 2 else 'bezier'
            kw = r[3] if len(r) > 3 else {}
            xml = self.rig_wrap(name, xml, wid, snaps, mode, **kw)
        return xml

    def _filters(self, filters):
        """Emit filters (and their pop-up rigs / published params)."""
        fx = ''
        for flt in filters:
            fid = self.nid()
            fx += flt.xml(fid, self.timing)
            for p, label in flt.pub:
                self.pub(fid, './' + p, label)
            if flt.rig:
                wid, path, name, snaps, lo, hi = flt.rig
                fx += self.link(wid, fid, FILTER_UUID, './' + path, name, FLOAT, snaps, lo, hi)
        return fx

    def _rig_xml(self, xml):
        if not self.rigs:
            return ''
        never = '<timing in="0 1 1 0" out="-4004 120000 1 0" offset="0 1 1 0"/>'
        out = ''
        for wid, label, entries, initial in self.rigs:
            n = len(entries)
            count = 2            # <affecting> is the widget TYPE (1 checkbox, 2 pop-up, 3 slider), not a count
            snaps = ''.join(f'<parameter name="Snapshots" id="{i + 1}" flags="8589938704"><parameter name="Value" id="1" flags="8589934608" default="0" value="{i}"/>'
                            '<parameter name="Interpolation" id="2" flags="8590000144" default="1" value="1"/></parameter>' for i in range(n))
            opts = f'<parameter name="Options" id="103" flags="8589938688"><parameter name="Initial Value" id="106" flags="8606777360" default="0" value="{initial}"/></parameter>'
            val = (f'<parameter name="{esc(label)}" id="100" flags="8606777360" default="0" value="{initial}">'
                   + ''.join(f'<entry name="{esc(e)}" tag="{i}"/>' for i, e in enumerate(entries)) + '</parameter>')
            out += (f'<scenenode name="{esc(label)}" id="{wid}" factoryID="{F_RIGW}" version="5"><affecting>{count}</affecting>'
                    + ''.join(f'<snapshot>{i + 1}</snapshot>' for i in range(n)) +
                    f'<flags>0</flags>{never}<foldFlags>0</foldFlags><baseFlags>524304</baseFlags><parameter name="Properties" id="1" flags="8589938704"/>'
                    f'<parameter name="Object" id="2" flags="8589938704">{opts}<parameter name="Hidden" id="102" flags="8589934608" default="0" value="0"/>'
                    f'<parameter name="Snapshots" id="101" flags="8589938706">{snaps}</parameter>{val}</parameter></scenenode>')
        return (f'<scenenode name="Rig" id="10010" factoryID="{F_RIG}" version="5">{out}<flags>0</flags>{never}<foldFlags>1</foldFlags>'
                '<baseFlags>524304</baseFlags><parameter name="Properties" id="1" flags="8589938704"/><parameter name="Object" id="2" flags="8589938704"/></scenenode>')

    # ---- file
    def xml(self, body, current=None):
        project = (f'<scenenode name="Project" id="10001" factoryID="{F_PROJECT}" version="5"><scenenode name="Widget" id="10002" factoryID="{F_WIDGET}" version="5">'
                   '<flags>0</flags><timing in="0 1 1 0" out="-4004 120000 1 0" offset="0 1 1 0"/><baseFlags>16</baseFlags><parameter name="Properties" id="1" flags="8589938704"/>'
                   '<parameter name="Object" id="2" flags="8589938704"><parameter name="Options" id="103" flags="8589938688"/><parameter name="Hidden" id="102" flags="8589934608" default="0" value="1"/>'
                   '<parameter name="Snapshots" id="101" flags="8589938706"/><parameter name="Widget" id="100" flags="8589934608" default="1.7777777777777777" value="1.7777777777777777"/>'
                   '</parameter></scenenode><flags>0</flags><timing in="0 1 1 0" out="-4004 120000 1 0" offset="0 1 1 0"/><baseFlags>268435473</baseFlags>'
                   '<parameter name="Properties" id="1" flags="8589938704"><parameter name="HDR White Level" id="103" default="0.95" value="0.95"/></parameter>'
                   '<parameter name="Object" id="2" flags="8589938704"/></scenenode>')
        footage = ''
        if self.clips:
            footage = (f'<footage name="Media Layer" id="10006">{"".join(self.clips)}<flags>0</flags><timing in="{t(0)}" out="{t(-1)}" offset="0 1 1 0"/><baseFlags>524304</baseFlags>'
                       '<parameter name="Properties" id="1" flags="8589938704"/><parameter name="Object" id="2" flags="8589938704"/></footage>')
        markers = ''.join(f'<timemarker><inpoint>{t(f)}</inpoint><color>1</color><type>{ty}</type></timemarker>' for f, ty in sorted(self.markers))
        if current is None:
            current = self.markers[-1][0] if self.markers else self.dur // 2
            for f, ty in self.markers:
                if ty == 8:
                    current = f
        return ('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE ozxmlscene>\n<ozml version="5.13">\n<displayversion>5.6.3.1</displayversion>\n' + FACTORY_XML +
                f'<scene><sceneSettings><width>{self.w}</width><height>{self.h}</height>'
                f'<duration>{self.dur}</duration><shouldOverrideFCDuration>0</shouldOverrideFCDuration><frameRate>30</frameRate><NTSC>1</NTSC><pixelAspectRatio>1</pixelAspectRatio>'
                '<workingGamut>0</workingGamut><viewGamut>-1</viewGamut><backgroundColor red="0" green="0" blue="0" alpha="1"/><audioChannels>2</audioChannels>'
                '<audioBitsPerSample>32</audioBitsPerSample><fieldRenderingMode>0</fieldRenderingMode><motionBlurSamples>8</motionBlurSamples><motionBlurDuration>1</motionBlurDuration>'
                '<sharpScaling>0</sharpScaling><startTimecode>0</startTimecode><presetPath></presetPath><backgroundMode>0</backgroundMode><parameterColorSpaceID>3</parameterColorSpaceID>'
                f'<savePreviewMovie>0</savePreviewMovie></sceneSettings><publishSettings><version>2</version>{"".join(self.pubs)}</publishSettings>'
                f'<currentFrame>{t(current)}</currentFrame><timeRange offset="0 1 1 0" duration="{t(self.dur)}"/><playRange offset="0 1 1 0" duration="{t(self.dur)}"/>'
                f'<flags>1</flags><audioTracks>0</audioTracks><timemarkerset>{markers}</timemarkerset><guideset/><curvesets selected="1"/>'
                + project + self._rig_xml(body) + body + footage + '</scene>\n</ozml>\n')

    def write(self, body, thumb_svg=None, current=None):
        xml = self.xml(body, current)
        validate(self.name, xml)
        folder = os.path.join(OUT, self.KIND_DIR[self.kind] + '.localized', PREFIX + self.folder, self.name)
        shutil.rmtree(folder, ignore_errors=True)
        os.makedirs(folder)
        open(os.path.join(folder, f'{self.name}.{self.EXT[self.kind]}'), 'w', encoding='utf-8').write(xml)
        if self.media_used:
            os.makedirs(os.path.join(folder, 'Media'))
            for fn in sorted(self.media_used):
                shutil.copy(os.path.join(MEDIA, fn), os.path.join(folder, 'Media', fn))
        if thumb_svg:
            thumb(folder, thumb_svg)
        print('built', self.KIND_DIR[self.kind], '›', PREFIX + self.folder, '›', self.name)
        return folder


# Final Cut Pro renders a layer (or a whole title) invisible/black when a PUBLISHED channel is also keyframed
# (seen 2026-10-13: Academy Intro with a published fade-out, logos with published + animated opacity).
# So a published channel that is animated is moved to a plain wrapper group that carries the published copy.
PUB_CH = {'./1/200/202': ('Opacity',), './1/100/101': ('X', 'Y'), './1/100/105': ('SX', 'SY')}


def _split_published_anim(method):
    def wrapper(self, *a, **kw):
        anim, pubs = kw.get('anim') or {}, kw.get('pub')
        moved = []
        if pubs and anim:
            keep = []
            for ch, label in pubs:
                (moved if any(k in anim for k in PUB_CH.get(ch, ())) else keep).append((ch, label))
            kw['pub'] = keep
        xml = method(self, *a, **kw)
        return self.group('Controls', [xml], pub=moved) if moved else xml
    wrapper.__name__ = method.__name__
    return wrapper


for _m in ('group', 'image', 'solid', 'text', 'number', 'drop_zone'):
    setattr(Doc, _m, _split_published_anim(getattr(Doc, _m)))


def validate(name, xml):
    minidom.parseString(xml.encode())
    ids = re.findall(r'<(?:scenenode|layer|footage|clip|behavior|filter|style)\b[^>]*\bid="(\d+)"', xml)
    dup = {i for i in ids if ids.count(i) > 1}
    assert not dup, f'{name}: duplicate ids {dup}'
    objs = set(ids)
    for obj in re.findall(r'<target object="(\d+)"', xml):
        assert obj in objs, f'{name}: publishes missing object {obj}'
    facs = set(re.findall(r'<factory id="(\d+)"', xml))
    for f in set(re.findall(r'factoryID="(\d+)"', xml)) - {'0'}:
        assert f in facs, f'{name}: unknown factory {f}'
    pairs = re.findall(r'affectingChannel="([^"]+)".*?Affecting Object \(Hidden\)" id="199" flags="\d+" default="0" value="(\d+)"', xml, re.S)
    for ch, target in pairs:
        assert target in objs, f'{name}: rig targets missing object {target}'
        assert '/100/102' not in ch, f'{name}: rotation rig'
    for wid in re.findall(r'<parameter name="Widget" id="200" flags="\d+" default="0" value="(\d+)"', xml):
        assert wid in objs, f'{name}: rig uses missing widget {wid}'
    for m in re.finditer(r'<styleRun style="\d+" offset="0" length="(\d+)"/>.*?<text>(.*?)</text>', xml, re.S):
        assert int(m.group(1)) == len(html.unescape(m.group(2))), f'{name}: styleRun length'


# ------------------------------------------------------------------ thumbnails
def thumb_svg(title, kind, glyph='', sub=''):
    """640x360 card in the design-system look. glyph: extra svg drawn in the middle band."""
    title = esc(title.upper())
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 -140 640 640"><rect y="-140" width="640" height="640" fill="{CANVAS}"/>'
            f'{glyph}'
            f'<text x="32" y="300" fill="{WHITE}" font-family="Geist, Helvetica" font-weight="600" font-size="34">{title}</text>'
            f'<text x="32" y="334" fill="{MUTED}" font-family="Geist Mono, Menlo" font-size="17" letter-spacing="3">{esc((sub or kind).upper())}</text>'
            f'<circle cx="596" cy="40" r="10" fill="{ACCENT}"/></svg>')


def thumb(folder, svg):
    tmp = tempfile.mkdtemp()
    open(os.path.join(tmp, 't.svg'), 'w').write(svg)
    subprocess.run(['qlmanage', '-t', '-s', '640', '-o', tmp, os.path.join(tmp, 't.svg')], capture_output=True)
    subprocess.run(['sips', '-c', '360', '640', os.path.join(tmp, 't.svg.png'), '--out', os.path.join(folder, 'large.png')], capture_output=True)
    shutil.rmtree(tmp, ignore_errors=True)
