/** Forgets the Gmail connection (the sealed token is deleted; revoke it at myaccount.google.com/permissions too). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await useDb()`delete from app.mail_account`
  return { ok: true }
})
