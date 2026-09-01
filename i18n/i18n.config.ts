export default defineI18nConfig(() => ({
  legacy: false,

  /**
   * Fall back to English for any key a locale is missing.
   *
   * Without this, vue-i18n renders the key itself — so a Spanish lesson page
   * showed the literal text `course.curriculum`, `course.next`,
   * `course.nextLesson`. That was live on roughly 700 of the site's 780 pages,
   * because English gained ~110 keys (the course player, the dashboard, auth,
   * submissions, the leaderboard) that the other eleven locales do not have
   * yet.
   *
   * The translation pipeline is what eventually fills those in — English is
   * the source of truth and `pnpm translate --only=ui` generates the rest —
   * but a pipeline that has not run yet must degrade to English prose, never
   * to a dotted identifier. This is the safety net, not a substitute for
   * translating: a key that falls back is still an untranslated string, it is
   * just a readable one.
   */
  fallbackLocale: 'en',

  /**
   * The fallback above is expected and routine, so the warning it would
   * otherwise log on every render is noise that hides real problems. Missing
   * keys are found by scripts/translate.mjs and by the manifest, not by
   * reading the console.
   */
  fallbackWarn: false,
  missingWarn: false
}))
