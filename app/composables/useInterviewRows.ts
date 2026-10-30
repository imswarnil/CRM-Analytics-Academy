export interface InterviewRow {
  path: string
  title: string
  description?: string
  type: string
  topic: string
  level: string
  company?: string
  role?: string
  source: string
}

/**
 * Every interview question's metadata for the current locale (untranslated
 * ones fall back to English, so the list is complete). One keyed fetch, shared
 * by the collection page and its children — the list, the open question's
 * previous/next, and the index's ItemList all read the same rows.
 *
 * The Worker has no content database (see app.vue): there it returns nothing,
 * and only prerendered pages ever show the list.
 */
export function useInterviewRows() {
  const { locale } = useI18n()
  return useAsyncData(`interview-list-${locale.value}`, async () => {
    if (import.meta.server && !import.meta.prerender && !import.meta.dev) return []
    const pick = (loc: string) => queryCollection('interview')
      .where('path', 'LIKE', `/${loc}/interview-questions/%`)
      .select('path', 'title', 'description', 'type', 'topic', 'level', 'company', 'role', 'source')
      .all()
    const own = await pick(locale.value)
    if (locale.value === DEFAULT_LOCALE) return own as InterviewRow[]
    const en = await pick(DEFAULT_LOCALE)
    const have = new Set(own.map(r => r.path.split('/').pop()))
    return [...own, ...en.filter(r => !have.has(r.path.split('/').pop()))] as InterviewRow[]
  }, { default: () => [] as InterviewRow[] })
}
