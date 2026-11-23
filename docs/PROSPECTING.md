# Prospecting — setup

/admin → **Prospecting** finds companies and people, finds and verifies their
emails, keeps lists, and runs short email sequences **from your own Gmail**.
Everything is admin-only and English-only. Nothing is sent until you preview a
sequence, mark it reviewed and press **Start**; after that the hourly
`prospect:send` task sends due steps under your daily cap.

## 1. Apply the tables (once)

```bash
psql "$DATABASE_URL" -f server/db/migrate-2026-11-23-prospecting.sql
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

## 3. Connect Gmail (Google Workspace)

Outreach goes out from your mailbox through the Gmail API. **It never goes through
Resend**: Resend sends the site's own emails, its policy forbids cold email, and
complaints would hurt the domain learners get their emails from.

1. **Google Cloud project.** console.cloud.google.com → create a project (e.g.
   *Academy Outreach*) → *APIs & Services → Library* → enable **Gmail API**.
2. **OAuth consent screen** (*Google Auth Platform → Branding / Audience*):
   - If your mailbox is a Workspace account, choose **Internal**. Only your
     organisation can use it, and Google does not review it.
   - For a personal @gmail.com address, choose **External**, leave it in **Testing**
     and add your address under **Test users**. Testing-mode refresh tokens expire
     after 7 days, so the admin shows *revoked* and you reconnect. To avoid that,
     publish the app; because the Gmail scopes are restricted, publishing means
     Google's verification.
   - Data access → add the scopes
     `https://www.googleapis.com/auth/gmail.send` and
     `https://www.googleapis.com/auth/gmail.readonly`. Nothing else.
3. **Credentials → Create credentials → OAuth client ID → Web application.**
   Authorised redirect URIs:
   - `https://crmanalytics.imswarnil.com/api/admin/prospecting/gmail/callback`
   - `http://localhost:3000/api/admin/prospecting/gmail/callback` (local)
4. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   (`pnpm keys`), deploy, then open /admin → **Integrations → Connect Gmail**. Tick
   both permissions on Google's screen.

The refresh token is sealed with AES-GCM under the site secret (`CAPTCHA_SECRET`, or
the key derived from `DATABASE_URL`) before it is stored in `app.mail_account`.
Changing that secret means connecting Gmail again. To disconnect, use
*Disconnect* in Integrations and remove the app at myaccount.google.com/permissions.

## 4. Before the first send

- **Sending & suppression**: check the daily cap (default **30** per rolling 24 h), the
  ramp-up (starts at **10** a day, then **+5** a day), the window (Mon–Fri 09–17 in the
  prospect's time zone, or the default zone), your sender name and the **footer**.
  The footer is added to every email together with a one-click unsubscribe link.
- Turn on Gmail's own protections: SPF, DKIM and DMARC on your Workspace domain.
- Verify addresses first. Only **valid** and **risky** (accept-all) addresses can be
  enrolled or sent to; **invalid** never, and **unknown** must be verified.

## What happens automatically

- **Hourly `prospect:send`** checks up to 25 active threads, then sends at most 15 due
  steps a run under the cap.
  - A **reply** stops all of that prospect's sequences. An out-of-office auto-reply
    does not count as a reply.
  - A **bounce** stops them too, marks the address invalid and suppresses it.
  - Follow-ups go into the same thread as *Re: the first subject*.
- **Unsubscribe**: `/api/prospect/unsubscribe` (signed per prospect; GET shows a
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

`pnpm prospect:check` runs every provider adapter, the Gmail client and a full send
run against mocked APIs and a fake database. It calls no real provider and no Google
API.
