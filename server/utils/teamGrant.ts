export interface TeamGrant {
  name?: string
  domain?: string
  extraDomains?: string[]
  seats?: number
  validUntil?: string
  status?: 'active' | 'inactive'
  contactEmail?: string
  autoJoin?: boolean
  note?: string
}

const DOMAIN = /^(?=.{3,253}$)([a-z0-9-]+\.)+[a-z]{2,}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates an admin's team grant form. `create` requires the fields a new
 * grant cannot do without; an edit takes any subset.
 */
export function parseGrant(body: Record<string, unknown> | undefined, create: boolean): TeamGrant {
  const bad = (msg: string) => createError({ statusCode: 400, statusMessage: msg })
  const b = body ?? {}
  const g: TeamGrant = {}

  if (b.name != null) {
    g.name = String(b.name).trim().slice(0, 120)
    if (!g.name) throw bad('Name the company.')
  }
  if (b.domain != null) {
    g.domain = String(b.domain).trim().toLowerCase().replace(/^@/, '')
    if (!DOMAIN.test(g.domain)) throw bad('Enter the company domain, like acme.com.')
  }
  if (b.extraDomains != null) {
    const list = Array.isArray(b.extraDomains) ? b.extraDomains : String(b.extraDomains).split(/[\s,]+/)
    g.extraDomains = list.map(d => String(d).trim().toLowerCase().replace(/^@/, '')).filter(Boolean)
    if (g.extraDomains.some(d => !DOMAIN.test(d))) throw bad('One of the extra domains is not a domain.')
  }
  if (b.seats != null) {
    g.seats = Number(b.seats)
    if (!Number.isInteger(g.seats) || g.seats < 1 || g.seats > 500) throw bad('Seats are 1 to 500.')
  }
  if (b.validUntil != null) {
    const d = new Date(String(b.validUntil))
    if (Number.isNaN(d.getTime())) throw bad('Pick the date Pro ends.')
    // Pro lasts to the end of the chosen day.
    d.setUTCHours(23, 59, 59, 0)
    g.validUntil = d.toISOString()
  }
  if (b.status != null) {
    if (b.status !== 'active' && b.status !== 'inactive') throw bad('Status is active or inactive.')
    g.status = b.status
  }
  if (b.contactEmail != null && String(b.contactEmail).trim()) {
    g.contactEmail = String(b.contactEmail).trim().toLowerCase()
    if (!EMAIL.test(g.contactEmail)) throw bad('The contact email is not an email address.')
  }
  if (b.autoJoin != null) g.autoJoin = Boolean(b.autoJoin)
  if (b.note != null) g.note = String(b.note).slice(0, 2000)

  if (create) {
    if (!g.name || !g.domain || !g.seats || !g.validUntil) throw bad('Company, domain, seats and an end date are required.')
    if (new Date(g.validUntil) <= new Date()) throw bad('The end date must be in the future.')
  }
  return g
}
