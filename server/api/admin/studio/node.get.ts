import { promises as fs } from 'node:fs'
import YAML from 'yaml'
import { requireAdmin } from '~~/server/utils/auth'
import { bad, fileExists, parseFrontmatterFile, safeContentPath } from '~~/server/utils/studio'

/**
 * Full contents of a single lesson/blog file, or a section's .navigation.yml —
 * the tree endpoint only returns titles/flags for the list view, this backs
 * the editor panel once something is selected.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const kind = query.kind
  const nodePath = query.path
  if (kind !== 'section' && kind !== 'lesson' && kind !== 'blog') bad('Invalid kind')
  if (typeof nodePath !== 'string') bad('Missing path')

  if (kind === 'section') {
    const abs = safeContentPath(`${nodePath}/.navigation.yml`)
    if (!(await fileExists(abs))) bad('Section not found')
    const raw = await fs.readFile(abs, 'utf8')
    const data = (YAML.parse(raw) as Record<string, unknown>) || {}
    return { frontmatter: data, body: '' }
  }

  const abs = safeContentPath(nodePath)
  if (!(await fileExists(abs))) bad('File not found')
  const raw = await fs.readFile(abs, 'utf8')
  const { data, body } = parseFrontmatterFile(raw)
  return { frontmatter: data, body }
})
