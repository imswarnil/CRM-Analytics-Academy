/**
 * "1 lesson" / "4 lessons". vue-i18n's `|` plural syntax is refused by the
 * translation pipeline (a translated `|` can break the compile), so the
 * singular is its own message.
 */
export function lessonsLabel(t: (key: string, values?: Record<string, unknown>) => string, n: number): string {
  return n === 1 ? t('curriculumPage.lessonOne') : t('curriculumPage.lessons', { n })
}
