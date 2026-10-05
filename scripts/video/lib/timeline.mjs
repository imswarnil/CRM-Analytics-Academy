/**
 * Where each beat sits in time. Real timing from voice.json when the voice
 * stage has run (per-beat audio), else the script's estimates — so motion
 * and edit can be scaffolded before any audio exists and re-run after.
 */
import { existsSync, readFileSync } from 'node:fs'
import { needFile } from './context.mjs'

export function loadScript(ctx) {
  return JSON.parse(readFileSync(needFile(ctx, 'script.json', 'script'), 'utf8'))
}

export function beatTimeline(ctx, script = loadScript(ctx)) {
  const voicePath = ctx.at('voice.json')
  const voice = existsSync(voicePath) ? JSON.parse(readFileSync(voicePath, 'utf8')) : null
  const measured = new Map((voice?.beats ?? []).map(b => [b.id, b.seconds]))
  let t = 0
  const beats = script.beats.map((b) => {
    // A silent beat (code on screen) keeps its estimate; spoken ones use audio.
    const seconds = Number((measured.get(b.id) ?? b.estSeconds).toFixed(3))
    const row = { ...b, start: Number(t.toFixed(3)), seconds }
    t += seconds
    return row
  })
  return { beats, total: Number(t.toFixed(3)), timing: voice ? 'voice' : 'estimate' }
}
