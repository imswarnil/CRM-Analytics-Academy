/**
 * The original enquiry endpoint, kept for any client still posting to it.
 * Its three kinds map onto lead types and it goes through the same service as
 * /api/leads, so the rules and the CRM hand-off are identical.
 */
const KIND_TO_TYPE: Record<string, string> = {
  enrollment: 'training',
  quotation: 'quote',
  implementation: 'implementation'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event) ?? {}
  const type = KIND_TO_TYPE[String(body.kind ?? '')]
  if (!type) throw createError({ statusCode: 400, statusMessage: 'Unknown enquiry type.' })
  setResponseHeader(event, 'cache-control', 'no-store')
  return submitLead(event, { ...body, type })
})
