/**
 * Hands a lead to n8n, which creates it in Salesforce.
 *
 * The site never talks to Salesforce itself: credentials for the org live in
 * n8n, and this only POSTs the lead to one webhook. The body is signed —
 * `X-Academy-Signature: sha256=<hex HMAC of the exact body>` with
 * N8N_WEBHOOK_SECRET — so the workflow can refuse anything that did not come
 * from this Worker.
 *
 * Unconfigured is a normal state, not an error: the lead is stored and marked
 * `not_configured`, and "Resend to CRM" in the admin works once the two
 * secrets exist.
 */
export interface LeadRow {
  id: number
  type: string
  name: string
  email: string
  company: string | null
  company_domain: string | null
  role: string | null
  phone: string | null
  country: string | null
  seats: number | null
  budget: string | null
  message: string | null
  source_page: string | null
  utm: Record<string, string>
  details: Record<string, unknown>
  company_name: string | null
  logo_url: string | null
  site_title: string | null
  site_description: string | null
  created_at: string
}

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** The JSON the n8n workflow receives. Keep in step with integrations/n8n. */
export function leadPayload(lead: LeadRow) {
  return {
    event: 'lead.created',
    source: 'crm-analytics-academy',
    lead: {
      id: lead.id,
      type: lead.type,
      name: lead.name,
      email: lead.email,
      company: lead.company_name || lead.company,
      companyDomain: lead.company_domain,
      role: lead.role,
      phone: lead.phone,
      country: lead.country,
      seats: lead.seats,
      budget: lead.budget,
      message: lead.message,
      sourcePage: lead.source_page,
      utm: lead.utm,
      details: lead.details,
      enrichment: {
        companyName: lead.company_name,
        logoUrl: lead.logo_url,
        siteTitle: lead.site_title,
        siteDescription: lead.site_description
      },
      createdAt: lead.created_at
    }
  }
}

export async function forwardLead(lead: LeadRow): Promise<{ status: 'sent' | 'failed' | 'not_configured', error?: string }> {
  const url = process.env.N8N_WEBHOOK_URL
  const secret = process.env.N8N_WEBHOOK_SECRET
  const sql = useDb()

  if (!url || !secret) {
    await sql`update app.lead set n8n_status = 'not_configured', updated_at = now() where id = ${lead.id}`
    return { status: 'not_configured' }
  }

  const body = JSON.stringify(leadPayload(lead))
  let error: string | undefined
  let salesforceId: string | null = null
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-academy-signature': `sha256=${await hmacHex(secret, body)}`,
        'x-academy-lead-id': String(lead.id)
      },
      body,
      signal: AbortSignal.timeout(8000)
    })
    if (!res.ok) {
      error = `n8n answered HTTP ${res.status}`
    } else {
      // The workflow's "Respond to Webhook" returns { salesforceId } when the
      // Salesforce step succeeded; anything else still counts as delivered.
      const data = await res.json().catch(() => null) as { salesforceId?: string } | null
      salesforceId = typeof data?.salesforceId === 'string' ? data.salesforceId.slice(0, 40) : null
    }
  } catch (e) {
    error = (e as Error).message || 'Could not reach n8n'
  }

  if (error) {
    await sql`
      update app.lead
      set n8n_status = 'failed', n8n_attempts = n8n_attempts + 1, n8n_last_error = ${error.slice(0, 500)}, updated_at = now()
      where id = ${lead.id}
    `
    return { status: 'failed', error }
  }
  await sql`
    update app.lead
    set n8n_status = 'sent', n8n_attempts = n8n_attempts + 1, n8n_last_error = null, n8n_sent_at = now(),
        salesforce_id = coalesce(${salesforceId}, salesforce_id), updated_at = now()
    where id = ${lead.id}
  `
  return { status: 'sent' }
}
