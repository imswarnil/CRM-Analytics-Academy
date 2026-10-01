/** Send (or resend) a lead to n8n → Salesforce. */
export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Bad id.' })
  const lead = await loadLead(id)
  if (!lead) throw createError({ statusCode: 404, statusMessage: 'Lead not found.' })
  return forwardLead(lead)
})
