/** Canonical site metadata, used for SEO, canonical URLs, and JSON-LD. */
export const SITE = {
  url: 'https://crmanalytics.imswarnil.com',
  name: 'CRM Analytics Academy',
  description: 'A free, open-source curriculum for mastering Salesforce CRM Analytics — data prep, SAQL, dashboards, and Einstein Discovery.',
  author: 'Swarnil Singhai',
  github: 'https://github.com/imswarnil/CRM-Analytics-Academy'
}

/**
 * The visitor's language decision — written by the first-visit auto-pick
 * (plugins/locale-auto.client.ts) and by the header switcher, and by nothing
 * else. The i18n module's own cookie can't serve: it rewrites it on hydration.
 */
export const LOCALE_CHOICE_COOKIE = 'crma_locale'
