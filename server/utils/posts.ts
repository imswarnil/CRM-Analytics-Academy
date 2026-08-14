/**
 * Shared normalisation for admin post writes.
 *
 * Curated (external) posts carry attribution to whoever actually wrote them.
 * We refuse to publish one without a source URL and an author name — that
 * credit line is the whole point of the external-post flow, so it is enforced
 * here as well as by a CHECK constraint in the database.
 */

import type { Database } from '~~/types/database.types'

type PostInsert = Database['public']['Tables']['posts']['Insert']
type PostUpdate = Database['public']['Tables']['posts']['Update']

export interface PostInput {
  slug?: string
  title?: string
  description?: string | null
  body?: string | null
  coverUrl?: string | null
  tags?: string[]
  status?: 'draft' | 'published'
  isExternal?: boolean
  sourceUrl?: string | null
  sourceName?: string | null
  authorName?: string | null
  authorUrl?: string | null
  excerptOnly?: boolean
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

/** Only http(s) links — keeps javascript: and data: URLs out of rendered credit lines. */
function safeUrl(value: unknown): string | null {
  const raw = trimOrNull(value)
  if (!raw) return null
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: `Not a valid URL: ${raw}` })
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'Links must be http or https' })
  }
  return parsed.toString()
}

/**
 * Map an API payload onto a posts row. `partial` skips the required-field checks
 * so the same function can serve both create and update.
 */
export function buildPostRow(input: PostInput, partial: true): PostUpdate
export function buildPostRow(input: PostInput, partial?: false): PostInsert
export function buildPostRow(input: PostInput, partial = false): PostInsert | PostUpdate {
  const row: Record<string, unknown> = {}

  const title = trimOrNull(input.title)
  if (title !== null) {
    row.title = title
  } else if (!partial) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  if (input.slug !== undefined || title !== null) {
    const slug = slugify(trimOrNull(input.slug) || title || '')
    if (!slug) {
      throw createError({ statusCode: 400, statusMessage: 'Could not derive a slug' })
    }
    row.slug = slug
  }

  if (input.description !== undefined) row.description = trimOrNull(input.description)
  if (input.body !== undefined) row.body = trimOrNull(input.body)
  if (input.coverUrl !== undefined) row.cover_url = safeUrl(input.coverUrl)

  if (input.tags !== undefined) {
    row.tags = Array.isArray(input.tags)
      ? input.tags.map(t => String(t).trim()).filter(Boolean).slice(0, 12)
      : []
  }

  if (input.status !== undefined) {
    if (input.status !== 'draft' && input.status !== 'published') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
    }
    row.status = input.status
    // Stamp the publish date the first time it goes live; the endpoint clears
    // it again when a post is pulled back to draft.
    row.published_at = input.status === 'published' ? new Date().toISOString() : null
  }

  if (input.isExternal !== undefined) row.is_external = Boolean(input.isExternal)
  if (input.sourceUrl !== undefined) row.source_url = safeUrl(input.sourceUrl)
  if (input.sourceName !== undefined) row.source_name = trimOrNull(input.sourceName)
  if (input.authorName !== undefined) row.author_name = trimOrNull(input.authorName)
  if (input.authorUrl !== undefined) row.author_url = safeUrl(input.authorUrl)
  if (input.excerptOnly !== undefined) row.excerpt_only = Boolean(input.excerptOnly)

  // Built dynamically above; the required-field checks are what make the
  // Insert shape true in the non-partial case.
  return row as unknown as PostInsert & PostUpdate
}

/**
 * Attribution guard. Runs against the MERGED row (existing + patch) so a
 * partial update can't strip the credit off an already-external post.
 */
export function assertAttribution(merged: {
  is_external?: boolean | null
  source_url?: string | null
  author_name?: string | null
}) {
  if (!merged.is_external) return
  if (!merged.source_url || !merged.author_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'External posts need the original author name and a link to the source'
    })
  }
}
