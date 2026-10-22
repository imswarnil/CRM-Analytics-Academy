"""media.py — draws every PNG the kit uses into ../media (white shapes get their colour from a Colorize filter).

    python media.py
"""
import os, math, random, subprocess, glob
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(os.path.dirname(HERE), 'media')
ICONS = os.environ.get('ICONS_DIR', os.path.expanduser('~/Swarnil/icons.imswarnil.com/icons'))   # sibling repo icons.imswarnil.com
os.makedirs(MEDIA, exist_ok=True)
W = (255, 255, 255, 255)


def save(im, name):
    im.save(os.path.join(MEDIA, name), optimize=True)


def canvas(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


def rounded(w, h, r, name, pad=0):
    im = canvas(w + pad * 2, h + pad * 2)
    ImageDraw.Draw(im).rounded_rectangle((pad, pad, pad + w - 1, pad + h - 1), r, fill=W)
    save(im, name)


def ring(w, h, r, stroke, name):
    im = canvas(w, h)
    ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), r, outline=W, width=stroke)
    save(im, name)


def circle(d, name, stroke=0):
    im = canvas(d, d)
    if stroke:
        ImageDraw.Draw(im).ellipse((stroke / 2, stroke / 2, d - stroke / 2 - 1, d - stroke / 2 - 1), outline=W, width=stroke)
    else:
        ImageDraw.Draw(im).ellipse((0, 0, d - 1, d - 1), fill=W)
    save(im, name)


def cover(w, h, hole, r, name, border=0):
    """Filled canvas with a rounded hole (x, y, w, h); optional ring around the hole drawn in the same white."""
    im = Image.new('RGBA', (w, h), W)
    d = ImageDraw.Draw(im)
    x, y, hw, hh = hole
    d.rounded_rectangle((x, y, x + hw - 1, y + hh - 1), r, fill=(0, 0, 0, 0))
    save(im, name)


# ------------------------------------------------------------------ shapes
rounded(1200, 240, 24, 'round_1200x240.png')          # lower-third panel
rounded(900, 150, 20, 'round_900x150.png')
rounded(600, 120, 60, 'pill_600x120.png')             # pill tag
rounded(400, 96, 48, 'pill_400x96.png')
rounded(1400, 320, 28, 'panel_1400x320.png')          # glass panel
rounded(1200, 700, 32, 'panel_1200x700.png')          # card panel
rounded(160, 160, 24, 'keycap.png')                   # keyboard key
rounded(8, 160, 4, 'bar_v.png')                       # thin vertical accent bar
rounded(1920, 8, 4, 'bar_h.png')
rounded(1920, 24, 12, 'bar_24.png')                   # progress track / fill
circle(64, 'dot_64.png')
circle(32, 'dot_32.png')
circle(64, 'ring_64.png', 6)
circle(240, 'ring_240.png', 10)
ring(800, 450, 0, 6, 'box_800x450.png')               # focus box outline
ring(1200, 200, 24, 6, 'outline_1200x200.png')

# corner bracket (top-left), 160 px, stroke 10
im = canvas(160, 160)
d = ImageDraw.Draw(im)
d.rounded_rectangle((0, 0, 159, 9), 4, fill=W)
d.rounded_rectangle((0, 0, 9, 159), 4, fill=W)
save(im, 'bracket.png')

# crosshair 400 px
im = canvas(400, 400)
d = ImageDraw.Draw(im)
for a, b in ((0, 150), (250, 400)):
    d.rectangle((a, 197, b, 203), fill=W)
    d.rectangle((197, a, 203, b), fill=W)
d.ellipse((140, 140, 260, 260), outline=W, width=6)
d.ellipse((192, 192, 208, 208), fill=W)
save(im, 'crosshair.png')

# arrow (points right) 600 x 120
im = canvas(600, 120)
d = ImageDraw.Draw(im)
d.rounded_rectangle((0, 54, 520, 66), 6, fill=W)
d.polygon([(600, 60), (500, 10), (500, 110)], fill=W)
save(im, 'arrow.png')

# pointer: dot + diagonal line + horizontal shelf (callout leader) 520 x 300
im = canvas(520, 300)
d = ImageDraw.Draw(im)
d.ellipse((0, 270, 30, 300), fill=W)
d.line((15, 285, 190, 110), fill=W, width=6)
d.line((190, 110, 520, 110), fill=W, width=6)
save(im, 'pointer.png')

# sparkle (4-point star) 200 px
im = canvas(200, 200)
d = ImageDraw.Draw(im)
pts = []
for i in range(8):
    a = math.pi / 4 * i - math.pi / 2
    r = 98 if i % 2 == 0 else 22
    pts.append((100 + r * math.cos(a), 100 + r * math.sin(a)))
d.polygon(pts, fill=W)
save(im, 'sparkle.png')

# tear drop 120 x 180
im = canvas(120, 180)
d = ImageDraw.Draw(im)
d.polygon([(60, 0), (112, 110), (8, 110)], fill=W)
d.ellipse((8, 60, 112, 164), fill=W)
save(im, 'tear.png')

# rain streaks tile 1920 x 1080 (soft)
im = canvas(1920, 1080)
d = ImageDraw.Draw(im)
rnd = random.Random(4)
for _ in range(260):
    x, y, l = rnd.randint(0, 1919), rnd.randint(0, 1079), rnd.randint(60, 220)
    d.line((x, y, x - 18, y + l), fill=(255, 255, 255, rnd.randint(70, 160)), width=2)
save(im.filter(ImageFilter.GaussianBlur(0.8)), 'rain.png')

