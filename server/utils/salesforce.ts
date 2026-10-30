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
export const LEAD_FIELDS: Partial<Record<'interest' | 'lessons' | 'points' | 'source' | 'landing' | 'firstLanding' | 'viewsBefore' | 'locale' | 'userId' | 'seats' | 'orgKind', string>> = {
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

export interface LeadForSalesforce {
  product: string
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
    `Interest: ${lead.product}`,
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
    company: lead.company || `${[lead.firstName, lead.lastName].filter(Boolean).join(' ')} (individual)`,
    title: lead.title ?? '',
    country: lead.country ?? '',
    phone: lead.phone ?? '',
    lead_source: 'Web',
    description: description.slice(0, 32000)
  })
  const custom: [keyof typeof LEAD_FIELDS, string | number | null | undefined][] = [
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
