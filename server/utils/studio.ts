/**
 * Shared helpers for the Content Studio (server/api/admin/studio/*).
 *
 * The Studio authors real markdown files under content/ — docs lessons
 * (content/en/<section>/<lesson>.md) and blog posts (content/blog/<slug>.md).
 * Vercel's filesystem is read-only at runtime, which is why the DB-backed
 * Learn content builder (sections/lessons tables) exists as a separate
 * feature — this tool only works locally, under `pnpm dev`. Every endpoint
 * must call `requireLocalDev()` in addition to `requireAdmin()`.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

export const CONTENT_ROOT = path.join(process.cwd(), 'content')
export const DOCS_LOCALE = 'en'
export const BLOG_DIR = 'blog'

/** Vercel always sets NODE_ENV=production at runtime; `pnpm dev` does not. */
export function isLocalDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function requireLocalDev(): void {
  if (!isLocalDev()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Content Studio only works when running locally (pnpm dev) — the production filesystem is read-only.'
    })
  }
}

/**
 * Resolves a client-supplied path (relative to the content/ root) to an
 * absolute filesystem path, refusing anything that could escape the content
 * directory: absolute paths, `..` segments, or a resolved path that lands
 * outside CONTENT_ROOT. Every filesystem operation in the Studio API must
 * route through this — it is the only defense against path traversal since
 * the path segments come straight from the client.
 */
export function safeContentPath(relPath: unknown): string {
  if (typeof relPath !== 'string' || !relPath.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing path' })
  }
  if (path.isAbsolute(relPath)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }
  const segments = relPath.split(/[\\/]+/)
  if (segments.some(s => s === '..' || s === '.')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }
  const resolved = path.resolve(CONTENT_ROOT, relPath)
  if (resolved !== CONTENT_ROOT && !resolved.startsWith(CONTENT_ROOT + path.sep)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }
  return resolved
}

/** A single path segment (a file/folder name) — no separators, no traversal. */
export function safeSegment(segment: unknown, field = 'name'): string {
  if (typeof segment !== 'string' || !segment.trim()) {
    throw createError({ statusCode: 400, statusMessage: `Missing ${field}` })
  }
  if (/[\\/]/.test(segment) || segment === '..' || segment === '.') {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` })
  }
  return segment
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

/** Parses a markdown file with a YAML frontmatter fence. */
export function parseFrontmatterFile(raw: string): { data: Record<string, unknown>, body: string } {
  const match = FRONTMATTER_RE.exec(raw)
  if (!match) return { data: {}, body: raw }
  const data = (YAML.parse(match[1] ?? '') as Record<string, unknown>) || {}
  return { data, body: match[2] ?? '' }
}

/** Serialises a frontmatter object + markdown body back into a file. */
export function stringifyFrontmatterFile(data: Record<string, unknown>, body: string): string {
  const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== ''))
  const yaml = YAML.stringify(cleaned, { lineWidth: 0 }).trimEnd()
  const trimmedBody = body.replace(/^\n+/, '').trimEnd()
  return `---\n${yaml}\n---\n\n${trimmedBody}\n`
}

/** Slugify a title into a filesystem/URL-safe kebab-case slug. */
export function slugifySegment(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const PREFIXED_RE = /^(\d+)\.(.+)$/

/** Splits a "3.creating-datasets" folder/file stem into its number + slug. */
export function parsePrefixed(name: string): { num: number, slug: string } | null {
  const match = PREFIXED_RE.exec(name)
  if (!match) return null
  return { num: Number(match[1]), slug: match[2] ?? '' }
}

export function bad(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

/** true if a directory exists (and is a directory). */
export async function dirExists(p: string): Promise<boolean> {
  try {
    return (await fs.stat(p)).isDirectory()
  } catch {
    return false
  }
}

export async function fileExists(p: string): Promise<boolean> {
  try {
    return (await fs.stat(p)).isFile()
  } catch {
    return false
  }
}
