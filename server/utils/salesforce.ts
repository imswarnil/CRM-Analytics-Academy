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
export const LEAD_FIELDS: Partial<Record<'interest' | 'lessons' | 'points' | 'source' | 'landing' | 'firstLanding' | 'viewsBefore' | 'locale' | 'userId' | 'seats' | 'orgKind' | 'event' | 'lifecycle' | 'motion', string>> = {
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
 *   signup  → a self-serve lead          redeem → a self-serve customer
 *   request → a sales-led lead (seats, set-up, consulting, mentoring)
 */
export type AcademyEvent = 'signup' | 'redeem' | 'request'

export interface LeadForSalesforce {
  event: AcademyEvent
  product?: string | null
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
}

/** Sends one lead. Resolves to 'sent' or 'failed:<reason>' — never throws. */
export async function sendLeadToSalesforce(lead: LeadForSalesforce): Promise<string> {
  const description = [
    lead.event === 'signup' ? 'Signed up on the site (self-serve).' : lead.event === 'redeem' ? 'Bought Pro with points (self-serve).' : `Interest: ${lead.product}`,
    lead.message ? `Message: ${lead.message}` : '',
    `Academy: ${lead.lessonsDone} lessons done, ${lead.points} points${lead.userId ? `, user ${lead.userId}` : ', no account'}`,
    lead.seats ? `Seats: ${lead.seats}${lead.orgKind ? ` (${lead.orgKind})` : ''}` : '',
    lead.source ? `Source: ${lead.source}` : '',
    lead.firstLanding ? `First page: ${lead.firstLanding}` : '',
    lead.landing ? `Asked from: ${lead.landing}` : '',
    lead.viewsBefore ? `Pages read before asking: ${lead.viewsBefore}` : ''
  ].filter(Boolean).join('\n')

  const form = new URLSearchParams({
    oid: SF_ORG_ID,
    retURL: 'https://crmanalytics.imswarnil.com/',
    first_name: lead.firstName ?? '',
    last_name: lead.lastName,
    email: lead.email,
    // Company is required on a Lead; individuals are filed under their name.
    company: lead.company || `${[lead.firstName, lead.lastName].filter(Boolean).join(' ')} (${lead.event === 'request' ? 'individual' : 'self-serve'})`,
    title: lead.title ?? '',
    country: lead.country ?? '',
    phone: lead.phone ?? '',
    lead_source: 'Web',
    description: description.slice(0, 32000)
  })
  const custom: [keyof typeof LEAD_FIELDS, string | number | null | undefined][] = [
    ['event', lead.event], ['motion', lead.event === 'request' ? 'sales-led' : 'self-serve'],
    ['lifecycle', lead.event === 'redeem' ? 'customer' : lead.event === 'request' ? 'sql' : 'lead'],
    ['interest', lead.product], ['lessons', lead.lessonsDone], ['points', lead.points], ['source', lead.source],
    ['landing', lead.landing], ['firstLanding', lead.firstLanding], ['viewsBefore', lead.viewsBefore], ['locale', lead.locale],
    ['userId', lead.userId], ['seats', lead.seats], ['orgKind', lead.orgKind]
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

/**
 * A self-serve event (signup, redeem) for a signed-in user, with what the
 * Academy knows about them. Never throws: Salesforce being down must not
 * break a sign-up or a purchase.
 */
export async function sendAcademyEvent(event: 'signup' | 'redeem', user: { id: string, email: string, name?: string | null }): Promise<string> {
  try {
    const sql = useDb()
    const [[stats], [attr]] = await Promise.all([
      sql`select lessons_done, points from app.user_points where user_id = ${user.id}`,
      sql`select first_source, first_landing, views_before from app.user_attribution where user_id = ${user.id}`
    ])
    const [first, ...rest] = String(user.name || user.email.split('@')[0]).trim().split(/\s+/)
    return await sendLeadToSalesforce({
      event,
      product: event === 'redeem' ? 'pro' : null,
      firstName: rest.length ? first : null,
      lastName: rest.length ? rest.join(' ') : first || 'Learner',
      email: user.email,
      lessonsDone: Number(stats?.lessons_done ?? 0),
      points: Number(stats?.points ?? 0),
      source: (attr?.first_source as string | null) ?? null,
      firstLanding: (attr?.first_landing as string | null) ?? null,
      viewsBefore: attr?.views_before === undefined || attr?.views_before === null ? null : Number(attr.views_before),
      userId: user.id
    })
  } catch (e) {
    return `failed:${String((e as Error).message).slice(0, 80)}`
  }
}
