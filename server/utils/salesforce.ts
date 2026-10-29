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

/** Custom Lead field → its Web-to-Lead id (00N…). Filled after the deploy. */
export const LEAD_FIELDS: Partial<Record<'product' | 'lessons' | 'points' | 'source' | 'landing' | 'locale' | 'userId' | 'teamSize', string>> = {}

export interface LeadForSalesforce {
  product: string
  productName: string
  firstName?: string | null
  lastName: string
  email: string
  company?: string | null
  title?: string | null
  country?: string | null
  phone?: string | null
  teamSize?: string | null
  message?: string | null
  lessonsDone: number
  points: number
  source?: string | null
  landing?: string | null
  locale?: string | null
  userId?: string | null
}

/** Sends one lead. Resolves to 'sent' or 'failed:<reason>' — never throws. */
export async function sendLeadToSalesforce(lead: LeadForSalesforce): Promise<string> {
  const description = [
    `Product: ${lead.productName} (${lead.product})`,
    lead.message ? `Message: ${lead.message}` : '',
    `Academy: ${lead.lessonsDone} lessons done, ${lead.points} points${lead.userId ? `, user ${lead.userId}` : ', no account'}`,
    lead.teamSize ? `Team size: ${lead.teamSize}` : '',
    lead.source ? `Source: ${lead.source}` : '',
    lead.landing ? `First page: ${lead.landing}` : ''
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
    ['product', lead.product], ['lessons', lead.lessonsDone], ['points', lead.points], ['source', lead.source],
    ['landing', lead.landing], ['locale', lead.locale], ['userId', lead.userId], ['teamSize', lead.teamSize]
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
