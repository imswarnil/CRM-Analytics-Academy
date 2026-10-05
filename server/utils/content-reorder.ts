/**
 * The plan for a reorder: which paths move, in every locale, and how the
 * translation manifest's keys follow them. Pure — no I/O — so it can be read
 * (and tested) on its own; reorder.post.ts fetches the inputs and commits the
 * result as one commit.
 *
 * Order lives in the numeric prefix of a name (03.functions.md, 07.saql), so
 * reordering is renaming. Three things must move together or the pipeline
 * breaks:
 *
 *   1. content/en/<path> — the source.
 *   2. content/<locale>/<same relative path> in every locale that has it.
 *      Leaving a translation under its old prefix would put it in a different
 *      position in that language's sidebar, and leave an orphan the next
 *      translate run never touches.
 *   3. .translation-manifest.json keys `<locale>:<relative path>`. A key that
 *      no longer matches a file reads as "never translated", and the next run
 *      re-translates the file from scratch — eleven languages of LibreTranslate
 *      time for a lesson whose text did not change.
 *
 * Routes do not change: the prefix is stripped from URLs, so progress,
 * comments and Pro gating (all keyed by route) are unaffected.
 */

export interface ReorderEntry {
  /** Path relative to content/: "es/07.saql/03.functions.md". */
  path: string
  type: 'blob' | 'tree' | 'commit'
  sha: string
  mode: string
}

export interface ReorderPlan {
  /** old name → new name, for the names that change. */
  renames: Record<string, string>
  /**
   * Repo paths (content/...) to add, pointing at an existing object: a blob
   * for a moved lesson, a whole tree for a moved section folder.
   */
  adds: { path: string, sha: string, mode: string, type: 'blob' | 'tree' }[]
  /** Repo paths to remove. */
  removes: string[]
  /** The manifest with its keys renamed, or null when no key changed. */
  manifest: Record<string, unknown> | null
  manifestKeys: number
}

function prefixOf(name: string): { num: number, width: number, rest: string } | null {
  const m = name.match(/^(\d+)\.(.+)$/)
  return m ? { num: Number(m[1]), width: Math.max(2, m[1]!.length), rest: m[2]! } : null
}

/**
 * New names for `order` (current names, in the wanted order). Numbering keeps
 * the folder's own start (00 for sections, 01 for lessons) and its width.
 */
export function renumber(current: string[], order: string[]): Record<string, string> {
  const same = current.length === order.length
    && new Set(order).size === order.length
    && order.every(n => current.includes(n))
  if (!same) throw new Error('The new order must list exactly the current items.')
  const parsed = current.map(prefixOf)
  if (parsed.some(p => !p)) throw new Error('Every item needs a numeric prefix.')
  const start = Math.min(...parsed.map(p => p!.num))
  const width = Math.max(...parsed.map(p => p!.width))
  const out: Record<string, string> = {}
  order.forEach((name, i) => {
    const next = `${String(start + i).padStart(width, '0')}.${prefixOf(name)!.rest}`
    if (next !== name) out[name] = next
  })
  return out
}

/**
 * @param scope  "07.saql" to reorder lessons inside a section; "" for sections.
 * @param renames old → new names within that scope (from renumber()).
 * @param entries every blob under content/ (paths relative to content/).
 * @param locales the locale folders to carry the move into.
 */
export function planReorder(opts: {
  scope: string
  renames: Record<string, string>
  entries: ReorderEntry[]
  locales: readonly string[]
  manifest: Record<string, unknown> | null
}): ReorderPlan {
  const { scope, renames } = opts
  const base = scope ? `${scope}/` : ''

  // rel = path inside a locale folder ("07.saql/03.functions.md").
  const moveRel = (rel: string): string | null => {
    if (!rel.startsWith(base)) return null
    const tail = rel.slice(base.length)
    const slash = tail.indexOf('/')
    const head = slash === -1 ? tail : tail.slice(0, slash)
    const next = renames[head]
    if (!next) return null
    // Lessons are files (no slash after the name); sections are folders.
    if (scope && slash !== -1) return null
    if (!scope && slash === -1) return null
    return `${base}${next}${slash === -1 ? '' : tail.slice(slash)}`
  }

  // Lessons move file by file. A section moves as one tree entry per locale
  // (its folder's existing tree object at the new name) instead of every file
  // in the folder, while the old folder is cleared file by file - the
  // deletion form the Git Data API documents.
  const target = new Map<string, { sha: string, mode: string, type: 'blob' | 'tree' }>()
  const moved: string[] = []
  for (const e of opts.entries) {
    const slash = e.path.indexOf('/')
    if (slash === -1) continue
    const locale = e.path.slice(0, slash)
    if (!opts.locales.includes(locale)) continue
    const rel = e.path.slice(slash + 1)
    const next = moveRel(rel)
    if (scope) {
      if (e.type !== 'blob' || !next) continue
      target.set(`content/${locale}/${next}`, { sha: e.sha, mode: e.mode, type: 'blob' })
      moved.push(`content/${e.path}`)
    } else if (e.type === 'tree' && !rel.includes('/') && renames[rel]) {
      target.set(`content/${locale}/${renames[rel]}`, { sha: e.sha, mode: '040000', type: 'tree' })
    } else if (e.type === 'blob' && next) {
      moved.push(`content/${e.path}`)
    }
  }
  // A swap (01<->02) moves a file onto a path another file is leaving: that
  // path is written, not removed. Section slugs are unique, so a new folder
  // never shares a path with an old one.
  const removes = moved.filter(p => !target.has(p))
  const adds = [...target.entries()].map(([path, v]) => ({ path, ...v }))

  let manifest: Record<string, unknown> | null = null
  let manifestKeys = 0
  if (opts.manifest) {
    const next: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(opts.manifest)) {
      const colon = key.indexOf(':')
      const locale = key.slice(0, colon)
      const rel = colon === -1 || locale === 'ui' ? null : moveRel(key.slice(colon + 1))
      if (rel) {
        next[`${locale}:${rel}`] = value
        manifestKeys++
      } else if (!(key in next)) {
        next[key] = value
      }
    }
    if (manifestKeys) manifest = next
  }

  return { renames, adds, removes, manifest, manifestKeys }
}
