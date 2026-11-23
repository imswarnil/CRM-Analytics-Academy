import type { EnrichmentSummary } from './enrich'

/**
 * Leads into Salesforce through Web-to-Lead.
 *
 * Web-to-Lead takes a form POST with the org id and no credentials: there is
 * no integration user, no OAuth token and no API login, so nothing here can
 * lock or freeze a Salesforce user, and nothing secret is involved (the org id
 * is printed in every Web-to-Lead form). Salesforce accepts up to 500 a day.
 *
 * Custom fields go by their 15-character field ids (Web-to-Lead's rule), set in
 * LEAD_FIELDS once salesforce/academy deploys them — see salesforce/README.md.
 * An unknown id is simply ignored by Salesforce, so an empty map is safe.
 */
export const SF_ORG_ID = '00Dg500000KBfkHEAT'
const ENDPOINT = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8'

/**
 * Custom Lead field → its Web-to-Lead id (00N…). Filled from the deploy of
 * salesforce/academy (README "Prospecting CRM"): `node salesforce/scripts/
 * lead-field-ids.mjs` prints this map.
 */
export type LeadFieldKey = 'interest' | 'lessons' | 'points' | 'source' | 'landing' | 'firstLanding' | 'viewsBefore' | 'locale' | 'userId' | 'seats' | 'orgKind' | 'event' | 'lifecycle' | 'motion'
  // Enrichment (2026-11-23). Empty until salesforce/crm is deployed and
  // lead-field-ids.mjs prints their ids; the Description carries them meanwhile.
  | 'siteScore' | 'siteGrade' | 'scoreReasons' | 'emailDomain' | 'domainType' | 'networkOrg' | 'geoRegion' | 'timezone' | 'companyLinkedIn' | 'productSignals'
export const LEAD_FIELDS: Partial<Record<LeadFieldKey, string>> = {
  event: '00Ng500000VROkT',
  lifecycle: '00Ng500000VROkU',
  motion: '00Ng500000VROkV',
  interest: '00Ng500000VRIjv',
  lessons: '00Ng500000VRIjw',
  locale: '00Ng500000VRIjx',
  points: '00Ng500000VRIjy',
  userId: '00Ng500000VRIjz',
  firstLanding: '00Ng500000VRIk0',
  landing: '00Ng500000VRIk1',
  orgKind: '00Ng500000VRIk2',
  seats: '00Ng500000VRIk3',
  source: '00Ng500000VRIk4',
  viewsBefore: '00Ng500000VRIk5'
}

/**
 * What happened on the site. Salesforce's AcademyLeadEvents job folds each
 * event into the person's one record (salesforce/CRM-PROCESS.md):
 *   signup    → a self-serve lead
 *   subscribe → a self-serve customer: Pro bought with Stripe (MRR)
 *   team      → a customer account: team seats bought with Stripe (MRR)
 *   sponsor   → a paid sponsorship (one-time)
 *   request   → a sales-led lead (seats, sponsorship, set-up, consulting…)
 *   pack / redeem → retired point purchases, still understood
 */
export type AcademyEvent = 'signup' | 'subscribe' | 'team' | 'sponsor' | 'pack' | 'redeem' | 'request'

export interface LeadForSalesforce {
  event: AcademyEvent
  product?: string | null
  /** A purchase: the plan (PRICES key), what it is worth in USD, and seats. */
  purchase?: { plan: string, usd: number, seats: number } | null
  firstName?: string | null
  lastName: string
  email: string
  company?: string | null
  title?: string | null
  country?: string | null
  phone?: string | null
  seats?: number | null
  orgKind?: string | null
  message?: string | null
  lessonsDone: number
  points: number
  source?: string | null
  landing?: string | null
  firstLanding?: string | null
  viewsBefore?: number | null
  locale?: string | null
  userId?: string | null
  /** First-party enrichment and score (server/utils/enrich.ts), when it finished. */
  enrichment?: EnrichmentSummary | null
}