# ------------------------------------------------------------------ frames (1920 x 1080 covers)
cover(1920, 1080, (96, 96, 1728, 888), 40, 'card_cover.png')                    # rounded card with 96 px margin
cover(1920, 1080, (240, 72, 1440, 1008), 0, 'browser_cover.png')                # window area under a 72 px bar
# browser: dots and address pill drawn separately (keep their own colours)
im = canvas(1920, 1080)
d = ImageDraw.Draw(im)
d.rounded_rectangle((240, 0, 1679, 1079), 28, fill=W)
d.rounded_rectangle((240, 72, 1679, 1079), 0, fill=(0, 0, 0, 0))
d.rectangle((240, 72, 1679, 100), fill=(0, 0, 0, 0))
save(im, 'browser_chrome.png')
im = canvas(1920, 1080)
d = ImageDraw.Draw(im)
for i, c in enumerate(((255, 95, 87, 255), (254, 188, 46, 255), (40, 200, 64, 255))):
    d.ellipse((272 + i * 34, 26, 292 + i * 34, 46), fill=c)
d.rounded_rectangle((560, 18, 1360, 54), 18, fill=(255, 255, 255, 38))
save(im, 'browser_dots.png')
# phone: full cover with a 9:19.5 hole, plus a separate bezel ring
PW, PH = 440, 950
px, py = (1920 - PW) // 2, (1080 - PH) // 2
cover(1920, 1080, (px, py, PW, PH), 64, 'phone_cover.png')
im = canvas(1920, 1080)
d = ImageDraw.Draw(im)
d.rounded_rectangle((px - 14, py - 14, px + PW + 13, py + PH + 13), 76, outline=W, width=14)
d.rounded_rectangle((px + PW // 2 - 70, py + 18, px + PW // 2 + 70, py + 48), 15, fill=W)
save(im, 'phone_bezel.png')

# ------------------------------------------------------------------ textures (1920 x 1080)
im = canvas(1920, 1080)
d = ImageDraw.Draw(im)
for x in range(0, 1920, 40):
    for y in range(0, 1080, 40):
        d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=W)
save(im, 'grid_dots.png')
im = canvas(1920, 1080)
d = ImageDraw.Draw(im)
for x in range(0, 1920, 40):
    d.line((x, 0, x, 1080), fill=W, width=1)
for y in range(0, 1080, 40):
    d.line((0, y, 1920, y), fill=W, width=1)
save(im, 'grid_lines.png')

# grain: random luminance, 50 % alpha, tiled 4x so it can jump around
im = Image.effect_noise((960, 540), 64).convert('L')
g = Image.new('RGBA', (1920, 1080))
for x in (0, 960):
    for y in (0, 540):
        g.paste(Image.merge('RGBA', (im, im, im, Image.new('L', im.size, 140))), (x, y))
save(g, 'grain.png')

# vignette: black, transparent middle (radial)
im = Image.new('L', (1920, 1080), 0)
d = ImageDraw.Draw(im)
for i in range(60):
    k = i / 59
    d.ellipse((-400 + 1150 * k * 0.8, -400 + 700 * k * 0.8, 2320 - 1150 * k * 0.8, 1480 - 700 * k * 0.8), fill=int(255 * (1 - k) ** 1.6))
im = im.filter(ImageFilter.GaussianBlur(60))
save(Image.merge('RGBA', (Image.new('L', im.size, 0),) * 3 + (im,)), 'vignette.png')

# spotlight: white soft blob
im = Image.new('L', (1920, 1080), 0)
ImageDraw.Draw(im).ellipse((560, 140, 1360, 940), fill=255)
im = im.filter(ImageFilter.GaussianBlur(160))
save(Image.merge('RGBA', (Image.new('L', im.size, 255),) * 3 + (im,)), 'spot.png')

# light leak: warm diagonal blobs (keeps its own colour)
im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0))
d = ImageDraw.Draw(im)
d.ellipse((1200, -300, 2400, 700), fill=(255, 120, 60, 200))
d.ellipse((1500, 300, 2300, 1300), fill=(255, 40, 80, 150))
d.ellipse((-300, 500, 700, 1500), fill=(255, 180, 90, 120))
save(im.filter(ImageFilter.GaussianBlur(140)), 'leak.png')

# accent gradient background (red -> near black diagonal)
im = Image.new('RGBA', (1920, 1080))
px_ = im.load()
for y in range(1080):
    for x in range(0, 1920, 1):
        k = max(0.0, min(1.0, (x / 1920 * 0.6 + y / 1080 * 0.4)))
        px_[x, y] = (int(242 * (1 - k) + 10 * k), int(47 * (1 - k) + 10 * k), int(70 * (1 - k) + 10 * k), 255)
save(im.resize((1920, 1080)), 'gradient_accent.png')

# ------------------------------------------------------------------ icons (white, 512 px) from the icon set
n = 0
for svg in sorted(glob.glob(os.path.join(ICONS, '*', '*.svg'))):
    cat, fn = svg.split(os.sep)[-2], os.path.basename(svg)[:-4]
    s = open(svg, encoding='utf-8').read().replace('currentColor', '#ffffff')
    tmp = os.path.join(MEDIA, '_tmp.svg')
    open(tmp, 'w').write(s)
    subprocess.run(['/opt/homebrew/bin/rsvg-convert', '-w', '512', '-h', '512', tmp, '-o', os.path.join(MEDIA, f'icon_{fn}.png')], check=True)
    n += 1
os.remove(tmp)
print('icons', n)
print('media files', len(os.listdir(MEDIA)))
