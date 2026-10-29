/** Move a lead along: { id, status: new | contacted | won | lost }. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ id?: number, status?: string }>(event)
  const id = Number(body?.id)
  const status = String(body?.status ?? '')
  if (!Number.isInteger(id) || !/^(new|contacted|won|lost)$/.test(status)) throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  await useDb()`update app.lead set status = ${status} where id = ${id}`
  return { ok: true }
})
