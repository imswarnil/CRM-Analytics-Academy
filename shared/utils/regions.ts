/**
 * Countries, the site language each opens in, and the region each is ranked
 * in. Shared by the first-visit language pick (app/plugins/locale-auto.client.ts),
 * the regional leaderboard and the home page's reach stats (server/api).
 * Codes are ISO 3166-1 alpha-2, as Cloudflare sends them (`cf.country`).
 */

/**
 * Country → site locale. Unlisted countries open in English. India, Pakistan,
 * the Philippines, Nigeria and similar are deliberately not mapped: the
 * Salesforce work there happens in English.
 */
export const COUNTRY_LOCALE: Record<string, string> = {
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es', GT: 'es', CU: 'es', BO: 'es',
  DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es', PR: 'es', GQ: 'es',
  // French
  FR: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TG: 'fr', BJ: 'fr', GA: 'fr', CD: 'fr', CG: 'fr', HT: 'fr',
  GN: 'fr', CM: 'fr', MG: 'fr', LU: 'fr',
  // German
  DE: 'de', AT: 'de', LI: 'de', CH: 'de',
  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
  // Japanese, Chinese
  JP: 'ja', CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar', LY: 'ar', MA: 'ar', OM: 'ar', QA: 'ar',
  SY: 'ar', TN: 'ar', YE: 'ar', BH: 'ar', DZ: 'ar', SD: 'ar', PS: 'ar', MR: 'ar',
  // Russian, Bengali
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru', TJ: 'ru', UZ: 'ru', BD: 'bn'
}

export const REGIONS = {
  'north-america': 'North America',
  'latin-america': 'Latin America',
  'europe': 'Europe',
  'middle-east-africa': 'Middle East & Africa',
  'south-asia': 'South Asia',
  'east-asia': 'East Asia',
  'southeast-asia': 'Southeast Asia',
  'oceania': 'Oceania',
  'central-asia': 'Russia & Central Asia'
} as const

export type RegionKey = keyof typeof REGIONS

const R: Record<RegionKey, string> = {
  'north-america': 'US CA',
  'latin-america': 'MX GT BZ SV HN NI CR PA CU DO HT JM TT BB BS PR AR BO BR CL CO EC GY PY PE SR UY VE',
  'europe': 'GB IE FR DE AT CH LI LU BE NL DK NO SE FI IS EE LV LT PL CZ SK HU SI HR BA RS ME MK AL GR BG RO MD UA IT MT SM VA ES PT AD MC CY',
  'middle-east-africa': 'TR IL PS LB SY JO IQ IR SA AE QA BH KW OM YE EG LY TN DZ MA MR SD SS ET ER DJ SO KE UG TZ RW BI CD CG CM GA GQ NG GH CI BF ML NE SN GM GN GW SL LR TG BJ TD CF ZA NA BW ZW ZM MW MZ AO MG MU SC LS SZ CV',
  'south-asia': 'IN PK BD LK NP BT MV AF',
  'east-asia': 'CN JP KR KP TW HK MO MN',
  'southeast-asia': 'SG MY ID TH VN PH MM KH LA BN TL',
  'oceania': 'AU NZ PG FJ SB VU WS TO',
  'central-asia': 'RU BY KZ KG TJ UZ TM AZ AM GE'
}

/** Country → region key, or null for anything unlisted. */
export const COUNTRY_REGION: Record<string, RegionKey> = Object.fromEntries(
  (Object.entries(R) as [RegionKey, string][]).flatMap(([region, codes]) => codes.split(' ').map(c => [c, region]))
)

export function regionOf(country: string | null | undefined): RegionKey | null {
  return country ? COUNTRY_REGION[country.toUpperCase()] ?? null : null
}
