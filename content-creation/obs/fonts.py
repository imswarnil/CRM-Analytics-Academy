"""fonts.py — static cuts of Schibsted Grotesk for OBS, installed to ~/Library/Fonts as "CRMA Grotesk".

OBS's text source (FreeType) only sees the default instance of a variable font, so Schibsted Grotesk
would always draw as Regular. This writes the Black, ExtraBold and Bold instances as ordinary static
fonts under a family name of their own, so they never clash with the variable original.
Schibsted Grotesk is SIL OFL 1.1 with no Reserved Font Name; the copyright and licence travel along.

    python3 content-creation/obs/fonts.py      (pnpm obs:install runs it; needs: pip install fonttools)
"""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = os.path.expanduser('~/Library/Fonts/SchibstedGrotesk.ttf')
DEST = os.path.expanduser('~/Library/Fonts')
FAMILY = 'CRMA Grotesk'
CUTS = [('Black', 900), ('ExtraBold', 800), ('Bold', 700)]

if not os.path.exists(SRC):
    sys.exit(f'! {SRC} not found: install Schibsted Grotesk from fonts.google.com first')

for style, weight in CUTS:
    font = instancer.instantiateVariableFont(TTFont(SRC), {'wght': weight})
    name = font['name']
    ps = f"{FAMILY.replace(' ', '')}-{style}"
    for rec in list(name.names):
        if rec.nameID in (16, 17, 21, 22, 25) or rec.nameID >= 256:
            name.removeNames(nameID=rec.nameID)
    for nid, value in ((1, FAMILY), (2, 'Regular' if style == 'Regular' else style), (3, f'{ps};CRMA'), (4, f'{FAMILY} {style}'), (6, ps),
                       (16, FAMILY), (17, style)):
        name.setName(value, nid, 3, 1, 0x409)
    name.names = [r for r in name.names if r.platformID == 3]  # one set of names, no stale Mac-platform ones
    # a static cut in the family's own style slot; ordinary apps then list Black, ExtraBold and Bold
    name.setName(f'{FAMILY} {style}', 1, 3, 1, 0x409)
    name.setName('Regular', 2, 3, 1, 0x409)
    font['OS/2'].usWeightClass = weight
    font['OS/2'].fsSelection = (font['OS/2'].fsSelection & ~0b1100001) | 0b1000000  # REGULAR bit, not bold/italic
    font['head'].macStyle = 0
    out = os.path.join(DEST, f'{ps}.ttf')
    font.save(out)
    print('installed', out)
