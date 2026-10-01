# Leads → n8n → Salesforce

Every form on the site that is a business conversation — contact, talk to
sales, quotes, team sign-ups, classroom seats, implementation, sponsorship,
instructor applications — is stored in Neon (`app.lead`) and then posted to an
n8n webhook. n8n holds the Salesforce credentials and creates the Lead. The
site never talks to Salesforce directly.

```
form ─► POST /api/leads ─► app.lead (Neon) ─► enrich from company website
                                          └─► POST N8N_WEBHOOK_URL (signed)
                                                 └─► n8n: verify ─► Salesforce Lead (+ Task for sales/quote)
                                                        └─► responds { salesforceId } ─► stored on the lead
```

Wall of Fame nominations reach n8n too, but the workflow answers them without
touching Salesforce — they are not sales leads.

## 1. Import the workflow

1. In n8n: **Workflows → Import from file →** `salesforce-leads.workflow.json`.
2. Open **Create Lead** and **Create follow-up Task** and pick your Salesforce
   credential (OAuth2; create it under *Credentials* first). Both nodes ship
   with a placeholder credential id.
3. The webhook path is `crm-academy-leads`. Copy the **Production URL** from
   the *Academy webhook* node, e.g. `https://n8n.example.com/webhook/crm-academy-leads`.

## 2. The shared secret

The site signs every request: `X-Academy-Signature: sha256=<hex HMAC-SHA256 of
the raw body>`. The *Verify signature & map* node rejects anything else with a
401.

Generate one secret and put it in both places:

```bash
openssl rand -hex 32
```

- **n8n:** set the environment variable `ACADEMY_WEBHOOK_SECRET` on the n8n
  instance, plus `NODE_FUNCTION_ALLOW_BUILTIN=crypto` (the Code node uses
  `crypto`) and `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (so the node can read
  `$env`). On n8n Cloud, paste the secret into the `SECRET` constant in the
  Code node instead.
- **The site (Cloudflare Worker secrets):**

```bash
pnpm exec wrangler secret put N8N_WEBHOOK_URL      # the Production URL from step 1
pnpm exec wrangler secret put N8N_WEBHOOK_SECRET   # the same hex secret
```

For local development put the same two lines in `.dev.vars`.

Until both secrets exist, leads are still stored and shown in the admin with
the status **not configured**; nothing is lost.

## 3. Field mapping

| Salesforce Lead | From the site |
| --- | --- |
| FirstName / LastName | `name`, split on the last space |
| Email | `email` |
| Company | enriched company name, else the typed company, else the domain |
| Title | `role` |
| Phone, Country | `phone`, `country` |
| NumberOfEmployees | `seats` (team size) |
| LeadSource | `CRM Analytics Academy` |
| Description | type, lead id, message, type-specific details, budget, page, UTM, company description |

Sales and quote requests also get a high-priority **Task** on the new Lead.

## 4. Test it

1. Activate the workflow.
2. Submit the form at `/contact` (any email) or `/sales` (a work email).
3. In the admin console → **Leads**: the row should show **sent** and a
   Salesforce id within a few seconds. **Resend to CRM** retries a failed row.

If a row shows **failed**, the admin shows n8n's HTTP status or the network
error; the n8n execution log has the rest.
