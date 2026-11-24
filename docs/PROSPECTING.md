# Prospecting — setup

/admin → **Prospecting** finds companies and people, finds and verifies their
emails, keeps lists, and runs short email sequences **from your own mailbox**
(Hostinger SMTP, or n8n), with replies and bounces reported back by n8n.
Everything is admin-only and English-only. Nothing is sent until you preview a
sequence, mark it reviewed and press **Start**; after that the hourly
`prospect:send` task sends due steps under your daily cap.

## 1. Apply the tables (once)

```bash
psql "$DATABASE_URL" -f server/db/migrate-2026-11-23-prospecting.sql
psql "$DATABASE_URL" -f server/db/migrate-2026-11-24-prospecting-smtp.sql   # off Gmail: SMTP + n8n
```

## 2. Data providers (each switches on with its key)

| Key | Where to get it | What it turns on |
| --- | --- | --- |
| `APOLLO_API_KEY` | apollo.io → Settings → Integrations → API → *Create new key*. Search endpoints need a **master** key on a paid plan | Company search (keywords, industry, size, country, **uses Salesforce**), people search by title and seniority, daily usage |
| `HUNTER_API_KEY` | hunter.io → *API* → your key (the free plan is 25 searches + 50 verifications a month) | Domain search (people at a domain), **email finder**, **email verifier**, monthly credits |
| `PDL_API_KEY`, `SNOV_CLIENT_ID`, `PROSPEO_API_KEY` | — | Adapter slots in `server/utils/prospect-providers.ts`, not implemented yet |

Put each key on the Worker with `pnpm keys` (or `wrangler secret put NAME`), and in
`.env` for local work. Without keys the tools say "connect a provider"; you can still
add companies by hand and import a CSV.

Every lookup is cached in `app.prospect_cache` for 30 days, so running the same search
or verifying the same address again costs nothing. Calls are counted in
`app.provider_call` and kept under each provider's per-minute limit; a 429 is retried
with backoff. The **Credits** button shows what each provider reports as left.

## 3. The outreach mailbox (Hostinger)

Outreach leaves from **your own mailbox**, never from Resend. Resend sends the site's
own emails, its policy forbids cold email, and complaints would hurt the domain
learners get their emails from.

**Use a separate address, ideally on a separate subdomain or domain**, e.g.
`swarnil@outreach.imswarnil.com` or a sister domain. Cold email gets some spam
complaints however careful you are. Keeping outreach off `imswarnil.com` and
`crmanalytics.imswarnil.com` protects your personal mail and the course's
transactional mail. Create the mailbox in hPanel → **Emails**.

| | Host | Port | Security |
| --- | --- | --- | --- |
| SMTP (sending, the Worker or n8n) | `smtp.hostinger.com` | **465** | SSL/TLS (implicit). 587 + STARTTLS also works |
| IMAP (n8n reads replies and bounces) | `imap.hostinger.com` | **993** | SSL/TLS |

Username = the full email address; password = the mailbox password.

### DNS for the sending domain (hPanel → Emails → the domain → DNS / Email authentication)

- **SPF**: one TXT record on the sending (sub)domain, `v=spf1 include:_spf.mail.hostinger.com ~all`.
  Merge it with any SPF record you already have there; there must be only one.
- **DKIM**: turn it on in hPanel. It publishes `hostingermail-*._domainkey` CNAME
  records; if your DNS is not at Hostinger, copy them exactly.
- **DMARC**: TXT at `_dmarc.<sending domain>`. Start with
  `v=DMARC1; p=none; rua=mailto:<you>@<domain>`, then move to `p=quarantine` once the
  reports show SPF and DKIM passing.
- Then use **Send test email to myself** (below) and open "Show original" in your
  inbox: SPF, DKIM and DMARC must all say **PASS** before the first real send.

### Worker secrets — set them yourself; never paste the password anywhere else

```bash
npx wrangler secret put SMTP_USER          # swarnil@outreach.example.com
npx wrangler secret put SMTP_PASS          # typed at the prompt, never written to a file or a chat
npx wrangler secret put OUTREACH_FROM      # Swarnil Singhai <swarnil@outreach.example.com>
npx wrangler secret put N8N_WEBHOOK_SECRET # python3 -c "import secrets;print(secrets.token_hex(32))"
# optional: SMTP_HOST (default smtp.hostinger.com), SMTP_PORT (default 465)
```

`pnpm keys` can do the same: it sends `SMTP_PASS` to the Worker only and never writes
it to `.env`.

The Worker opens the SMTP connection itself (Cloudflare TCP sockets,
`server/utils/smtp.ts`). It does `EHLO`, `AUTH`, `MAIL`, `RCPT`, `DATA` and `QUIT`, one
message per connection. Every email has:

- our own `Message-ID`;
- for follow-ups, `In-Reply-To` + `References`, so it threads in the prospect's inbox;
- `List-Unsubscribe` + `List-Unsubscribe-Post` (one-click);
- a plain-text part and a simple HTML part;
- your footer and the unsubscribe link in the body.

/admin → **Integrations → Outreach mailbox**:

- **Check SMTP** connects, says EHLO and logs in, then quits. It sends nothing.
- **Send test email to myself** sends one email to your admin address through the
  configured transport.

Sockets exist only on the Worker, so these work on the deployed site (or `pnpm preview`),
not under `pnpm dev`.

