"""Regenerate lib/metrics.json: advance widths (per 1000 em) of Schibsted Grotesk at
weights 800 and 900, used by make.mjs to wrap and fit headlines. Needs fontTools.
    python3 lib/metrics.py ~/Library/Fonts/SchibstedGrotesk.ttf
"""
import json, sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

src = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Library/Fonts/SchibstedGrotesk.ttf')
chars = [chr(c) for c in range(32, 127)] + list('—–·’‘“”…→×é')
out = {}
for w in (800, 900):
    f = instantiateVariableFont(TTFont(src), {'wght': w})
    upm = f['head'].unitsPerEm
    cmap = f.getBestCmap(); hmtx = f['hmtx']
    out[str(w)] = {c: round(hmtx[cmap[ord(c)]][0] * 1000 / upm) for c in chars if ord(c) in cmap}
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'metrics.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('ok', {k: len(v) for k, v in out.items()})