/** Sends one lead. Resolves to 'sent' or 'failed:<reason>' — never throws. */
export async function sendLeadToSalesforce(lead: LeadForSalesforce): Promise<string> {
  const description = [
    lead.event === 'signup'
      ? 'Signed up on the site (self-serve).'
      : lead.purchase
        ? `Purchase: ${lead.purchase.plan} · ${lead.purchase.usd} USD · ${lead.purchase.seats} seat(s) (${lead.event}).`
        : `Interest: ${lead.product}`,
    lead.message ? `Message: ${lead.message}` : '',
    `Academy: ${lead.lessonsDone} lessons done, ${lead.points} points${lead.userId ? `, user ${lead.userId}` : ', no account'}`,
    lead.seats ? `Seats: ${lead.seats}${lead.orgKind ? ` (${lead.orgKind})` : ''}` : '',
    lead.source ? `Source: ${lead.source}` : '',
    lead.firstLanding ? `First page: ${lead.firstLanding}` : '',
    lead.landing ? `Asked from: ${lead.landing}` : '',
    lead.viewsBefore ? `Pages read before asking: ${lead.viewsBefore}` : '',
    ...enrichmentLines(lead.enrichment)
  ].filter(Boolean).join('\n')
  const en = lead.enrichment

  const form = new URLSearchParams({
    oid: SF_ORG_ID,
    retURL: 'https://crmanalytics.imswarnil.com/',
    first_name: lead.firstName ?? '',
    last_name: lead.lastName,
    email: lead.email,
    // Company is required on a Lead; individuals are filed under their name.
    company: lead.company || (en?.domainKind === 'business' && en.company ? en.company : '') || `${[lead.firstName, lead.lastName].filter(Boolean).join(' ')} (${lead.event === 'request' ? 'individual' : 'self-serve'})`,
    title: lead.title ?? '',
    country: lead.country ?? en?.country ?? '',
    city: en?.city ?? '',
    URL: en?.website ?? '',
    phone: lead.phone ?? '',
    lead_source: 'Web',
    description: description.slice(0, 32000)
  })
  const custom: [keyof typeof LEAD_FIELDS, string | number | null | undefined][] = [
    ['event', lead.event], ['motion', ['request', 'team', 'sponsor'].includes(lead.event) ? 'sales-led' : 'self-serve'],
    ['lifecycle', ['subscribe', 'team', 'sponsor', 'redeem', 'pack'].includes(lead.event) ? 'customer' : lead.event === 'request' ? 'sql' : 'lead'],
    ['interest', lead.product], ['lessons', lead.lessonsDone], ['points', lead.points], ['source', lead.source],
    ['landing', lead.landing], ['firstLanding', lead.firstLanding], ['viewsBefore', lead.viewsBefore], ['locale', lead.locale],
    ['userId', lead.userId], ['seats', lead.seats], ['orgKind', lead.orgKind === 'college' ? 'university' : lead.orgKind],
    ['siteScore', en?.score], ['siteGrade', en?.grade], ['scoreReasons', en ? reasonsLine(en.reasons) : null],
    ['emailDomain', en?.emailDomain], ['domainType', en?.domainKind], ['networkOrg', en?.networkOrg],
    ['geoRegion', en?.region], ['timezone', en?.timezone], ['companyLinkedIn', en?.linkedin],
    ['productSignals', en ? signalsLine(en.signals) : null]
  ]
  for (const [k, v] of custom) {
    const id = LEAD_FIELDS[k]
    if (id && v !== null && v !== undefined && v !== '') form.set(id, String(v))
  }

  try {
    const res = await fetch(ENDPOINT, { method: 'POST', body: form, redirect: 'manual' })
    return res.status < 400 ? 'sent' : `failed:${res.status}`
  } catch (e) {
    return `failed:${String((e as Error).message).slice(0, 80)}`
  }
}

/** The enrichment as readable Description lines (always delivered, field ids or not). */
export function enrichmentLines(en: EnrichmentSummary | null | undefined): string[] {
  if (!en) return []
  return [
    `Score: ${en.score} (${en.grade}) — ${reasonsLine(en.reasons, 1000) || 'no signals yet'}`,
    en.emailDomain ? `Email domain: ${en.emailDomain} (${en.domainKind})` : '',
    en.company && en.domainKind === 'business' ? `Company: ${en.company}${en.website ? ` · ${en.website}` : ''}${en.linkedin ? ` · ${en.linkedin}` : ''}` : '',
    [en.city, en.region, en.country].some(Boolean) ? `Location: ${[en.city, en.region, en.country].filter(Boolean).join(', ')}${en.timezone ? ` (${en.timezone})` : ''}` : '',
    en.networkOrg ? `Network: ${en.networkOrg} (${en.networkKind})` : '',
    `Product: ${signalsLine(en.signals)}`
  ].filter(Boolean)
}

/**
 * A self-serve event (signup, subscribe…) for a signed-in user, with what the
 * Academy knows about them — enriched first (enrich.ts) unless the caller
 * already did. Never throws: Salesforce being down must not break a sign-up
 * or a purchase.
 */
export async function sendAcademyEvent(event: 'signup' | 'subscribe' | 'team' | 'sponsor', user: { id: string, email: string, name?: string | null }, purchase?: { plan: string, usd: number, seats: number }, source?: string | null, enrichment?: EnrichmentSummary | null): Promise<string> {
  try {
    const en = enrichment ?? await enrichUser(user.id, { event, source })
    const sql = useDb()
    const [stats] = await sql`select lessons_done, points from app.user_points where user_id = ${user.id}`
    const [first, ...rest] = String(user.name || user.email.split('@')[0]).trim().split(/\s+/)
    return await sendLeadToSalesforce({
      event,
      product: event === 'sponsor' ? 'sponsorship' : event === 'team' ? 'seats' : event === 'subscribe' ? 'pro' : null,
      purchase: purchase ?? null,
      firstName: rest.length ? first : null,
      lastName: rest.length ? rest.join(' ') : first || 'Learner',
      email: user.email,
      lessonsDone: Number(stats?.lessons_done ?? 0),
      points: Number(stats?.points ?? 0),
      source: source ?? null,
      firstLanding: null,
      viewsBefore: null,
      userId: user.id,
      enrichment: en
    })
  } catch (e) {
    return `failed:${String((e as Error).message).slice(0, 80)}`
  }
}