## 4. n8n: replies and bounces (required), and sending (optional)

Workers cannot hold an IMAP connection, so n8n watches the mailbox and tells the site.

1. In n8n → **Credentials**, add an **IMAP** credential for imap.hostinger.com:993
   (SSL on). Add an **SMTP** credential for smtp.hostinger.com:465 (SSL on) only if you
   will use n8n for sending. These credentials live in n8n, never in this repository.
2. Give n8n the shared secret, either way:
   - set `CRMA_WEBHOOK_SECRET=<the same value as N8N_WEBHOOK_SECRET>` and
     `CRMA_OUTREACH_ADDRESS=<the outreach address>` in n8n's environment. If your n8n
     blocks `$env` in nodes (`N8N_BLOCK_ENV_ACCESS_IN_NODE`), allow it;
   - or paste the secret into the **Sign** / **Recompute signature** Crypto nodes.
3. **Workflows → Import from file** → `docs/n8n/prospect-inbound.json`. Pick the IMAP
   credential on the first node and activate the workflow. It polls for UNSEEN mail,
   then:
   - classifies each message:
     - **bounce**: mailer-daemon/postmaster senders or DSN subjects. It reads the
       failed address from `Final-Recipient` and the original Message-ID from the body;
     - **auto_reply**: `Auto-Submitted`, X-Autoreply, or out-of-office subjects;
     - **unsubscribe**: a reply that starts with "unsubscribe", "stop", "remove me" or
       "not interested";
     - **reply**: everything else;
   - builds `{ ts, payload }`;
   - signs `ts.payload` with HMAC-SHA256;
   - POSTs it to `https://crmanalytics.imswarnil.com/api/prospect/inbound` with
     `x-signature: sha256=<hex>`.

   The site refuses a request with a bad signature, a timestamp more than 5 minutes off,
   or a replay. It matches the event to the prospect by Message-ID
   (In-Reply-To/References), then by address:
   - a **reply** stops that prospect's sequences;
   - a **bounce** stops them, marks the address invalid and suppresses it;
   - an **unsubscribe** suppresses the address;
   - an **auto-reply** is only noted on the timeline.

   Integrations shows the last event received.
4. *Optional*: **n8n as the sender.** Import `docs/n8n/prospect-send.json`, pick the
   SMTP credential and activate it. Copy the webhook node's **Production URL** to
   `npx wrangler secret put N8N_SEND_WEBHOOK_URL` and set `OUTREACH_TRANSPORT=n8n`.
   The site POSTs each rendered email signed the same way; the workflow checks the
   signature and freshness, then sends with the Send Email node.
   - ⚠️ n8n's Send Email node cannot set custom headers. In this mode emails carry no
     `Message-ID`/`In-Reply-To`/`List-Unsubscribe` from us.
   - Replies are then matched by the sender's address, and the unsubscribe link is
     still in the body.
   - The default `smtp` transport has none of these limits.

## 5. Before the first send

- **Sending & suppression**: check the daily cap (default **30** per rolling 24 h), the
  ramp-up (starts at **10** a day, then **+5** a day), the window (Mon–Fri 09–17 in the
  prospect's time zone, or the default zone), your sender name and the **footer**.
  The footer is added to every email together with a one-click unsubscribe link.
- SPF, DKIM and DMARC pass on the test email (above).
- Verify addresses first. Only **valid** and **risky** (accept-all) addresses can be
  enrolled or sent to; **invalid** never, and **unknown** must be verified.

## What happens automatically

- **Hourly `prospect:send`** sends at most 15 due steps a run under the cap, inside the
  window. Follow-ups go into the same thread as *Re: the first subject*. A refused
  login or a server error stops the run; the step stays due for the next hour.
- **n8n inbound** (each poll) handles replies, bounces, unsubscribes and auto-replies
  as above.
- **Unsubscribe link**: `/api/prospect/unsubscribe` (signed per prospect; GET shows a
  button, POST is RFC 8058 one-click). The address is suppressed for good and every
  sequence stops.
- **Suppression list** contains:
  - addresses that unsubscribed or bounced, and deleted prospects;
  - your manual entries (an address, or `@domain.com` for a whole company);
  - existing Academy learners, unless you switch that off.
- **Open tracking is off.** There is no pixel; the timeline shows found → verified →
  enrolled → each send → reply / bounce / unsubscribe, plus your notes.

## GDPR

Every prospect records its **source** (the search, the CSV and where it came from) and
its **lawful basis**: legitimate interest for B2B outreach, or consent. *Delete (GDPR)*
erases the prospect and all their activity, list memberships, enrollments and
messages. Their address stays on the do-not-contact list so they are never contacted
again. Write only to people whose role makes the email relevant, keep it short, and
honour every "no".

## Hand-off to sales

*Convert to lead* creates an `app.lead` (product and source **outbound**), enriches it
and sends it to Salesforce by Web-to-Lead, where `Traffic_Source__c = outbound`. The
prospect's sequences stop.

## Checking the code without keys

`pnpm prospect:check` runs every provider adapter, the SMTP client against a fake
server, the n8n signing in both directions, the shipped n8n classifier, a full send run
and the inbound handler (reply → stop, bounce → suppress, replay refused) against mocks
and a fake database. It calls no real provider, Hostinger or n8n.
