// content-creation/fcp-shared.mjs — what lesson.mjs and session.mjs share: the CRMA template catalogue
// (text layers read out of the kit's .moti files), FCPXML time and escaping, the <title> writer and
// the text helpers that fit copy into a template's fields.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO = resolve(HERE, '..')
export const KIT = join(HERE, 'kit')
export const TEMPLATES = join(KIT, 'Motion Templates')
export const MUSIC = join(KIT, 'Music')
export const INSTALLED = join(homedir(), 'Movies', 'Motion Templates.localized')

// ------------------------------------------------------------------ time (30 fps projects)
export const FPS = 30
export const T = f => (f % FPS === 0 ? `${f / FPS}s` : `${f * 100}/3000s`) // frames → FCPXML time, whole seconds as FCP writes them
export const S = sec => Math.round(sec * FPS)
export const TITLE_START = S(3600) // titles and gaps start at 1:00:00:00 internally, like FCP's own exports
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '&#10;')
export const mmss = f => `${Math.floor(f / FPS / 60)}:${pad2(Math.floor(f / FPS) % 60)}`

// ------------------------------------------------------------------ template catalogue (.moti → text layers)
const templateCache = new Map()

/**
 * Text layers of one installed-style template, in layer order (top of the Layers list first).
 * Every template sits in one CRMA category per browser, grouped by theme (`folder`); a theme named
 * after its browser (Transitions) is dropped, so those templates sit straight in CRMA.
 */
export function template(kind, folder, name) {
  const ext = { Titles: 'moti', Transitions: 'motr', Effects: 'moef', Generators: 'motn' }[kind]
  const theme = folder === kind ? '' : `${folder}/`
  const rel = `${kind}.localized/CRMA/${theme}${name}/${name}.${ext}`
  if (templateCache.has(rel)) return templateCache.get(rel)
  const file = join(TEMPLATES, rel)
  if (!existsSync(file)) throw new Error(`template not in the kit: ${rel}`)
  const t = { rel, uid: `~/${rel}`, name, kind, texts: kind === 'Titles' ? readTextLayers(readFileSync(file, 'utf8')) : [] }
  templateCache.set(rel, t)
  return t
}

/** Every CRMA title as [group, name], for --catalog. */
export function titleCatalog() {
  const dir = join(TEMPLATES, 'Titles.localized', 'CRMA')
  return readdirSync(dir).filter(f => !f.startsWith('.')).sort()
    .flatMap(folder => readdirSync(join(dir, folder)).filter(n => !n.startsWith('.')).sort().map(name => [folder, name]))
}

function unescapeXml(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, '\'').replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&')
}

function readTextLayers(xml) {
  const out = []
  // Text objects are the scenenodes that open with paragraphMarginsCached (Apple text object layout).
  const re = /<scenenode name="([^"]*)" id="(\d+)" factoryID="\d+" version="\d+"><paragraphMarginsCached/g
  let m
  while ((m = re.exec(xml))) {
    const seg = xml.slice(m.index, xml.indexOf('</scenenode>', m.index))
    const font = /<font>([^<]+)<\/font>/.exec(seg)?.[1] ?? 'Helvetica'
    const size = +(/<parameter name="Size" id="3" [^>]*value="([\d.]+)"/.exec(seg)?.[1] ?? 48)
    const chan = c => +(new RegExp(`<parameter name="${c}" id="\\d" [^>]*?(?:value="([\\d.]+)")?/>`).exec(seg)?.[1] ?? 1)
    const align = ['left', 'center', 'right'][+(/<parameter name="Alignment" id="401" [^>]*value="(\d)"/.exec(seg)?.[1] ?? 0)] ?? 'left'
    const text = unescapeXml(/<text>([\s\S]*?)<\/text>/.exec(seg)?.[1] ?? '')
    out.push({ layer: unescapeXml(m[1]), text, font, size, color: [chan('Red'), chan('Green'), chan('Blue')], align })
  }
  return out
}

