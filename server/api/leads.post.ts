/**
 * Every public business form posts here: contact, sales, quotes, sponsorship,
 * team sign-up, classroom seats, implementation, instructor applications and
 * Wall of Fame nominations. Validation, the work-email rule, rate limiting,
 * enrichment and the CRM hand-off all live in server/utils/leads.ts.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  setResponseHeader(event, 'cache-control', 'no-store')
  return submitLead(event, body ?? {})
})
