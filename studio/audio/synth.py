#!/usr/bin/env python3
"""
Original music bed and sound effects for Academy videos — synthesised from
nothing, so there is no licence to track. Standard library only.

  python3 studio/audio/synth.py music <seconds> <out.wav> [bpm] [seed]
  python3 studio/audio/synth.py sfx <out-folder>

Music: a light, bouncy I–vi–IV–V loop (marimba-like plucks, warm pad, round
bass, soft kick and shaker), two bars of intro without drums, a 2.5 s fade at
the end. The seed shifts the arpeggio pattern so each film can sound its own.

SFX: pop, boing, whoosh, ding, click, tick, type, rain — short, friendly,
cartoon-soft (the playful flat-2D explainer style).
"""
import math
import random
import struct
import sys
import wave
from array import array

SR = 48000
TAU = 2 * math.pi


def note_hz(n):
    """MIDI note number → Hz."""
    return 440.0 * 2 ** ((n - 69) / 12)


def write(path, left, right=None, peak=0.89):
    right = right if right is not None else left
    m = max(1e-9, max(max(abs(x) for x in left), max(abs(x) for x in right)))
    g = peak / m
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for a, b in zip(left, right):
            frames += struct.pack('<hh', int(max(-1, min(1, a * g)) * 32767), int(max(-1, min(1, b * g)) * 32767))
        w.writeframes(bytes(frames))


def add(buf, start, samples, gain=1.0):
    i0 = int(start * SR)
    n = min(len(samples), len(buf) - i0)
    for i in range(max(0, -i0), n):
        buf[i0 + i] += samples[i] * gain


def pluck(hz, dur=0.5, bright=0.35):
    n = int(dur * SR)
    out = array('f', [0.0]) * n
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 9) * min(1, t * 400)
        out[i] = env * (math.sin(TAU * hz * t) + bright * math.sin(TAU * hz * 4 * t) * math.exp(-t * 30))
    return out


def bass(hz, dur=0.6):
    n = int(dur * SR)
    out = array('f', [0.0]) * n
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 4) * min(1, t * 200)
        out[i] = env * (math.sin(TAU * hz * t) + 0.25 * math.sin(TAU * hz * 2 * t))
    return out


def kick():
    n = int(0.25 * SR)
    out = array('f', [0.0]) * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = 50 + 70 * math.exp(-t * 30)
        ph += TAU * f / SR
        out[i] = math.sin(ph) * math.exp(-t * 14)
    return out


def noise_burst(dur, decay, hp=True, rnd=None):
    rnd = rnd or random.Random(1)
    n = int(dur * SR)
    out = array('f', [0.0]) * n
    prev = 0.0
    for i in range(n):
        x = rnd.uniform(-1, 1)
        y = x - prev if hp else x
        prev = x
        out[i] = y * math.exp(-(i / SR) * decay)
    return out


def music(seconds, bpm=104, seed=7):
    rnd = random.Random(seed)
    beat = 60.0 / bpm
    bar = beat * 4
    L = array('f', [0.0]) * int(seconds * SR)
    R = array('f', [0.0]) * int(seconds * SR)
    # I – vi – IV – V in C, as MIDI chord tones.
    chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
    roots = [36, 33, 29, 31]
    patterns = [[0, 1, 2, 1, 0, 2, 1, 2], [0, 2, 1, 2, 0, 1, 2, 1], [2, 1, 0, 1, 2, 0, 1, 0]]
    pat = patterns[seed % len(patterns)]
    nbars = int(seconds / bar) + 1
    for b in range(nbars):
        t0 = b * bar
        c = chords[b % 4]
        # Pad: the chord, slow swell, a little detune left/right for width.
        n = int(bar * SR)
        i0 = int(t0 * SR)
        for i in range(n):
            j = i0 + i
            if j >= len(L):
                break
            t = i / SR
            env = min(1, t / 0.6) * min(1, (bar - t) / 0.4) * 0.11
            s_l = sum(math.sin(TAU * note_hz(x - 12) * 1.002 * (t0 + t)) for x in c)
            s_r = sum(math.sin(TAU * note_hz(x - 12) * 0.998 * (t0 + t)) for x in c)
            L[j] += s_l * env
            R[j] += s_r * env
        # Plucks: eighth-note arpeggio an octave up, swung slightly, panned by step.
        for k in range(8):
            if b == nbars - 1 and k > 3:
                break
            tone = c[pat[k]] + 12 + (12 if (k == 6 and rnd.random() < 0.4) else 0)
            t = t0 + k * beat / 2 + (0.02 if k % 2 else 0)
            p = pluck(note_hz(tone), 0.45)
            pan = 0.5 + 0.3 * math.sin(k)
            add(L, t, p, 0.22 * (1 - pan) * 2)
            add(R, t, p, 0.22 * pan * 2)
        # Bass on 1 and 3.
        for k in (0, 2):
            bs = bass(note_hz(roots[b % 4]), beat * 1.6)
            add(L, t0 + k * beat, bs, 0.32)
            add(R, t0 + k * beat, bs, 0.32)
        # Drums after a two-bar intro.
        if b >= 2:
            for k in (0, 2):
                kk = kick()
                add(L, t0 + k * beat, kk, 0.38)
                add(R, t0 + k * beat, kk, 0.38)
            for k in range(8):
                if k % 2:
                    sh = noise_burst(0.06, 70, rnd=rnd)
                    add(L, t0 + k * beat / 2, sh, 0.05)
                    add(R, t0 + k * beat / 2 + 0.004, sh, 0.05)
    # Fades.
    fin, fout = int(1.0 * SR), int(2.5 * SR)
    for i in range(len(L)):
        g = min(1, i / fin) * min(1, (len(L) - i) / fout)
        L[i] *= g
        R[i] *= g
    return L, R


