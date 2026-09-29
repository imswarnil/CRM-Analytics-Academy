/**
 * Every English lesson with its access tier and videos, for the admin
 * Lessons view. Read from the manifest scripts/gate-content.mjs writes at build
 * time, so it reflects what is deployed — an edit made here appears after the
 * next deploy, which the view says.
 */
interface LessonRow {
  file: string
  route: string
  section: string
  title: string
  access: 'free' | 'pro'
  mux: string | Record<string, string> | null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const lessons = await useStorage('assets:server').getItem<LessonRow[]>('lessons.json')
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { lessons: lessons ?? [] }
})
