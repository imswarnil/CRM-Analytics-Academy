import { promises as fs } from 'node:fs'
import { requireAdmin } from '~~/server/utils/auth'
import { bad, dirExists, fileExists, requireLocalDev, safeContentPath } from '~~/server/utils/studio'

interface DeleteInput {
  kind: 'section' | 'lesson' | 'blog'
  path: string
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  requireLocalDev()

  const input = await readBody<DeleteInput>(event)
  if (!input?.kind) bad('Missing kind')
  if (!input.path) bad('Missing path')

  const abs = safeContentPath(input.path)

  if (input.kind === 'section') {
    if (!(await dirExists(abs))) bad('Section not found')
    const entries = await fs.readdir(abs)
    const remaining = entries.filter(name => name !== '.navigation.yml')
    if (remaining.length) {
      throw createError({
        statusCode: 400,
        statusMessage: `Section is not empty — delete its lessons first: ${remaining.join(', ')}`
      })
    }
    await fs.rm(abs, { recursive: true })
    return { ok: true }
  }

  // lesson or blog: a single markdown file.
  if (!(await fileExists(abs))) bad('File not found')
  await fs.rm(abs)
  return { ok: true }
})