def sweep(f0, f1, dur, decay=6, wobble=0.0, wobble_hz=0.0):
    n = int(dur * SR)
    out = array('f', [0.0]) * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = f0 * (f1 / f0) ** (t / dur)
        f *= 1 + wobble * math.sin(TAU * wobble_hz * t) * math.exp(-t * 3)
        ph += TAU * f / SR
        out[i] = math.sin(ph) * math.exp(-t * decay) * min(1, t * 300)
    return out


def whoosh(dur=0.7):
    rnd = random.Random(3)
    n = int(dur * SR)
    out = array('f', [0.0]) * n
    y = 0.0
    for i in range(n):
        t = i / dur / SR
        cutoff = 0.02 + 0.25 * math.sin(math.pi * t)
        y += cutoff * (rnd.uniform(-1, 1) - y)
        out[i] = y * math.sin(math.pi * t) ** 1.5
    return out


def ding():
    n = int(1.4 * SR)
    out = array('f', [0.0]) * n
    for i in range(n):
        t = i / SR
        out[i] = min(1, t * 500) * (math.sin(TAU * 1318.5 * t) * math.exp(-t * 3)
                                    + 0.45 * math.sin(TAU * 2637 * t) * math.exp(-t * 5)
                                    + 0.2 * math.sin(TAU * 3955 * t) * math.exp(-t * 8))
    return out


def typing(dur=2.6):
    rnd = random.Random(5)
    buf = array('f', [0.0]) * int(dur * SR)
    t = 0.0
    while t < dur - 0.05:
        add(buf, t, noise_burst(0.025, 220, rnd=rnd), rnd.uniform(0.5, 1.0))
        t += rnd.uniform(0.06, 0.14)
    return buf


def rain(dur=2.2):
    rnd = random.Random(9)
    buf = array('f', [0.0]) * int(dur * SR)
    for _ in range(26):
        f = rnd.uniform(500, 1100)
        add(buf, rnd.uniform(0, dur - 0.2), sweep(f, f * 0.45, 0.09, 30), rnd.uniform(0.3, 0.8))
    return buf


def sfx(folder):
    import os
    os.makedirs(folder, exist_ok=True)
    sounds = {
        'pop': sweep(700, 260, 0.11, 25),
        'boing': sweep(160, 420, 0.65, 3, wobble=0.25, wobble_hz=14),
        'whoosh': whoosh(),
        'ding': ding(),
        'click': noise_burst(0.02, 260),
        'tick': sweep(1900, 1700, 0.03, 120),
        'type': typing(),
        'rain': rain()
    }
    for name, s in sounds.items():
        write(os.path.join(folder, f'{name}.wav'), s, peak=0.7)
    print('sfx:', ', '.join(sounds))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'music':
        secs = float(sys.argv[2])
        bpm = float(sys.argv[4]) if len(sys.argv) > 4 else 104
        seed = int(sys.argv[5]) if len(sys.argv) > 5 else 7
        l, r = music(secs, bpm, seed)
        write(sys.argv[3], l, r)
        print(f'music: {secs:.1f}s at {bpm:g} bpm')
    elif cmd == 'sfx':
        sfx(sys.argv[2])
    else:
        print(__doc__)
