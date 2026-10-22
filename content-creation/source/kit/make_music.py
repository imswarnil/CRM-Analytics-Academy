"""make_music.py — original music & sound effects for the CRMA kit (pure Python synth + ffmpeg finishing).

120 BPM, key of C. Lengths match the intro templates (Academy Intro = 8 s, hit at 1.0 s, lockup at 5.0 s).
Output: content-creation/kit/Music/*.wav (+ .m4a). Only the .m4a files are committed; the .wav masters are gitignored.

    python make_music.py
"""
import math, os, random, struct, subprocess, sys, wave

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'kit', 'Music')
TMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build_audio')   # gitignored scratch
BEAT = 0.5
rnd = random.Random(7)


def hz(n):                       # midi note -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


class Track:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.L = [0.0] * self.n
        self.R = [0.0] * self.n

    def add(self, start, samples, gain=1.0, pan=0.0):
        i0 = int(start * SR)
        gl, gr = gain * math.cos((pan + 1) * math.pi / 4), gain * math.sin((pan + 1) * math.pi / 4)
        L, R, n = self.L, self.R, self.n
        for j, s in enumerate(samples):
            i = i0 + j
            if 0 <= i < n:
                L[i] += s * gl
                R[i] += s * gr

    def write(self, path):
        peak = max(1e-9, max(max(abs(x) for x in self.L), max(abs(x) for x in self.R)))
        k = 0.89 / peak
        with wave.open(path, 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes(b''.join(struct.pack('<hh', int(l * k * 32767), int(r * k * 32767)) for l, r in zip(self.L, self.R)))


# ------------------------------------------------------------------ voices
def env_ad(i, a, dcy):
    t = i / SR
    return t / a if t < a else math.exp(-(t - a) / dcy)


def kick(dur=0.45):
    out, ph = [], 0.0
    for i in range(int(dur * SR)):
        t = i / SR
        f = 45 + 95 * math.exp(-t * 28)
        ph += 2 * math.pi * f / SR
        out.append(math.sin(ph) * math.exp(-t * 7.5) + (0.4 * (rnd.random() * 2 - 1) * math.exp(-t * 300)))
    return out


def hat(dur=0.06, open_=False):
    out, prev = [], 0.0
    d = 0.22 if open_ else dur
    for i in range(int(d * SR)):
        x = rnd.random() * 2 - 1
        hp = x - prev; prev = x
        out.append(hp * math.exp(-i / SR / (d / 4)) * 0.5)
    return out


def pluck(note, dur=0.32, bright=1.0):
    f = hz(note)
    out = []
    for i in range(int(dur * SR)):
        t = i / SR
        e = env_ad(i, 0.003, 0.12)
        s = sum(math.sin(2 * math.pi * f * h * t) / h * math.exp(-t * 10 * h * (1.2 - bright * 0.6)) for h in (1, 2, 3, 4, 5))
        out.append(s * e * 0.5)
    return out


def pad(notes, dur, attack=0.6, release=0.9):
    out = []
    fs = [(hz(n) * dt) for n in notes for dt in (0.997, 1.003)]
    for i in range(int(dur * SR)):
        t = i / SR
        e = min(1.0, t / attack) * (1.0 if t < dur - release else max(0.0, (dur - t) / release))
        s = 0.0
        for f in fs:
            p = (f * t) % 1.0
            s += (4 * abs(p - 0.5) - 1) + 0.25 * math.sin(4 * math.pi * f * t)       # soft triangle
        out.append(s * e * 0.08)
    return out


def bass(note, dur=0.23):
    f = hz(note)
    return [(math.sin(2 * math.pi * f * i / SR) + 0.3 * math.sin(4 * math.pi * f * i / SR)) * env_ad(i, 0.004, 0.16) * 0.6 for i in range(int(dur * SR))]


def bell(note, dur=1.6):
    f = hz(note)
    return [(math.sin(2 * math.pi * f * i / SR) + 0.5 * math.sin(2 * math.pi * f * 2.76 * i / SR) * math.exp(-i / SR * 6)) * env_ad(i, 0.002, 0.5) * 0.35 for i in range(int(dur * SR))]


def noise_sweep(dur, rising=True, peak=1.0):
    """Filtered noise whose brightness & level rise (riser / whoosh)."""
    out, lp = [], 0.0
    n = int(dur * SR)
    for i in range(n):
        u = i / n if rising else 1 - i / n
        a = 0.02 + 0.5 * u * u
        lp += a * ((rnd.random() * 2 - 1) - lp)
        out.append(lp * (u ** 1.6) * peak)
    return out


def whoosh(dur=0.7):
    out, lp = [], 0.0
    n = int(dur * SR)
    for i in range(n):
        u = i / n
        shape = math.sin(math.pi * u) ** 1.5
        a = 0.03 + 0.35 * shape
        lp += a * ((rnd.random() * 2 - 1) - lp)
        out.append(lp * shape * 1.6)
    return out


def impact(dur=2.2):
    out, lp = [], 0.0
    for i in range(int(dur * SR)):
        t = i / SR
        lp += 0.08 * ((rnd.random() * 2 - 1) - lp)
        boom = math.sin(2 * math.pi * (38 + 40 * math.exp(-t * 12)) * t) * math.exp(-t * 2.2)
        out.append(boom * 0.9 + lp * math.exp(-t * 3.5) * 0.9)
    return out


def click(dur=0.05):
    return [math.sin(2 * math.pi * 2200 * i / SR) * math.exp(-i / SR * 160) * 0.7 + (rnd.random() * 2 - 1) * math.exp(-i / SR * 900) * 0.4 for i in range(int(dur * SR))]


def pop(dur=0.18):
    out, ph = [], 0.0
    for i in range(int(dur * SR)):
        t = i / SR
        ph += 2 * math.pi * (300 + 700 * math.exp(-t * 40)) / SR
        out.append(math.sin(ph) * math.exp(-t * 26))
    return out


# ------------------------------------------------------------------ harmony (C major, modern & bright)
CHORDS = {'C': [48, 55, 59, 64, 67], 'Am': [45, 52, 57, 60, 64, 71], 'F': [41, 48, 53, 57, 64], 'G': [43, 50, 55, 59, 62, 69]}
ARP = {'C': [72, 76, 79, 83, 79, 76, 72, 67], 'Am': [69, 72, 76, 79, 76, 72, 69, 64], 'F': [65, 69, 72, 76, 72, 69, 65, 60], 'G': [67, 71, 74, 79, 74, 71, 67, 62]}
ROOT = {'C': 36, 'Am': 33, 'F': 29, 'G': 31}


def bar(tr, t0, chord, drums=True, arp=True, bass_=True, pad_=True, hats=True, intensity=1.0):
    """One 4/4 bar at 120 BPM starting at t0 (2 s)."""
    if pad_:
        tr.add(t0, pad(CHORDS[chord], 2.2, 0.3, 0.5), 0.9)
    for s in range(8):                                        # eighths
        t = t0 + s * BEAT / 2
        if arp:
            tr.add(t, pluck(ARP[chord][s], 0.4, 0.8 + 0.2 * intensity), 0.34 * intensity, pan=-0.35 if s % 2 else 0.35)
        if bass_ and s % 2 == 1:
            tr.add(t, bass(ROOT[chord]), 0.55)
        if hats:
            tr.add(t, hat(open_=(s % 4 == 2)), 0.22 if s % 2 else 0.12, pan=0.25)
    if drums:
        for b in range(4):
            tr.add(t0 + b * BEAT, kick(), 0.8 if b in (0, 2) else 0.0)
            if b in (1, 3):
                tr.add(t0 + b * BEAT, [x * 0.6 for x in hat(0.12)] , 0.5)       # rim / clap-ish


def finish(tr, name, echo=True, lufs=-14, loop=None):
    os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)
    raw = os.path.join(TMP, name + '.raw.wav')
    tr.write(raw)
    wav, m4a = os.path.join(OUT, name + '.wav'), os.path.join(OUT, name + '.m4a')
    af = []
    if echo:
        af.append('aecho=0.85:0.6:83|151|229:0.22|0.14|0.08')
    af.append('highpass=f=28')
    if loop:                       # constant gain so the loop seam stays seamless
        af.append(f'atrim=start={loop[0]}:end={loop[1]},asetpts=PTS-STARTPTS,volume={lufs + 20}dB')
    else:
        af.append(f'loudnorm=I={lufs}:TP=-1.2:LRA=11')
    af.append('aresample=48000')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', ','.join(af), '-c:a', 'pcm_s24le', wav], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-c:a', 'aac', '-b:a', '256k', m4a], check=True)
    print('  ', name)


