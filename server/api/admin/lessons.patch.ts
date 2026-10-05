/**
 * Change a lesson's access tier and/or its Mux playback id, by committing
 * the edit to the lesson's English file on GitHub. The deploy that commit
 * triggers applies it to every language: scripts/gate-content.mjs takes
 * access and videos from the English file.
 *
 * Only the `access:` line and the `mux:` key are touched, so the commit
 * diff is two or three lines rather than a re-serialised frontmatter. One
 * video per lesson: every locale plays the same asset with its own captions,
 * so `mux` is a single id (an old per-language block is replaced by it).
 */
const PLAYBACK_ID = /^[A-Za-z0-9]{8,80}$/

function setFrontmatter(raw: string, access: 'free' | 'pro', mux: string): string {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) throw createError({ statusCode: 422, statusMessage: 'The lesson has no frontmatter.' })
  const lines = m[1]!.split(/\r?\n/)
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (/^access:/.test(line)) continue
    if (/^mux:/.test(line)) {
      // Drop the mux block: the key line and any indented lines under it.
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1]!)) i++
      continue
    }
    out.push(line)
  }
  const insert: string[] = []
  if (access === 'pro') insert.push('access: pro')
  if (mux) insert.push(`mux: ${mux}`)
  // Just before `description:`, which every lesson has, so the new keys sit
  // near the top where an author reading the file will see them.
  const at = out.findIndex(l => /^description:/.test(l))
  out.splice(at >= 0 ? at : out.length, 0, ...insert)
  return raw.replace(m[0], `---\n${out.join('\n')}\n---`)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const token = requireContentToken()
  const repo = contentRepo()

  const body = await readBody<{ file?: unknown, access?: unknown, mux?: unknown }>(event)
  const path = assertLessonPath(`content/${String(body?.file ?? '')}`)
  const access = body?.access === 'pro' ? 'pro' : 'free'

  const mux = String(body?.mux ?? '').trim()
  if (mux && !PLAYBACK_ID.test(mux)) {
    throw createError({ statusCode: 400, statusMessage: 'That is not a Mux playback id.' })
  }

  const url = `https://api.github.com/repos/${repo}/contents/${path}`
  const file = await $fetch<{ sha: string, content: string }>(url, { headers: ghHeaders(token) })
  const raw = Buffer.from(file.content, 'base64').toString('utf8')
  const next = setFrontmatter(raw, access, mux)
  if (next === raw) return { ok: true, unchanged: true }

  const res = await $fetch<{ commit?: { html_url?: string } }>(url, {
    method: 'PUT',
    headers: ghHeaders(token),
    body: {
      message: `content: ${path.replace('content/en/', '')} → ${access}${mux ? ', video' : ''} (admin)`,
      content: Buffer.from(next, 'utf8').toString('base64'),
      sha: file.sha
    }
  })
  return { ok: true, commitUrl: res.commit?.html_url ?? null }
})
