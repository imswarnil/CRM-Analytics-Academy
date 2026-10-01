/** Every lead as CSV, for a spreadsheet or a one-off CRM import. */
const COLUMNS = ['id', 'created_at', 'type', 'status', 'owner', 'name', 'email', 'company', 'company_name', 'company_domain',
  'role', 'phone', 'country', 'seats', 'budget', 'message', 'details', 'source_page', 'utm', 'n8n_status', 'salesforce_id', 'notes'] as const

function cell(v: unknown) {
  if (v == null) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  // Spreadsheet formula injection: a cell starting with = + - @ is data, not a formula.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const sql = useDb()
  const rows = await sql`
    select id, created_at, type, status, owner, name, email, company, company_name, company_domain, role, phone,
           country, seats, budget, message, details, source_page, utm, n8n_status, salesforce_id, notes
    from app.lead order by created_at desc limit 10000
  `
  const csv = [COLUMNS.join(','), ...rows.map(r => COLUMNS.map(c => cell(r[c])).join(','))].join('\n')
  setResponseHeader(event, 'content-type', 'text/csv; charset=utf-8')
  setResponseHeader(event, 'content-disposition', `attachment; filename="academy-leads-${new Date().toISOString().slice(0, 10)}.csv"`)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return csv
})