# ------------------------------------------------------------------ pieces
def academy_intro():
    """8 s. Riser 0-1 s · hit + logo at 1.0 s · groove 1-5 s · lockup chord at 5.0 s · tail to 8 s."""
    tr = Track(8.0)
    tr.add(0.0, noise_sweep(1.0), 0.55)
    tr.add(0.0, [x * 0.5 for x in pad(CHORDS['G'], 1.05, 0.9, 0.1)], 0.6)
    tr.add(1.0, impact(), 0.75)
    tr.add(1.0, bell(84), 0.5, pan=0.2)
    bar(tr, 1.0, 'C')
    bar(tr, 3.0, 'Am', intensity=1.1)
    tr.add(4.5, noise_sweep(0.5), 0.4)
    tr.add(5.0, impact(), 0.7)
    tr.add(5.0, pad(CHORDS['F'] + [72], 3.0, 0.02, 2.4), 1.3)
    for i, n in enumerate((72, 76, 79, 84)):
        tr.add(5.0 + i * 0.09, bell(n, 2.6), 0.35, pan=-0.3 + 0.2 * i)
    tr.add(5.0, kick(), 0.9)
    finish(tr, 'CRMA Academy Intro (8s)')


def academy_intro_short():
    """4 s. Riser 0-0.5 s · hit at 0.5 s · groove · lockup at 2.5 s."""
    tr = Track(4.0)
    tr.add(0.0, noise_sweep(0.5), 0.5)
    tr.add(0.5, impact(1.8), 0.7)
    tr.add(0.5, bell(84), 0.45)
    bar(tr, 0.5, 'C')
    tr.add(2.5, impact(1.5), 0.6)
    tr.add(2.5, pad(CHORDS['F'] + [72], 1.5, 0.02, 1.2), 1.3)
    for i, n in enumerate((72, 76, 79, 84)):
        tr.add(2.5 + i * 0.07, bell(n, 1.5), 0.33, pan=-0.3 + 0.2 * i)
    tr.add(2.5, kick(), 0.9)
    finish(tr, 'CRMA Academy Intro Short (4s)')