/** PostScript name → FCPXML font family + face ("SchibstedGrotesk-ExtraBold" → "Schibsted Grotesk", "ExtraBold"). */
export function fontOf(ps) {
  const [fam, face = 'Regular'] = ps.split('-')
  const family = { SchibstedGrotesk: 'Schibsted Grotesk', IBMPlexMono: 'IBM Plex Mono' }[fam] ?? fam.replace(/([a-z])([A-Z])/g, '$1 $2')
  return { family, face }
}

/**
 * One project's effect resources plus the <title> writer that registers them.
 * titleXml(t, { offset, start, frames, lane, name, values, markers }): values maps a text layer name → new
 * text; every layer is written, so the template's order is kept.
 */
export function effectsWriter() {
  const effects = new Map()
  let tsN = 0
  const effectId = (t) => {
    if (!effects.has(t.uid)) effects.set(t.uid, { id: `e${effects.size + 1}`, t })
    return effects.get(t.uid).id
  }
  function titleXml(t, { offset, start = TITLE_START, frames, lane, name, values = {}, markers = '' }) {
    const unknown = Object.keys(values).filter(k => !t.texts.some(x => x.layer === k))
    if (unknown.length) throw new Error(`${t.name}: no text layer ${unknown.join(', ')}`)
    let texts = '', defs = ''
    for (const x of t.texts) {
      const id = `ts${++tsN}`
      const v = values[x.layer] ?? x.text
      const { family, face } = fontOf(x.font)
      texts += `<text><text-style ref="${id}">${esc(v)}</text-style></text>`
      defs += `<text-style-def id="${id}"><text-style font="${esc(family)}" fontSize="${x.size}" fontFace="${esc(face)}" fontColor="${x.color.map(c => c.toFixed(4)).join(' ')} 1" alignment="${x.align}"/></text-style-def>`
    }
    return `<title ref="${effectId(t)}"${lane ? ` lane="${lane}"` : ''} offset="${T(offset)}" name="${esc(name ?? t.name)}" start="${T(start)}" duration="${T(frames)}">${texts}${defs}${markers}</title>`
  }
  const resources = () => [...effects.values()].map(({ id, t }) => `<effect id="${id}" name="${esc(t.name)}" uid="${esc(t.uid)}"/>`).join('')
  return { effectId, titleXml, resources }
}

// ------------------------------------------------------------------ text helpers
export const plain = s => String(s ?? '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, '$1$2')
  .replace(/(^|\W)[*_]([^*_]+)[*_](?=\W|$)/g, '$1$2')
  .replace(/:[a-z-]+\{[^}]*\}/g, '')
  .replace(/\s*->\s*/g, ' → ')
  .replace(/\s+/g, ' ')
  .trim()

/** Cut at a word boundary to at most n characters. */
export function fit(s, n) {
  s = plain(s)
  if (s.length <= n) return s
  const cut = s.slice(0, n - 1)
  const sp = cut.lastIndexOf(' ')
  return `${(sp > n * 0.5 ? cut.slice(0, sp) : cut).replace(/[\s,;:—–-]+$/, '')}…`
}

/** Split into two balanced lines, each at most n characters. */
export function split2(s, n) {
  s = plain(s)
  if (s.length <= n) return [s, '']
  const words = s.split(' ')
  let best = [s, ''], score = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ')
    const sc = Math.max(a.length, b.length)
    if (sc < score) {
      score = sc
      best = [a, b]
    }
  }
  return [fit(best[0], n), fit(best[1], n)]
}

export const pad2 = n => String(n).padStart(2, '0')
export const up = s => plain(s).toUpperCase()
export const human = sec => (sec >= 60 ? `${Math.round(sec / 60)} MIN` : `${sec} SEC`)

/** One element per line for the resources and spine, so diffs and eyeballing work. */
export function pretty(xml) {
  return xml
    .replace(/<(format|effect|asset|title|gap|transition|event|project|sequence|spine|\/spine|\/resources|\/sequence)([ >])/g, '\n<$1$2')
    .replace(/\n<(title|gap|transition)/g, '\n  <$1')
    .replace(/\n+/g, '\n')
}
