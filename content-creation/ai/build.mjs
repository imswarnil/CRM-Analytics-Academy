#!/usr/bin/env node
/**
 * pnpm video <lesson.md | script.json> [--avatar] [--render]
 *
 * An illustrated lesson video, in the Academy's design, presented by your
 * HeyGen avatar in your cloned voice:
 *
 *   1. script     the lesson's markdown → script.json: one scene per `##`
 *                 heading — a title, up to four points, and the narration
 *                 (the section's prose). Edit script.json by hand freely;
 *                 passing it back in skips this step.
 *   2. --avatar   each scene's narration → a HeyGen clip (heygen.mjs), and the
 *                 scene lasts exactly as long as you speak. Without it, scenes
 *                 are timed at 2.6 words a second and have no presenter.
 *   3. project    a HyperFrames project in content-creation/ai/projects/<slug>/:
 *                 index.html mounts one compositions/scene-N.html per scene;
 *                 the avatar sits bottom-right as a picture-in-picture.
 *   4. --render   npx hyperframes render → <slug>.mp4, ready for YouTube.
 *
 * Preview and tweak before rendering: npx hyperframes preview <project dir>.
 * Colours are the Blueprint tokens (app/assets/css/main.css, tokens/tokens.json).
 */
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { avatarClip } from './heygen.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '..', '..')
if (existsSync(path.join(ROOT, '.env'))) {
  for (const line of readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^(HEYGEN_[A-Z_]+)=['"]?([^'"\n]*)/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

const args = process.argv.slice(2)
const input = args.find(a => !a.startsWith('--'))
if (!input) {
  console.error('Usage: pnpm video <lesson.md | script.json> [--avatar] [--render]')
  process.exit(1)
}

const T = { paper: '#F6F8FB', ink: '#0F1B2D', ink2: '#4A5A70', navy: '#0F2A5C', signal: '#2563EB', glow: '#7DD3FC', line: '#D6DEE8' }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const plain = s => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`>#]/g, '').replace(/\s+/g, ' ').trim()

/** Markdown → { title, slug, scenes: [{ title, points[], narration }] } */
function scriptFrom(raw, file) {
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  const data = fm ? parse(fm[1]) ?? {} : {}
  const body = fm ? raw.slice(fm[0].length) : raw
  const title = data.title ?? path.basename(file, '.md')
  const scenes = [{ title, points: data.description ? [data.description] : [], narration: plain(data.description ?? title) }]
  for (const part of body.split(/^##\s+/m).slice(1)) {
    const [head, ...rest] = part.split('\n')
    const text = rest.join('\n').replace(/```[\s\S]*?```/g, '').replace(/^::.*$/gm, '')
    const points = [...text.matchAll(/^\s*[-*]\s+(.+)$/gm)].map(m => plain(m[1])).slice(0, 4)
    const prose = text.split(/\n{2,}/).map(p => p.trim()).filter(p => p && !/^[-*|<!]|^\d+\./.test(p)).map(plain)
    scenes.push({ title: plain(head), points, narration: prose.join(' ') || plain(head) })
  }
  return { title, slug: path.basename(file, '.md').replace(/^\d+\./, ''), scenes }
}

const script = input.endsWith('.json')
  ? JSON.parse(await readFile(input, 'utf8'))
  : scriptFrom(await readFile(input, 'utf8'), input)

const dir = path.join(HERE, 'projects', script.slug)
await mkdir(path.join(dir, 'compositions'), { recursive: true })
await mkdir(path.join(dir, 'assets'), { recursive: true })
await writeFile(path.join(dir, 'script.json'), JSON.stringify(script, null, 2))

// Timing: the avatar's real length when there is one, else words / 2.6.
for (const [i, s] of script.scenes.entries()) {
  s.id = `scene-${i + 1}`
  if (args.includes('--avatar')) {
    const file = path.join(dir, 'assets', `${s.id}.mp4`)
    if (!existsSync(file)) console.log(`HeyGen: ${s.id} (${s.narration.split(' ').length} words)…`)
    const clip = existsSync(file) ? { seconds: Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString()) } : await avatarClip(s.narration, file)
    s.avatar = `assets/${s.id}.mp4`
    s.seconds = Math.round((clip.seconds + 0.4) * 10) / 10
  } else {
    s.seconds = Math.max(4, Math.round((s.narration.split(' ').length / 2.6) * 10) / 10)
  }
}

function scene(s, n) {
  const points = s.points.map((p, j) => `    <li id="${s.id}-p${j}" class="clip" data-start="${(0.8 + j * 0.5).toFixed(1)}" data-duration="${(s.seconds - 0.8 - j * 0.5).toFixed(1)}"><span>${esc(p)}</span></li>`).join('\n')
  return `<template>
  <style>
    #root { position: absolute; inset: 0; background: ${T.paper}; color: ${T.ink}; font-family: Inter, "Helvetica Neue", Arial, sans-serif; overflow: hidden; }
    #root .grid { position: absolute; inset: 0; background-image: linear-gradient(${T.line} 1px, transparent 1px), linear-gradient(90deg, ${T.line} 1px, transparent 1px); background-size: 48px 48px; opacity: .55; }
    #root .num { position: absolute; left: 160px; top: 150px; font: 600 28px/1 ui-monospace, Menlo, monospace; letter-spacing: .14em; color: ${T.signal}; }
    #root h1 { position: absolute; left: 160px; top: 200px; width: 1060px; margin: 0; font-size: 84px; line-height: 1.04; font-weight: 800; letter-spacing: -.03em; }
    #root ul { position: absolute; left: 160px; top: 480px; width: 1000px; margin: 0; padding: 0; list-style: none; }
    #root li span { display: block; margin-bottom: 26px; padding: 22px 28px; border-radius: 22px; background: #fff; border: 1px solid ${T.line}; font-size: 36px; line-height: 1.3; box-shadow: 0 18px 50px -30px ${T.navy}; }
    #root .bar { position: absolute; left: 0; bottom: 0; height: 10px; width: 1920px; background: ${T.signal}; transform-origin: left center; }
  </style>
  <div id="root" data-composition-id="${s.id}" data-width="1920" data-height="1080">
    <div class="grid"></div>
    <div id="${s.id}-num" class="num clip" data-start="0" data-duration="${s.seconds}"><span>SCENE ${String(n).padStart(2, '0')}</span></div>
    <h1 id="${s.id}-title" class="clip" data-start="0.2" data-duration="${(s.seconds - 0.2).toFixed(1)}" data-var-text="${s.id}-title"><span>${esc(s.title)}</span></h1>
    <ul>
${points}
    </ul>
    <div id="${s.id}-bar" class="clip" data-start="0" data-duration="${s.seconds}"><div class="bar"></div></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#${s.id}-title span", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.2);
${s.points.map((_, j) => `    tl.fromTo("#${s.id}-p${j} span", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, ${(0.8 + j * 0.5).toFixed(1)});`).join('\n')}
    tl.fromTo("#${s.id}-bar .bar", { scaleX: 0 }, { scaleX: 1, duration: ${s.seconds}, ease: "none" }, 0);
    window.__timelines["${s.id}"] = tl;
  </script>
</template>
`
}

let t = 0
const hosts = []
const avatars = []
for (const [i, s] of script.scenes.entries()) {
  await writeFile(path.join(dir, 'compositions', `${s.id}.html`), scene(s, i + 1))
  hosts.push(`      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${t.toFixed(1)}" data-duration="${s.seconds}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>`)
  if (s.avatar) {
    avatars.push(`      <div id="${s.id}-avatar" class="clip avatar" data-start="${t.toFixed(1)}" data-duration="${s.seconds}" data-track-index="2" data-layout-allow-overlap><video id="${s.id}-avatar-video" src="${s.avatar}" data-has-audio="true"></video></div>`)
  }
  t += s.seconds
}

await writeFile(path.join(dir, 'index.html'), `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      .avatar { position: absolute; right: 96px; bottom: 96px; width: 520px; height: 520px; border-radius: 50%; overflow: hidden; z-index: 10; box-shadow: 0 30px 80px -30px ${T.navy}; border: 6px solid #fff; }
      .avatar video { width: 100%; height: 100%; object-fit: cover; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${t.toFixed(1)}" data-width="1920" data-height="1080">
${hosts.join('\n')}
${avatars.join('\n')}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`)

console.log(`${script.scenes.length} scenes, ${Math.round(t)} s → ${path.relative(ROOT, dir)}`)
console.log(`Preview: npx hyperframes preview ${path.relative(ROOT, dir)}`)
if (args.includes('--render')) {
  execFileSync('npx', ['hyperframes', 'render', dir, '--output', path.join(dir, `${script.slug}.mp4`)], { stdio: 'inherit' })
}