def outro():
    """6 s. Two bars, then resolve on C with a long tail (end screens)."""
    tr = Track(6.0)
    bar(tr, 0.0, 'F', intensity=0.9)
    bar(tr, 2.0, 'G', intensity=1.0)
    tr.add(3.5, noise_sweep(0.5), 0.35)
    tr.add(4.0, impact(2.0), 0.6)
    tr.add(4.0, pad(CHORDS['C'] + [76], 2.0, 0.02, 1.6), 1.3)
    tr.add(4.0, bell(84, 2.0), 0.4)
    finish(tr, 'CRMA Outro Sting (6s)')


def lesson_bed():
    """32 s seamless loop (16 bars, C-Am-F-G), soft — sits under a voice-over. Rendered 3x, middle copy kept."""
    prog = ['C', 'Am', 'F', 'G'] * 4
    tr = Track(32.0 * 3)
    for rep in range(3):
        for i, ch in enumerate(prog):
            t0 = rep * 32 + i * 2
            bar(tr, t0, ch, drums=i % 8 >= 4, arp=True, bass_=True, hats=i >= 2, intensity=0.6)
    finish(tr, 'CRMA Lesson Bed (Loop 32s)', lufs=-22, loop=(32.0, 64.0))


def sfx():
    for name, fn, secs in (('CRMA SFX Whoosh', lambda tr: tr.add(0, whoosh(0.7), 1.0), 0.8),
                           ('CRMA SFX Click', lambda tr: tr.add(0, click(), 1.0), 0.15),
                           ('CRMA SFX Pop', lambda tr: tr.add(0, pop(), 1.0), 0.25),
                           ('CRMA SFX Riser', lambda tr: (tr.add(0, noise_sweep(1.5), 1.0), tr.add(1.5, impact(1.2), 0.8)), 2.8),
                           ('CRMA SFX Logo Hit', lambda tr: (tr.add(0, impact(), 0.8), tr.add(0, bell(84), 0.5)), 2.4)):
        tr = Track(secs)
        fn(tr)
        finish(tr, name, echo=name.endswith(('Logo Hit', 'Riser', 'Whoosh')), lufs=-16)


if __name__ == '__main__':
    which = sys.argv[1:] or ['intro', 'short', 'outro', 'bed', 'sfx']
    for w in which:
        {'intro': academy_intro, 'short': academy_intro_short, 'outro': outro, 'bed': lesson_bed, 'sfx': sfx}[w]()
