/**
 * Shared configuration for the translation pipeline (scripts/translate.mjs).
 *
 * Kept separate from nuxt.config.ts on purpose: the script runs as plain Node
 * with no bundler, so it cannot import a TypeScript Nuxt config. The locale
 * list here must be kept in sync with `i18n.locales` in nuxt.config.ts.
 */

/** The language every translation is produced from. */
export const SOURCE_LOCALE = 'en'

/**
 * Site locale code → LibreTranslate language code.
 *
 * These are deliberately not always identical: LibreTranslate speaks
 * `zh-Hans` (not `zh`) and `pt-BR` (not `pt`). Verify any new entry against
 * `GET /languages` on the server before adding it — an unknown target code
 * makes the API return 400 for every request.
 */
export const TARGET_LOCALES = {
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt-BR',
  ja: 'ja',
  zh: 'zh-Hans',
  hi: 'hi',
  ar: 'ar',
  ru: 'ru',
  bn: 'bn',
  ur: 'ur'
}

/**
 * Each locale's name for itself, used for the `language` UI key and the
 * language switcher. This must never be machine-translated: asked to translate
 * the English string "English" into Arabic, the engine correctly returns
 * "الإنكليزية" — the Arabic word for the English language — when what the menu
 * needs is "العربية". Keep in sync with `name` in nuxt.config.ts.
 */
export const NATIVE_NAMES = {
  en: 'English',
  es: 'Espa\u00f1ol',
  fr: 'Fran\u00e7ais',
  de: 'Deutsch',
  pt: 'Portugu\u00eas',
  ja: '\u65e5\u672c\u8a9e',
  zh: '\u4e2d\u6587',
  hi: '\u0939\u093f\u0928\u094d\u0926\u0940',
  ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
  ru: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',
  bn: '\u09ac\u09be\u0982\u09b2\u09be',
  ur: '\u0627\u0631\u062f\u0648'
}

/** Locales that read right-to-left (mirrors `dir: 'rtl'` in nuxt.config.ts). */
export const RTL_LOCALES = ['ar', 'ur']

/**
 * Terms that must survive translation untouched.
 *
 * Matching is case-sensitive and whole-word.
 *
 * KEEP THIS LIST SHORT. Every protected term becomes a tag, and the engine
 * translates each span between tags independently — so tags fragment the
 * sentence and the words *around* them stop being translated. Measured on
 * "An Opportunity looks up to an Account and to a User owner":
 *
 *   unprotected → ru "Возможность смотреть для учетной записи…"   (clean)
 *   protected   → ru "Ан <Opportunity> смотреть для ан <Account>…" (An/ан leaks)
 *   unprotected → hi "एक अवसर देखो एक खाता और उपयोगकर्ता…"          (clean)
 *   protected   → hi "An <Opportunity> देखो to a <Account>…"       (An/to a leak)
 *
 * So standard object names that are also ordinary English words — Opportunity,
 * Account, User, Case, Lead, Contact, Campaign, Setup — are deliberately NOT
 * protected: they translate acceptably on their own and protecting them wrecks
 * the sentence. Only terms that are genuinely opaque (product names, acronyms,
 * API identifiers) earn a slot, because those are rare enough per sentence that
 * the fragmentation cost is small and mistranslating them is worse.
 *
 * Longest-first ordering is applied at match time, so "CRM Analytics" wins
 * over a bare "Analytics" entry.
 */
export const GLOSSARY = [
  // Products and surfaces
  'CRM Analytics',
  'Tableau CRM',
  'Einstein Analytics',
  'Einstein Discovery',
  'Einstein Prediction Builder',
  'Analytics Studio',
  'Dataset Builder',
  'Data Manager',
  'Data Prep',
  'Dataflow',
  // A "Lens" is a named CRM Analytics object (a saved exploration), not the
  // everyday word. Left unprotected the engine reaches for the optical sense
  // and gets it badly wrong: es "Sentidos" (senses), fr "Objectifs" (camera
  // lenses), de "Linsen" (lentils). Only the capitalised form is matched, so
  // ordinary prose using "lens" lowercase still translates normally.
  'Lenses',
  'Lens',
  'Salesforce',
  'Sales Cloud',
  'Service Cloud',
  'Experience Cloud',
  'Marketing Cloud',
  'Lightning Experience',
  'App Builder',
  'AppExchange',
  'Trailhead',
  'Trailblazer Community',
  'Salesforce CLI',
  'Workbench',
  'Postman',
  'GitHub',

  // Languages, formats and APIs
  'SAQL',
  'SOQL',
  'Apex',
  'REST API',
  'Analytics REST API',
  'JSON',
  'CSV',
  'XMD',
  'YAML',
  'SQL',
  'URL',
  'API',
  'KPI',
  'ETL',

  // API identifiers that are never ordinary words. Object names that *are*
  // ordinary words (Opportunity, Account, User, Case…) are intentionally absent
  // — see the note above.
  'Product2',
  'OpportunityLineItem'
]

/**
 * YAML/frontmatter keys whose values are prose and should be translated.
 * Every other key (icon names, URLs, component props, booleans) is left alone.
 * Applied recursively, so it covers nested MDC block data such as the
 * `items[].title` / `items[].description` used by `::lesson-cards`.
 */
export const TRANSLATABLE_KEYS = [
  'title',
  'description',
  'label',
  'text',
  'step',
  'detail',
  'note',
  'q',
  'a',
  'summary',
  'caption',
  'alt'
]

/**
 * LibreTranslate endpoint. Deliberately NOT hardcoded: this repository is
 * public and the server runs without an API key, so committing its URL would
 * publish an open translation API on a 2-vCPU box.
 *
 *   local: put LIBRETRANSLATE_URL in .env (gitignored; see .env.example)
 *   CI:    repository variable LIBRETRANSLATE_URL
 *          (Settings → Secrets and variables → Actions → Variables)
 *
 * Set LIBRETRANSLATE_API_KEY too if the server ever requires one.
 */
export const DEFAULT_ENDPOINT = ''

/**
 * Server-side limits, read from GET /frontend/settings on this instance.
 * `charLimit` is enforced per request across the whole `q` payload, so batches
 * are packed to stay comfortably under it.
 */
export const CHAR_LIMIT = 4000
export const BATCH_SIZE = 20

/**
 * In-flight requests. The server is a 2-vCPU VPS running CPU-bound Argos
 * models, so this is sized to its cores, not to what the network could carry.
 * At 4 (and especially with a second process also translating) it degraded over
 * a couple of hours and then stopped responding on both 443 and 22 — it had to
 * be rebooted by hand. Never run two translation processes against it at once.
 */
export const CONCURRENCY = 2
