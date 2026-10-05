/**
 * Stage `motion` — scaffolds a HyperFrames project for the lesson's motion
 * graphics. It writes files; it renders nothing.
 *
 *   pnpm video motion /saql/functions
 *
 * Output: .data/video/<route>/motion/
 *   index.html   one composition, as long as the narration, one scene per
 *                beat on the beat timeline: title card, chapter cards,
 *                on-screen text/bullets, code panels, end card, a lower third
 *   beats.json   the timeline it was built from
 *   assets/      the Blueprint brand kit from content-assets/ it uses
 *   CLAUDE.md    what to do next, for Claude Code + the HyperFrames skills
 *
 * The composition follows the HyperFrames contract (sized root with
 * data-composition-id, timed .clip scenes, one paused GSAP timeline on
 * window.__timelines). Polishing it is a creative pass for Claude Code with
 * /hyperframes; rendering produces motion.mp4 next to the other stage outputs.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT } from '../../lib/lessons.mjs'
import { beatTimeline } from '../lib/timeline.mjs'

const C = { paper: '#F4F7FB', ink: '#0C1B33', navy: '#0F2A5C', signal: '#2F5BEA', tide: '#3D8BD9', frost: '#A8CCF2', ice: '#DDEBFA', glow: '#3FC6DC' }

const ASSETS = [
  'backgrounds/graph-paper-navy-1920x1080.png',
  'backgrounds/graph-paper-light-1920x1080.png',
  'brand/logo-mark-on-navy.png',
  'brand/wordmark-on-navy.png'
]

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function scene(b, i) {
  const id = `s${i + 1}`
  const attrs = `id="${id}" class="clip scene" data-start="${b.start}" data-duration="${b.seconds}" data-track-index="1" data-beat="${b.id}"`
  switch (b.kind) {
    case 'title':
      return `<section ${attrs} data-kind="title">
        <div class="bg navy"></div>
        <div class="card">
          <p class="eyebrow" id="${id}-eyebrow">CRM ANALYTICS ACADEMY — LESSON</p>
          <h1 id="${id}-title">${esc(b.onscreen || b.heading)}</h1>
          <div class="rule" id="${id}-rule"></div>
        </div>
      </section>`
    case 'chapter':
      return `<section ${attrs} data-kind="chapter">
        <div class="bg navy"></div>
        <div class="card">
          <p class="eyebrow" id="${id}-eyebrow">SECTION</p>
          <h2 id="${id}-title">${esc(b.heading)}</h2>
        </div>
      </section>`
    case 'code':
      return `<section ${attrs} data-kind="code">
        <div class="bg paper"></div>
        <div class="panel" id="${id}-panel"><p class="eyebrow">${esc(b.lang || 'CODE')}</p><pre>${esc(b.code)}</pre></div>
      </section>`
    case 'end':
      return `<section ${attrs} data-kind="end">
        <div class="bg navy"></div>
        <div class="card">
          <img class="mark" id="${id}-mark" src="assets/brand/logo-mark-on-navy.png" alt="">
          <h2 id="${id}-title">${esc(b.onscreen)}</h2>
        </div>
      </section>`
    default: {
      const list = Array.isArray(b.onscreen) ? b.onscreen : (b.onscreen ? [b.onscreen] : [])
      return `<section ${attrs} data-kind="${b.kind}">
        <div class="bg paper"></div>
        <div class="panel" id="${id}-panel">
          ${b.heading ? `<p class="eyebrow">${esc(b.heading)}</p>` : ''}
          ${list.length ? `<ul>${list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="say">${esc(b.say.split(/(?<=[.!?])\s/)[0] ?? '')}</p>`}
        </div>
      </section>`
    }
  }
}

function html(script, tl, m) {
  const firstPoint = tl.beats.find(b => b.kind !== 'title') ?? tl.beats[0]
  const lowerStart = firstPoint ? firstPoint.start : 0
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${m.width}, height=${m.height}">
<title>${esc(script.title)} — motion</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  /* Blueprint tokens (content-assets/README.md). Brand fonts are Schibsted
     Grotesk and IBM Plex Mono: add @font-face rules pointing at local files in
     assets/fonts/ before naming them here (HyperFrames lint requires it). */
  :root { --paper:${C.paper}; --ink:${C.ink}; --navy:${C.navy}; --signal:${C.signal}; --ice:${C.ice}; --glow:${C.glow}; }
  body { margin:0; background:var(--navy); color:var(--ink); font-family: system-ui, sans-serif; }
  #root { position:relative; width:100%; height:100%; overflow:hidden; }
  .scene { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
  .bg { position:absolute; inset:0; background-size:cover; }
  .bg.navy { background-image:url(assets/backgrounds/graph-paper-navy-1920x1080.png); }
  .bg.paper { background-image:url(assets/backgrounds/graph-paper-light-1920x1080.png); }
  .card { position:relative; width:1400px; color:var(--paper); }
  .eyebrow { font-family: ui-monospace, monospace; letter-spacing:.14em; font-size:26px; color:var(--glow); margin:0 0 24px; text-transform:uppercase; }
  h1 { font-size:104px; line-height:1.02; margin:0; font-weight:700; }
  h2 { font-size:88px; line-height:1.05; margin:0; font-weight:700; }
  .rule { height:6px; width:320px; background:var(--signal); margin-top:40px; }
  .panel { position:relative; width:1500px; background:var(--paper); border:3px solid var(--ink); box-shadow:16px 16px 0 var(--signal); padding:56px 64px; }
  .panel .eyebrow { color:var(--signal); }
  .panel ul { margin:0; padding-left:40px; font-size:48px; line-height:1.35; }
  .panel .say { font-size:52px; line-height:1.3; margin:0; }
  .panel pre { margin:0; font-family: ui-monospace, monospace; font-size:34px; line-height:1.45; white-space:pre-wrap; }
  .mark { width:160px; height:160px; display:block; margin-bottom:40px; }
  .lower-third { position:absolute; left:96px; bottom:96px; display:flex; align-items:stretch; }
  .lower-third .bar { width:12px; background:var(--signal); }
  .lower-third .text { background:var(--paper); border:3px solid var(--ink); padding:18px 28px; }
  .lower-third .name { font-size:40px; font-weight:700; }
  .lower-third .role { font-family: ui-monospace, monospace; font-size:22px; letter-spacing:.1em; color:var(--signal); }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="${m.width}" data-height="${m.height}" data-duration="${tl.total}">
${tl.beats.map(scene).join('\n')}
  <div id="lower-third" class="clip lower-third" data-start="${lowerStart}" data-duration="5" data-track-index="2">
    <div class="bar"></div>
    <div class="text" id="lower-third-text"><div class="name">Swarnil Singhai</div><div class="role">CRM ANALYTICS ACADEMY</div></div>
  </div>
</div>
<script>
  // One paused timeline, registered under the root composition id. Entrances
  // only: the runtime hides each scene outside its window.
  const tl = gsap.timeline({ paused: true });
  document.querySelectorAll('.scene').forEach((el) => {
    const t = Number(el.dataset.start);
    const inner = el.querySelector('.card, .panel');
    if (inner) tl.fromTo(inner, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, t + 0.1);
  });
  tl.fromTo('#lower-third-text', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, ${lowerStart} + 0.3);
  window.__timelines["main"] = tl;
</script>
</body>
</html>
`
}

function instructions(ctx, tl) {
  return `# Motion graphics — ${ctx.route}

Scaffolded by \`pnpm video motion ${ctx.route}\` from the lesson script
(${tl.beats.length} beats, ${Math.round(tl.total)}s, timing: ${tl.timing}).
Re-running the stage overwrites index.html — make creative edits after the
voice stage, when the timing is final.

## For Claude Code

Open this folder in Claude Code and use the HyperFrames skills:

1. \`/hyperframes\` — read index.html and beats.json. Keep every scene's
   \`data-start\`/\`data-duration\` (they are the narration's beat timing) and
   the composition id \`main\`.
2. Polish in the Blueprint language (paper/ink, graph paper, crop marks,
   hard offset shadows, mono eyebrows — see ../../../../content-assets/README.md).
   Add the brand fonts as local @font-face files under assets/fonts/.
3. \`npx hyperframes check\` until it is clean, then
   \`npx hyperframes preview --background\` for review.
4. Render only after review: \`npx hyperframes render --output ../motion.mp4\`.

Then: \`pnpm video edit ${ctx.route}\`.
`
}

export async function run(ctx) {
  const tl = beatTimeline(ctx)
  const m = { width: 1920, height: 1080, fps: 30, ...ctx.config.motion }
  const dir = ctx.at('motion')
  mkdirSync(path.join(dir, 'assets'), { recursive: true })
  for (const a of ASSETS) {
    const src = path.join(ROOT, 'content-assets', a)
    if (!existsSync(src)) continue
    const out = path.join(dir, 'assets', a)
    mkdirSync(path.dirname(out), { recursive: true })
    copyFileSync(src, out)
  }
  const script = JSON.parse((await import('node:fs')).readFileSync(ctx.at('script.json'), 'utf8'))
  writeFileSync(path.join(dir, 'index.html'), html(script, tl, m))
  writeFileSync(path.join(dir, 'beats.json'), JSON.stringify(tl, null, 2) + '\n')
  writeFileSync(path.join(dir, 'CLAUDE.md'), instructions(ctx, tl))
  console.log(`✓ ${ctx.rel(dir)}/ — HyperFrames project, ${tl.beats.length} scenes, ${Math.round(tl.total)}s (${tl.timing} timing). Not rendered: see its CLAUDE.md.`)
}
