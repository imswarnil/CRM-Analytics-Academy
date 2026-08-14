/**
 * Normalisation for admin-authored sections and lessons.
 *
 * Mirrors the markdown frontmatter contract in content.config.ts as closely as
 * the database allows, so a lesson authored in the admin UI behaves the same as
 * one committed as a file: same access levels, same video clip shape, same quiz
 * structure.
 */
import { slugify } from '~~/server/utils/posts'
import type { QuizQuestion } from '~~/server/utils/quiz'
import type { Database } from '~~/types/database.types'

type SectionInsert = Database['public']['Tables']['sections']['Insert']
type SectionUpdate = Database['public']['Tables']['sections']['Update']
type LessonInsert = Database['public']['Tables']['lessons']['Insert']
type LessonUpdate = Database['public']['Tables']['lessons']['Update']

export interface SectionInput {
  slug?: string
  title?: string
  description?: string | null
  icon?: string
  status?: 'draft' | 'published'
  position?: number
}

export interface LessonInput {
  sectionId?: string
  slug?: string
  title?: string
  description?: string | null
  body?: string | null
  status?: 'draft' | 'published'
  access?: 'public' | 'members'
  videoId?: string | null
  videoStart?: number | null
  videoEnd?: number | null
  quiz?: QuizQuestion[] | null
  passScore?: number
  position?: number
}

function trimOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function bad(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

function optionalInt(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) bad(`${field} must be a positive number of seconds`)
  return Math.floor(n)
}

/**
 * Accepts a bare YouTube id or any common YouTube URL and returns the id.
 * Admins paste whatever is in their address bar; this saves them the surgery.
 */
export function normaliseVideoId(value: unknown): string | null {
  const raw = trimOrNull(value)
  if (!raw) return null

  if (/^[\w-]{11}$/.test(raw)) return raw

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1)
      if (/^[\w-]{11}$/.test(id)) return id
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const v = url.searchParams.get('v')
      if (v && /^[\w-]{11}$/.test(v)) return v
      const embed = url.pathname.match(/^\/(?:embed|v|shorts)\/([\w-]{11})/)
      if (embed?.[1]) return embed[1]
    }
  } catch {
    // Not a URL — fall through to the error below.
  }

  bad(`Could not read a YouTube video id from "${raw}"`)
}

function validateQuiz(value: unknown): QuizQuestion[] | null {
  if (value === null || value === undefined) return null
  if (!Array.isArray(value)) bad('Quiz must be a list of questions')

  return value.map((item, i) => {
    const row = item as Partial<QuizQuestion>
    const q = trimOrNull(row.q)
    if (!q) bad(`Quiz question ${i + 1} is missing its text`)

    const options = Array.isArray(row.options)
      ? row.options.map(o => String(o).trim()).filter(Boolean)
      : []
    if (options.length < 2) bad(`Quiz question ${i + 1} needs at least two options`)

    const answer = Number(row.answer)
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
      bad(`Quiz question ${i + 1} has an answer index outside its options`)
    }

    const skill = trimOrNull(row.skill)
    return skill ? { q, options, answer, skill } : { q, options, answer }
  })
}

export function buildSectionRow(input: SectionInput, partial: true): SectionUpdate
export function buildSectionRow(input: SectionInput, partial?: false): SectionInsert
export function buildSectionRow(input: SectionInput, partial = false): SectionInsert | SectionUpdate {
  const row: Record<string, unknown> = {}

  const title = trimOrNull(input.title)
  if (title !== null) {
    row.title = title
  } else if (!partial) {
    bad('Section title is required')
  }

  if (input.slug !== undefined || title !== null) {
    const slug = slugify(trimOrNull(input.slug) || title || '')
    if (!slug) bad('Could not derive a section slug')
    row.slug = slug
  }

  if (input.description !== undefined) row.description = trimOrNull(input.description)
  if (input.icon !== undefined) row.icon = trimOrNull(input.icon) ?? 'i-lucide-book-open'
  if (input.position !== undefined) row.position = optionalInt(input.position, 'Position') ?? 0

  if (input.status !== undefined) {
    if (input.status !== 'draft' && input.status !== 'published') bad('Invalid section status')
    row.status = input.status
  }

  return row as unknown as SectionInsert & SectionUpdate
}

export function buildLessonRow(input: LessonInput, partial: true): LessonUpdate
export function buildLessonRow(input: LessonInput, partial?: false): LessonInsert
export function buildLessonRow(input: LessonInput, partial = false): LessonInsert | LessonUpdate {
  const row: Record<string, unknown> = {}

  const sectionId = trimOrNull(input.sectionId)
  if (sectionId !== null) {
    row.section_id = sectionId
  } else if (!partial) {
    bad('A lesson must belong to a section')
  }

  const title = trimOrNull(input.title)
  if (title !== null) {
    row.title = title
  } else if (!partial) {
    bad('Lesson title is required')
  }

  if (input.slug !== undefined || title !== null) {
    const slug = slugify(trimOrNull(input.slug) || title || '')
    if (!slug) bad('Could not derive a lesson slug')
    row.slug = slug
  }

  if (input.description !== undefined) row.description = trimOrNull(input.description)
  if (input.body !== undefined) row.body = trimOrNull(input.body)
  if (input.position !== undefined) row.position = optionalInt(input.position, 'Position') ?? 0

  if (input.status !== undefined) {
    if (input.status !== 'draft' && input.status !== 'published') bad('Invalid lesson status')
    row.status = input.status
  }

  if (input.access !== undefined) {
    if (input.access !== 'public' && input.access !== 'members') bad('Invalid access level')
    row.access = input.access
  }

  if (input.videoId !== undefined) row.video_id = normaliseVideoId(input.videoId)
  if (input.videoStart !== undefined) row.video_start = optionalInt(input.videoStart, 'Video start')
  if (input.videoEnd !== undefined) row.video_end = optionalInt(input.videoEnd, 'Video end')

  // Only meaningful when both ends are present in this same payload; the DB
  // CHECK constraint is the backstop for partial updates.
  const start = row.video_start as number | null | undefined
  const end = row.video_end as number | null | undefined
  if (typeof start === 'number' && typeof end === 'number' && end <= start) {
    bad('Video end must come after video start')
  }

  if (input.quiz !== undefined) row.quiz = validateQuiz(input.quiz)

  if (input.passScore !== undefined) {
    const score = Number(input.passScore)
    if (!Number.isFinite(score) || score < 1 || score > 100) {
      bad('Pass score must be between 1 and 100')
    }
    row.pass_score = Math.round(score)
  }

  return row as unknown as LessonInsert & LessonUpdate
}
