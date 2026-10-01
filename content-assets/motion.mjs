/**
 * Premiere Pro overlays: transparent ProRes 4444 (.mov with alpha) rendered
 * from the kit's PNGs, so they drop onto a track above the footage and just
 * work — no keying, no blend modes.
 *
 *   node content-assets/build.mjs     # first: renders video/*.png
 *   node content-assets/motion.mjs    # then: writes premiere/*.mov
 *
 * Needs ffmpeg with prores_ks and rsvg-convert (both in Homebrew).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(ROOT, 'premiere')
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', 'ffmpeg'].find(p => !p.includes('/') || existsSync(p))
const RSVG = ['/opt/homebrew/bin/rsvg-convert', 'rsvg-convert'].find(p => !p.includes('/') || existsSync(p))
const W = 1920
const H = 1080

mkdirSync(OUT, { recursive: true })

for (const need of ['video/lower-third.png', 'video/next-lesson-overlay.png']) {
  if (!existsSync(path.join(ROOT, need))) {
    console.error(`Missing ${need} — run node content-assets/build.mjs first.`)
    process.exit(1)
  }
}

// Crop-mark frames: "+" on the safe-area corners, frost (for navy/dark
// footage) and ink (for light footage).
function cropFrame(color) {
  const a = 14
  const p = (x, y) => `M${x - a} ${y}h${a * 2}M${x} ${y - a}v${a * 2}`
  const [x, y, w, h] = [96, 96, W - 192, H - 192]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<path d="${p(x, y)}${p(x + w, y)}${p(x, y + h)}${p(x + w, y + h)}" stroke="${color}" stroke-width="2"/>
</svg>
`
}
for (const [name, color] of [['crop-frame-frost', '#A8CCF2'], ['crop-frame-ink', '#0C1B33']]) {
  const svgFile = path.join(OUT, `${name}.svg`)
  writeFileSync(svgFile, cropFrame(color))
  execFileSync(RSVG, ['-f', 'png', '-o', svgFile.replace(/\.svg$/, '.png'), svgFile])
}

/**
 * One overlay: the PNG slides in by `dx` px while fading up, holds, and
 * slides/fades back out. Encoded as ProRes 4444 with a straight alpha.
 */
function overlay(name, png, { duration, inDur = 0.5, outDur = 0.5, dx = 0, dy = 0 }) {
  const outAt = duration - outDur
  const x = `${-dx}*max(0\\,1-t/${inDur})+${-dx}*max(0\\,(t-${outAt})/${outDur})`
  const y = `${-dy}*max(0\\,1-t/${inDur})+${-dy}*max(0\\,(t-${outAt})/${outDur})`
  const file = path.join(OUT, `${name}.mov`)
  execFileSync(FFMPEG, [
    '-y', '-loglevel', 'error',
    '-f', 'lavfi', '-i', `color=c=0x00000000:s=${W}x${H}:r=30:d=${duration},format=rgba`,
    '-loop', '1', '-t', String(duration), '-i', png,
    '-filter_complex',
    `[1:v]format=rgba,fade=t=in:st=0:d=${inDur}:alpha=1${outDur ? `,fade=t=out:st=${outAt}:d=${outDur}:alpha=1` : ''}[o];`
    + `[0:v][o]overlay=x='${x}':y='${y}':eval=frame:format=auto,format=yuva444p10le`,
    '-c:v', 'prores_ks', '-profile:v', '4', '-pix_fmt', 'yuva444p10le', '-alpha_bits', '8', '-qscale:v', '13', '-vendor', 'apl0',
    '-r', '30', file
  ])
  return file
}

const made = [
  overlay('lower-third-5s', path.join(ROOT, 'video/lower-third.png'), { duration: 5, dx: 160 }),
  overlay('subscribe-next-lesson-6s', path.join(ROOT, 'video/next-lesson-overlay.png'), { duration: 6, dx: -160 }),
  overlay('crop-frame-frost-3s', path.join(OUT, 'crop-frame-frost.png'), { duration: 3, inDur: 0.3, outDur: 0.3 }),
  overlay('crop-frame-ink-3s', path.join(OUT, 'crop-frame-ink.png'), { duration: 3, inDur: 0.3, outDur: 0.3 })
]

for (const f of made) console.log(`✓ ${path.relative(ROOT, f)}  ${(statSync(f).size / 1e6).toFixed(1)} MB`)
