/**
 * Shared plumbing for the video pipeline: config, the per-lesson work
 * directory, small process helpers and the one way a stage fails.
 *
 * Every stage reads and writes files in `.data/video/<route>/` (gitignored):
 *
 *   script.json  script.md  prompt.md        ← script
 *   voice/beat-NNN.wav  voice.wav  voice.json ← voice
 *   avatar.mp4  avatar.json                  ← avatar
 *   motion/  (a HyperFrames project)         ← motion
 *   edit.json  captions.srt  PREMIERE.md     ← edit
 *   final.mp4                                ← exported from Premiere by you
 *   upload.json                              ← upload
 *
 * so any stage can be re-run, swapped for a hand-made file, or skipped.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { readLesson, resolveLesson, ROOT } from '../../lib/lessons.mjs'

export class StageError extends Error {}

/** Fail with a message that says what to do, not only what went wrong. */
export function fail(message) {
  throw new StageError(message)
}

export function loadConfig() {
  const file = path.join(ROOT, 'video/video.config.json')
  if (!existsSync(file)) fail('video/video.config.json is missing — it ships with the repo; restore it from git.')
  return JSON.parse(readFileSync(file, 'utf8'))
}

/** Work dir for a route: /saql/functions → .data/video/saql--functions */
export function workDirFor(config, route) {
  const slug = route.replace(/^\/|\/$/g, '').replace(/\//g, '--') || 'index'
  const dir = path.join(ROOT, config.workDir || '.data/video', slug)
  mkdirSync(dir, { recursive: true })
  return dir
}

export function createContext(routeArg, flags) {
  const config = loadConfig()
  const file = resolveLesson(routeArg)
  const lesson = readLesson(file)
  const dir = workDirFor(config, lesson.route)
  return {
    config,
    flags,
    file,
    lesson,
    route: lesson.route,
    dir,
    at: (...p) => path.join(dir, ...p),
    readJson: (name) => {
      const f = path.join(dir, name)
      return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null
    },
    writeJson: (name, data) => writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2) + '\n'),
    writeText: (name, text) => writeFileSync(path.join(dir, name), text),
    rel: f => path.relative(ROOT, f)
  }
}

/** A stage that needs another stage's output says which command makes it. */
export function needFile(ctx, name, makeWith) {
  const f = ctx.at(name)
  if (!existsSync(f)) fail(`${ctx.rel(f)} does not exist yet. Run: pnpm video ${makeWith} ${ctx.route}`)
  return f
}

export function hasCommand(cmd) {
  return spawnSync('/bin/sh', ['-c', 'command -v "$1"', 'sh', cmd]).status === 0
}

export function requireCommand(cmd, install) {
  if (!hasCommand(cmd)) fail(`"${cmd}" is not installed. ${install}`)
}

/** Media duration in seconds (ffprobe). */
export function durationOf(file) {
  requireCommand('ffprobe', 'Install ffmpeg: brew install ffmpeg')
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' })
  return Number(out.trim()) || 0
}

/** Concatenate audio files into one WAV (ffmpeg concat demuxer). */
export function concatAudio(files, out) {
  requireCommand('ffmpeg', 'Install ffmpeg: brew install ffmpeg')
  const list = out + '.txt'
  writeFileSync(list, files.map(f => `file '${f.replace(/'/g, '\'\\\'\'')}'`).join('\n'))
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-ar', '48000', '-ac', '1', out], { stdio: 'inherit' })
}

/** Which provider a stage uses: --provider beats config; null/'' means "not chosen". */
export function providerFor(ctx, stage) {
  return ctx.flags.provider || ctx.config[stage]?.provider || null
}

export function env(name, hint) {
  const v = process.env[name]
  if (!v) fail(`${name} is not set. ${hint} (put it in .env — never in video.config.json)`)
  return v
}
