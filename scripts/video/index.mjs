#!/usr/bin/env node
/**
 * The lesson video pipeline. Owner-run, local; the site build never calls it.
 *
 *   pnpm video <stage> <route> [--provider=…] [stage flags]
 *   pnpm video all <route> --voice=heygen --avatar=none   script→voice→avatar→motion→edit
 *   pnpm video status <route>
 *   pnpm video test                                        offline checks (no network)
 *
 * Stages, in order (each reads the previous one's files in
 * .data/video/<route>/ and can be re-run on its own):
 *
 *   script    narration beats from the English lesson (deterministic; --with-claude writes a prompt file)
 *   voice     your voice: --provider=heygen | local-clone | file   (no default TTS, by design)
 *   avatar    --provider=heygen | none
 *   motion    scaffold a HyperFrames project (not rendered)
 *   edit      edit.json + captions.srt + PREMIERE.md for the Premiere MCP
 *   upload    final.mp4 → Mux with generated English captions; writes `mux:`
 *   captions  sync Mux's English captions → content-transcripts/en/<route>.vtt
 *
 * See video/README.md.
 */
import { existsSync } from 'node:fs'
import { parseArgs } from '../lib/lessons.mjs'
import { createContext, StageError } from './lib/context.mjs'

const STAGES = {
  script: () => import('./stages/script.mjs'),
  voice: () => import('./stages/voice.mjs'),
  avatar: () => import('./stages/avatar.mjs'),
  motion: () => import('./stages/motion.mjs'),
  edit: () => import('./stages/edit.mjs'),
  upload: () => import('./stages/upload.mjs'),
  captions: () => import('./captions.mjs')
}

const USAGE = `usage: pnpm video <stage> <route> [flags]
stages: ${Object.keys(STAGES).join(' | ')} | all | status | test
e.g.    pnpm video script /saql/functions
        pnpm video voice /saql/functions --provider=heygen
        pnpm video all /saql/functions --voice=file --file=~/Narration/saql.wav`

async function runStage(name, route, flags) {
  const ctx = createContext(route, flags)
  console.log(`\n▶ ${name} ${ctx.route}`)
  await (await STAGES[name]()).run(ctx)
  return ctx
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2))
  const [stage, route] = positional

  if (stage === 'test') {
    await import('./test-vtt.mjs')
    return
  }
  if (!stage || !route) {
    console.error(USAGE)
    process.exit(1)
  }

  if (stage === 'status') {
    const ctx = createContext(route, flags)
    const files = ['script.json', 'voice.json', 'voice.wav', 'avatar.json', 'avatar.mp4', 'motion/index.html', 'motion.mp4', 'edit.json', 'PREMIERE.md', 'final.mp4', 'upload.json']
    console.log(`${ctx.rel(ctx.dir)}/`)
    for (const f of files) console.log(`  ${existsSync(ctx.at(f)) ? '✓' : '·'} ${f}`)
    console.log(`  mux: ${ctx.lesson.data.mux ? JSON.stringify(ctx.lesson.data.mux) : '—'}`)
    return
  }

  if (stage === 'all') {
    // The production chain up to the hand-off to Premiere. Upload and
    // captions stay separate: they come after you have exported final.mp4.
    await runStage('script', route, flags)
    await runStage('voice', route, { ...flags, provider: flags.voice })
    await runStage('avatar', route, { ...flags, provider: flags.avatar })
    await runStage('motion', route, flags)
    await runStage('edit', route, flags)
    console.log('\nNext: render motion/ (see its CLAUDE.md), assemble with PREMIERE.md, export final.mp4, then `pnpm video upload ' + route + '`.')
    return
  }

  if (!STAGES[stage]) {
    console.error(`Unknown stage "${stage}".\n${USAGE}`)
    process.exit(1)
  }
  await runStage(stage, route, flags)
}

main().catch((e) => {
  console.error(`\n✗ ${e instanceof StageError ? e.message : (e?.stack ?? e)}`)
  process.exit(1)
})
