/**
 * Stage `script` — the narration, as beats, from the English lesson.
 *
 *   pnpm video script /saql/functions [--with-claude]
 *
 * Deterministic: the same lesson always gives the same script.json, and no
 * model is called. A lesson with a `walkthrough` uses its shots (their `say`
 * lines are already written to be spoken); otherwise the body is cut into
 * beats at its `##` sections, paragraphs merged up to `maxBeatWords`, code
 * blocks as their own on-screen beats. A free lesson's `::pro` blocks are left
 * out — the video of a free lesson is public.
 *
 * `--with-claude` additionally writes prompt.md: instructions you can hand to
 * Claude Code to rewrite the narration in place (same beat ids). Nothing is
 * sent anywhere by this command.
 */
import { stripProBlocks } from '../../lib/pro-blocks.mjs'

const clean = s => s
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/:[a-z][\w-]*\{[^}]*\}/g, '')
  .replace(/\{[^}]*\}/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/[*_~]+/g, '')
  .replace(/`([^`]*)`/g, '$1')
  .replace(/\s+/g, ' ')
  .trim()

const wordsOf = s => (s.match(/\S+/g) ?? []).length

/** Body → [{ heading, paragraphs[], bullets[], code[] }] per `##` section. */
function sections(body) {
  const out = []
  let cur = { heading: '', items: [] }
  let fence = null
  let mdcDepth = 0
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (fence) {
        cur.items.push({ type: 'code', lang: fence.lang, text: fence.lines.join('\n') })
        fence = null
      } else fence = { lang: line.replace(/^\s*(```|~~~)/, '').trim(), lines: [] }
      continue
    }
    if (fence) {
      fence.lines.push(line)
      continue
    }
    // MDC components (tables, cards, embeds) are visuals, not narration.
    if (/^\s*:{2,}[a-z]/.test(line)) {
      mdcDepth++
      continue
    }
    if (/^\s*:{2,}\s*$/.test(line)) {
      mdcDepth = Math.max(0, mdcDepth - 1)
      continue
    }
    if (mdcDepth) continue
    const t = line.trim()
    if (!t || /^#\s/.test(t) || /^\|/.test(t) || /^---$/.test(t)) continue
    const h = /^#{2,3}\s+(.*)$/.exec(t)
    if (h) {
      if (cur.heading || cur.items.length) out.push(cur)
      cur = { heading: clean(h[1]), items: [] }
      continue
    }
    const li = /^([-*+]|\d+[.)])\s+(.*)$/.exec(t)
    if (li) {
      cur.items.push({ type: 'bullet', text: clean(li[2]) })
      continue
    }
    cur.items.push({ type: 'para', text: clean(t.replace(/^>\s?/, '')) })
  }
  if (cur.heading || cur.items.length) out.push(cur)
  return out
}

export function buildScript(lesson, config) {
  const wpm = config.script?.wordsPerMinute ?? 150
  const maxWords = config.script?.maxBeatWords ?? 90
  const includeCode = config.script?.includeCode !== false
  const d = lesson.data
  const beats = []
  const push = (b) => {
    const words = wordsOf(b.say)
    beats.push({
      id: `beat-${String(beats.length + 1).padStart(3, '0')}`,
      ...b,
      words,
      estSeconds: b.seconds ?? Math.max(3, Math.round((words / wpm) * 60))
    })
  }

  push({ kind: 'title', heading: String(d.title ?? ''), say: clean(`${d.title ?? ''}. ${d.description ?? ''}`), onscreen: String(d.navigation?.title ?? d.title ?? '') })

  const shots = d.walkthrough?.shots
  if (Array.isArray(shots) && shots.length) {
    for (const sh of shots) {
      push({ kind: 'shot', heading: sh.shot, say: clean(sh.say ?? ''), onscreen: sh.onscreen ?? '', screen: sh.screen ?? '', seconds: sh.seconds })
    }
  } else {
    const body = d.access === 'pro' ? lesson.body : stripProBlocks(lesson.body)
    for (const sec of sections(body)) {
      if (sec.heading) push({ kind: 'chapter', heading: sec.heading, say: sec.heading + '.', onscreen: sec.heading })
      let buf = []
      let bullets = []
      const flush = () => {
        if (!buf.length && !bullets.length) return
        const say = [...buf, ...bullets].join(' ')
        push({ kind: 'point', heading: sec.heading, say, onscreen: bullets.length ? bullets : '' })
        buf = []
        bullets = []
      }
      for (const it of sec.items) {
        if (it.type === 'code') {
          flush()
          if (includeCode) push({ kind: 'code', heading: sec.heading, say: '', onscreen: '', code: it.text, lang: it.lang, seconds: 6 })
          continue
        }
        if (it.type === 'bullet') bullets.push(it.text)
        else buf.push(it.text)
        if (wordsOf([...buf, ...bullets].join(' ')) >= maxWords) flush()
      }
      flush()
    }
  }

  push({ kind: 'end', heading: '', say: 'The full lesson, with its exercises, is at crmanalytics.imswarnil.com.', onscreen: 'crmanalytics.imswarnil.com' })

  return {
    route: lesson.route,
    title: String(d.title ?? ''),
    access: d.access === 'pro' ? 'pro' : 'free',
    source: 'extract',
    wordsPerMinute: wpm,
    estSeconds: beats.reduce((n, b) => n + b.estSeconds, 0),
    beats
  }
}

function toMarkdown(script) {
  const lines = [`# ${script.title}`, '', `Route: ${script.route} · ${script.beats.length} beats · ~${Math.round(script.estSeconds / 60)} min`, '']
  for (const b of script.beats) {
    lines.push(`## ${b.id} — ${b.kind}${b.heading ? `: ${b.heading}` : ''} (~${b.estSeconds}s)`, '')
    if (b.say) lines.push(b.say, '')
    if (b.onscreen) lines.push(`> on screen: ${Array.isArray(b.onscreen) ? b.onscreen.join(' · ') : b.onscreen}`, '')
    if (b.code) lines.push('```' + (b.lang || ''), b.code, '```', '')
  }
  return lines.join('\n')
}

function claudePrompt(ctx) {
  return `# Rewrite the narration for ${ctx.route}

You are editing \`${ctx.rel(ctx.at('script.json'))}\` in place, in Claude Code.

- Rewrite each beat's \`say\` as natural spoken English for a screen-recorded lesson
  by Swarnil (first person, warm, precise, no hype). Keep every \`id\`, \`kind\`,
  \`heading\`, \`onscreen\` and \`code\` exactly as they are; do not add or remove beats.
- A \`code\` beat may get a one-sentence \`say\` that introduces the query on screen.
- Keep CRM Analytics terms exact (SAQL, recipe, dataset, lens, binding, dataflow).
- Recompute \`words\` and \`estSeconds\` (${ctx.config.script?.wordsPerMinute ?? 150} words per minute)
  and set top-level \`"source": "claude"\`.
- Read the lesson for context: \`${ctx.rel(ctx.file)}\`.

Then run \`pnpm video voice ${ctx.route}\`.
`
}

export async function run(ctx) {
  const script = buildScript(ctx.lesson, ctx.config)
  ctx.writeJson('script.json', script)
  ctx.writeText('script.md', toMarkdown(script))
  console.log(`✓ ${ctx.rel(ctx.at('script.json'))} — ${script.beats.length} beats, ~${Math.round(script.estSeconds / 60)} min`)
  if (ctx.flags['with-claude']) {
    ctx.writeText('prompt.md', claudePrompt(ctx))
    console.log(`✓ ${ctx.rel(ctx.at('prompt.md'))} — open Claude Code here and ask it to follow that file. No model was called.`)
  }
}
