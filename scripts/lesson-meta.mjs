#!/usr/bin/env node
/**
 * Per-lesson length, kind and quiz flag for the Blueprint charts (curriculum
 * bars, the player's course timeline, "curriculum, plotted" on the home page).
 *
 *   node scripts/lesson-meta.mjs      # writes app/data/lesson-meta.json
 *
 * Read from the English lessons only; translated routes look themselves up by
 * their locale-stripped path. Minutes = reading at 200 wpm plus the
 * walkthrough's spoken seconds, never under 3. A lesson is a "video" when it
 * has a YouTube `video` or a recording script (`walkthrough`). Committed, so
 * dev and typecheck always have it; run by `pnpm build`.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const EN = path.join(ROOT, 'content/en')

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    // Interview questions and exam banks are their own collections, not lessons.
    if (e.isDirectory() && (e.name === 'interview-questions' || e.name === 'exam')) continue
    if (e.isDirectory()) out.push(...await walk(p))
    else if (e.name.endsWith('.md')) out.push(p)
  }
  return out
}

const meta = {}
for (const file of (await walk(EN)).sort()) {
  const rel = path.relative(EN, file).split(path.sep).join('/')
  if (!rel.includes('/')) continue
  const raw = await readFile(file, 'utf8')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  const data = m ? parse(m[1]) ?? {} : {}
  const body = m ? raw.slice(m[0].length) : raw
  const route = '/' + rel.replace(/\.md$/, '').split('/').map(p => p.replace(/^\d+\./, '')).join('/').replace(/\/index$/, '')
  const spoken = Array.isArray(data.walkthrough?.shots)
    ? data.walkthrough.shots.reduce((n, sh) => n + (Number(sh.seconds) || 0), 0)
    : 0
  meta[route] = {
    minutes: Math.max(3, Math.round(body.split(/\s+/).filter(Boolean).length / 200 + spoken / 60)),
    type: data.video?.id || data.walkthrough?.shots?.length ? 'video' : 'article',
    quiz: Array.isArray(data.quiz) && data.quiz.length > 0,
    ...(data.access === 'pro' ? { pro: true } : {})
  }
}

const out = path.join(ROOT, 'app/data/lesson-meta.json')
const next = JSON.stringify(meta, null, 1) + '\n'
if (await readFile(out, 'utf8').catch(() => '') !== next) await writeFile(out, next)
console.log(`[lesson-meta] ${Object.keys(meta).length} lessons`)
