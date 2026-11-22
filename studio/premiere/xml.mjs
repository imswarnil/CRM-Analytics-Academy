/**
 * A Premiere Pro sequence (FCP7 XML, File → Import in Premiere) for a built
 * film: the render on V1, then VO, music (with the ducking as level
 * keyframes) and SFX on their own audio tracks, so the edit stays editable.
 * The finished mix sits on the last track, switched off, for reference.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const url = f => `file://localhost${encodeURI(f).replace(/#/g, '%23')}`
const secs = f => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim())

export function premiereXml(tl, mp4, out) {
  const fps = tl.fps
  const fr = s => Math.round(s * fps)
  const rate = `<rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>`
  let id = 0
  const files = new Map()
  const fileXml = (f, video) => {
    if (files.has(f)) return `<file id="${files.get(f)}"/>`
    const fid = `file-${++id}`
    files.set(f, fid)
    const media = video
      ? `<media><video><samplecharacteristics><width>${tl.width}</width><height>${tl.height}</height></samplecharacteristics></video><audio><channelcount>2</channelcount></audio></media>`
      : '<media><audio><channelcount>2</channelcount></audio></media>'
    return `<file id="${fid}"><name>${esc(path.basename(f))}</name><pathurl>${url(f)}</pathurl>${rate}<duration>${fr(secs(f))}</duration>${media}</file>`
  }
  const levels = keys => `<filter><effect><name>Audio Levels</name><effectid>audiolevels</effectid><effectcategory>audiolevels</effectcategory><effecttype>audiolevels</effecttype><mediatype>audio</mediatype><parameter><parameterid>level</parameterid><name>Level</name><valuemin>0</valuemin><valuemax>3.98109</valuemax>${keys.map(([t, db]) => `<keyframe><when>${fr(Math.max(0, t))}</when><value>${(10 ** (db / 20)).toFixed(5)}</value></keyframe>`).join('')}</parameter></effect></filter>`
  const clip = (f, start, opts = {}) => {
    const len = Math.min(fr(secs(f)), fr(opts.max ?? 1e9))
    return `<clipitem id="clip-${++id}"><name>${esc(opts.name ?? path.basename(f))}</name><enabled>${opts.off ? 'FALSE' : 'TRUE'}</enabled><duration>${len}</duration>${rate}<start>${fr(start)}</start><end>${fr(start) + len}</end><in>0</in><out>${len}</out>${fileXml(f, opts.video)}${opts.video ? '' : '<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>'}${opts.keys ? levels(opts.keys) : ''}</clipitem>`
  }
  const track = items => `<track>${items.join('')}</track>`
  const total = fr(tl.total)
  const music = tl.music.duck.map(([t, db]) => [t, db])
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4"><sequence id="seq-${esc(tl.slug)}"><name>${esc(tl.slug)}</name><duration>${total}</duration>${rate}
<media><video><format><samplecharacteristics>${rate}<width>${tl.width}</width><height>${tl.height}</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></format>
${track([clip(mp4, 0, { video: true, name: `${tl.slug} (After Effects render)` })])}</video>
<audio>
${track(tl.scenes.map(s => clip(s.voFile, s.start + s.voStart, { name: `VO ${s.id}` })))}
${track([clip(tl.music.file, 0, { name: 'Music', max: tl.total, keys: [[0, music[0][1]], ...music] })])}
${track(tl.sfx.map(c => clip(c.file, c.at, { name: `SFX ${c.name}`, keys: [[0, -8]] })))}
${track([clip(tl.mix, 0, { name: 'MIX (reference)', off: true })])}
</audio></media></sequence></xmeml>
`
  writeFileSync(out, xml)
  return out
}
