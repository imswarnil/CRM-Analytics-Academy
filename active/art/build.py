"""Draws the SVG icons, scenes and Pixelmator templates in the site's design.

    python3 active/art/build.py

Every file is plain SVG: open in Pixelmator Pro (each element is its own
layer, text stays editable), Figma or a browser.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
PIX = os.path.join(os.path.dirname(HERE), 'pixelmator')
NAVY, NAVY9, SIGNAL, BRIGHT, LIGHT, PALE = '#032D60', '#001A3E', '#0176D3', '#1B96FF', '#7CBEFF', '#B0D7FF'
WHITE, PAGE, INK, LINE = '#FFFFFF', '#F4F6F8', '#181818', '#DDDBDA'
FONT = "font-family=\"Switzer, Figtree, Helvetica, sans-serif\""


def write(path, svg):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w').write(svg)
    print('wrote', os.path.relpath(path, os.path.dirname(HERE)))


# ------------------------------------------------------------------ icons (24 grid, 2px stroke, currentColor)
ICONS = {
    'dataset': '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    'recipe': '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 6h3a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3h1M7 18h3a3 3 0 0 0 3-3v0a3 3 0 0 1 3-3"/>',
    'dashboard': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/><path d="M12 17v-3M15 17v-5M18 17v-2"/>',
    'kpi': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 14l3-3 2 2 5-5"/><path d="M14 8h3v3"/>',
    'snapshot': '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6l1.5-3h5L16 6"/><circle cx="12" cy="13" r="3.5"/>',
    'change': '<path d="M3 17l5-5 4 4 8-8"/><path d="M14 8h6v6"/><path d="M3 21h18"/>',
    'funnel': '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
    'adoption': '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 11l2 2 4-4"/>',
    'object': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16M8 12h8M8 16h5"/>',
    'relationship': '<rect x="2" y="3" width="8" height="6" rx="1.5"/><rect x="14" y="15" width="8" height="6" rx="1.5"/><path d="M6 9v4a2 2 0 0 0 2 2h6"/>',
    'binding': '<path d="M9 7H6a5 5 0 0 0 0 10h3M15 7h3a5 5 0 0 1 0 10h-3M8 12h8"/>',
    'embed': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 10l-2 2 2 2M15 10l2 2-2 2"/>',
}


def icons():
    for name, body in ICONS.items():
        write(os.path.join(HERE, 'icons', f'{name}.svg'),
              f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
              f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{body}</svg>\n')


# ------------------------------------------------------------------ scenes (1920x1080)
def faint_bars(x, y, s=1.0, op=0.12, color=LIGHT):
    hs = (60, 100, 80, 140, 120, 180)
    return ''.join(f'<rect x="{x + i * 34 * s}" y="{y - h * s}" width="{22 * s}" height="{h * s}" rx="3" fill="{color}" opacity="{op}"/>' for i, h in enumerate(hs))


def frame(body, bg=NAVY9):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">'
            f'<rect width="1920" height="1080" fill="{bg}"/><rect width="1920" height="10" fill="{SIGNAL}"/>{body}</svg>\n')


def scene_data_model():
    box = lambda x, y, t, fields: (f'<g><rect x="{x}" y="{y}" width="380" height="{90 + 56 * len(fields)}" rx="6" fill="{WHITE}"/>'
                                   f'<rect x="{x}" y="{y}" width="380" height="80" rx="6" fill="{SIGNAL}"/><rect x="{x}" y="{y + 70}" width="380" height="10" fill="{SIGNAL}"/>'
                                   f'<text x="{x + 28}" y="{y + 52}" {FONT} font-size="34" font-weight="700" fill="{WHITE}">{t}</text>'
                                   + ''.join(f'<text x="{x + 28}" y="{y + 130 + i * 56}" {FONT} font-size="28" fill="{INK}">{f}</text>' for i, f in enumerate(fields)) + '</g>')
    body = (faint_bars(1500, 1000) + box(220, 300, 'Account', ['Id', 'Name', 'Industry'])
            + box(770, 300, 'Opportunity', ['Id', 'AccountId', 'Amount', 'StageName'])
            + box(1320, 300, 'User', ['Id', 'Name', 'Role'])
            + f'<path d="M600 440 H770" stroke="{BRIGHT}" stroke-width="6"/><circle cx="600" cy="440" r="10" fill="{BRIGHT}"/>'
            + f'<path d="M1150 496 H1320" stroke="{LIGHT}" stroke-width="6" stroke-dasharray="14 10"/>'
            + f'<text x="220" y="200" {FONT} font-size="30" font-weight="700" letter-spacing="3" fill="{LIGHT}">THE DATA MODEL</text>')
    return frame(body)


def scene_dashboard():
    tile = lambda x, v, l: (f'<rect x="{x}" y="200" width="400" height="190" rx="6" fill="{WHITE}"/>'
                            f'<text x="{x + 32}" y="260" {FONT} font-size="24" font-weight="700" letter-spacing="2" fill="#5C5A57">{l}</text>'
                            f'<text x="{x + 32}" y="350" {FONT} font-size="76" font-weight="800" fill="{NAVY}">{v}</text>')
    bars = ''.join(f'<rect x="{240 + i * 100}" y="{900 - h}" width="64" height="{h}" rx="4" fill="{SIGNAL if i == 6 else BRIGHT}" opacity="{1 if i == 6 else .55}"/>'
                   for i, h in enumerate((180, 240, 210, 300, 280, 360, 420)))
    funnel = ''.join(f'<rect x="{1180 + i * 40}" y="{470 + i * 110}" width="{520 - i * 80}" height="86" rx="4" fill="{c}"/>'
                     for i, c in enumerate((PALE, LIGHT, BRIGHT, SIGNAL)))
    body = (tile(200, '$4.2M', 'PIPELINE') + tile(660, '31%', 'WIN RATE') + tile(1120, '68%', 'ADOPTION')
            + f'<rect x="200" y="430" width="860" height="520" rx="6" fill="#0B3B78"/>{bars}'
            + f'<rect x="1120" y="430" width="600" height="520" rx="6" fill="#0B3B78"/>{funnel}')
    return frame(body)


def scene_pipeline():
    steps = ('Source', 'Recipe', 'Dataset', 'Dashboard')
    body = f'<text x="200" y="300" {FONT} font-size="30" font-weight="700" letter-spacing="3" fill="{LIGHT}">FROM DATA TO DECISION</text>'
    for i, s in enumerate(steps):
        x = 200 + i * 410
        body += (f'<rect x="{x}" y="420" width="320" height="240" rx="6" fill="{WHITE if i < 3 else SIGNAL}"/>'
                 f'<text x="{x + 160}" y="560" {FONT} font-size="40" font-weight="700" text-anchor="middle" fill="{NAVY if i < 3 else WHITE}">{s}</text>')
        if i < 3:
            body += f'<path d="M{x + 330} 540 h70" stroke="{BRIGHT}" stroke-width="6"/><path d="M{x + 388} 528 l14 12 -14 12" fill="none" stroke="{BRIGHT}" stroke-width="6"/>'
    return frame(body + faint_bars(1500, 1000))


# ------------------------------------------------------------------ Pixelmator templates
def bars_mark(x, y, s):
    return (f'<rect x="{x}" y="{y + 40 * s}" width="{22 * s}" height="{60 * s}" rx="{4 * s}" fill="{LIGHT}"/>'
            f'<rect x="{x + 32 * s}" y="{y + 18 * s}" width="{22 * s}" height="{82 * s}" rx="{4 * s}" fill="{BRIGHT}"/>'
            f'<rect x="{x + 64 * s}" y="{y}" width="{22 * s}" height="{100 * s}" rx="{4 * s}" fill="{WHITE}"/>')


def thumbnail():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">'
            f'<rect id="background" width="1280" height="720" fill="{NAVY9}"/><rect id="top-rule" width="1280" height="12" fill="{SIGNAL}"/>'
            f'<g id="faint-chart">{faint_bars(860, 690, 1.8, 0.14)}</g>'
            f'<rect id="pill" x="64" y="64" width="210" height="56" rx="28" fill="{SIGNAL}"/>'
            f'<text id="pill-text" x="169" y="101" {FONT} font-size="26" font-weight="700" letter-spacing="2" text-anchor="middle" fill="{WHITE}">LESSON 1</text>'
            f'<text id="headline" x="64" y="330" {FONT} font-size="132" font-weight="900" fill="{WHITE}">DATA</text>'
            f'<text id="headline-2" x="64" y="460" {FONT} font-size="132" font-weight="900" fill="{BRIGHT}">MODEL</text>'
            f'<text id="subline" x="64" y="560" {FONT} font-size="40" font-weight="600" fill="{PALE}">Objects · Fields · Relationships</text>'
            f'<rect id="image-slot" x="780" y="150" width="440" height="440" rx="8" fill="#0B3B78" stroke="{LIGHT}" stroke-width="3" stroke-dasharray="12 10"/>'
            f'<text id="image-slot-label" x="1000" y="380" {FONT} font-size="26" text-anchor="middle" fill="{LIGHT}">illustration / screenshot</text>'
            f'<g id="logo">{bars_mark(64, 616, 0.5)}</g></svg>\n')


def profile():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">'
            f'<rect id="background" width="800" height="800" fill="{NAVY9}"/>'
            f'<circle id="safe-circle-guide" cx="400" cy="400" r="400" fill="{NAVY}"/>'
            f'<g id="mark">{bars_mark(250, 230, 3.3)}</g>'
            f'<text id="label" x="400" y="660" {FONT} font-size="64" font-weight="800" letter-spacing="6" text-anchor="middle" fill="{WHITE}">CRMA</text></svg>\n')


def cover():
    # 2560x1440; everything important stays inside YouTube's 1546x423 safe area (centre).
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440" viewBox="0 0 2560 1440">'
            f'<rect id="background" width="2560" height="1440" fill="{NAVY9}"/>'
            f'<g id="faint-chart-left">{faint_bars(200, 1200, 3, 0.1)}</g><g id="faint-chart-right">{faint_bars(1900, 1200, 3, 0.1)}</g>'
            f'<rect id="safe-area-guide" x="507" y="508" width="1546" height="423" fill="none" stroke="{LIGHT}" stroke-opacity=".25" stroke-dasharray="16 12"/>'
            f'<g id="mark">{bars_mark(560, 610, 2.2)}</g>'
            f'<text id="title" x="800" y="720" {FONT} font-size="104" font-weight="900" fill="{WHITE}">CRM Analytics Academy</text>'
            f'<text id="tagline" x="800" y="810" {FONT} font-size="48" font-weight="600" fill="{PALE}">Dashboards people actually use · new lessons every week</text></svg>\n')


if __name__ == '__main__':
    icons()
    write(os.path.join(HERE, 'scenes', 'data-model.svg'), scene_data_model())
    write(os.path.join(HERE, 'scenes', 'dashboard.svg'), scene_dashboard())
    write(os.path.join(HERE, 'scenes', 'data-to-decision.svg'), scene_pipeline())
    write(os.path.join(PIX, 'thumbnail.svg'), thumbnail())
    write(os.path.join(PIX, 'profile.svg'), profile())
    write(os.path.join(PIX, 'cover.svg'), cover())
