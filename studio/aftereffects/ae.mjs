/**
 * Talking to After Effects from Node: run a job in the open After Effects
 * (osascript → DoScriptFile run-job.jsx), and render with aerender.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const WS = path.join(HERE, '..', 'workspace')
const APP = 'Adobe After Effects 2027'
const AERENDER = `/Applications/${APP}/aerender`

export async function runJob(job) {
  if (job) writeFileSync(path.join(WS, '.job.json'), JSON.stringify(job, null, 2))
  const logFile = path.join(WS, '.job.log')
  rmSync(logFile, { force: true })
  const r = spawnSync('osascript', ['-e', `tell application "${APP}" to DoScriptFile "${path.join(HERE, 'run-job.jsx')}"`], { encoding: 'utf8', timeout: 15 * 60e3 })
  if (r.status !== 0) throw new Error(`osascript: ${r.stderr.trim()}`)
  if (!existsSync(logFile)) {
    throw new Error('After Effects did not run the script. Close its Home screen or any open dialog (press Esc in After Effects) and try again.')
  }
  const log = readFileSync(logFile, 'utf8')
  console.log(log.split('\n').map(l => `  ae: ${l}`).join('\n'))
  if (/^ERROR/m.test(log)) throw new Error(log.match(/^ERROR.*$/m)[0])
  return log
}

/** Render a comp with aerender, then lay the mix under it (H.264 + AAC MP4). */
export async function render(aep, comp, mp4, mix) {
  aep = path.resolve(aep)
  mp4 = path.resolve(mp4)
  if (mix) mix = path.resolve(mix)
  const mov = mp4.replace(/\.mp4$/, '.render.mov')
  rmSync(mov, { force: true })
  const args = ['-project', aep, '-comp', comp, '-output', mov, '-RStemplate', 'Best Settings', '-OMtemplate', 'High Quality', '-sound', 'OFF']
  console.log(`rendering ${comp} (aerender)…`)
  const r = spawnSync(AERENDER, args, { encoding: 'utf8', timeout: 60 * 60e3, maxBuffer: 64 * 1024 * 1024 })
  if (!existsSync(mov)) {
    console.error(r.stdout.split('\n').filter(l => /error|warning/i.test(l)).slice(-15).join('\n'))
    throw new Error('aerender produced no file')
  }
  const a = mix ? ['-i', mix, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest'] : []
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', mov, ...a, '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4])
  rmSync(mov, { force: true })
  return mp4
}
