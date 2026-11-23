# Academy CRM — how the Academy prospects and sells, in Salesforce

The learning org (`crma-learning`) doubles as the Academy's own CRM. Everything
in this file lives in `salesforce/crm/` (metadata) and `salesforce/scripts/`
(seed data, layout patch, field ids). It is **not** part of `academy/`, so
`academy-setup.mjs` never deploys it into a learner's org.

> The org was frozen once. Everything below is one deploy, one Apex run and one
> read query — no loops over the API, no scripted logins. If the CLI says the
> session expired, run `sf org login web --alias crma-learning` yourself.

## 2026-11-19 — what changed

- **Prices** follow the site (`shared/utils/products.ts`): Pro Monthly **$19**, Pro Yearly **$119** (MRR = 119 ÷ 12 = 9.92),
  Pro Lifetime **$249** once (revenue, **no MRR**), seats from **$99 per seat per year** (list; quoted). `AcademyLeadEvents`
  reads the plan the site sends (`monthly` / `yearly` / `lifetime`) and names deals *Pro — monthly / yearly / lifetime*.
  The site now sends `university` for a college (the picklist value).
- **Validation rules** (edits only, never Web-to-Lead inserts, so no lead is ever lost): a closed lead or lost deal needs a
  reason in Description; a hand-edited seat request needs 2+ seats; amounts and seats are never negative; seats used ≤ seats
  purchased; a seats customer has a seat count; an active seat has a join date.
- **Quick actions** (in the record page's action bar): Lead — *Mark contacted*, *Disqualify*; Account — *New seat deal*,
  *Add seat*; Opportunity — *Mark won*.
- **Flows**: *Academy - Lead follow-up* (a new sales-led lead → a high-priority task for its owner, due tomorrow),
  *Academy - Hot lead to MQL* (score 60+ moves Lead → MQL), *Academy - Deal won makes a customer* (won deal → account
  Customer, Customer since set once).
- **Home page**: *Academy Pulse* (LWC + `AcademyPulse` Apex, cacheable, user mode) — MRR and ARR, customers, hot leads,
  open seat pipeline, new leads this week; each tile opens its list view.
- **Data**: `scripts/apex/crm-reset.apex` empties the CRM records (back up first; re-run until "0 left"), then
  `scripts/apex/crm-seed-2026.apex` fills Academy-only data: 5 products, 4 self-serve Pro customers (monthly, yearly,
  lifetime), Northwind (25 seats) and Pune Institute of Technology (120 student seats) with members, two open seat deals,
  and leads at every lifecycle stage.

Deploy and run, in this order (one deploy, two Apex runs):

```bash
sf org login web --alias crma-learning                      # you, once — the session has expired
sf project deploy start --source-dir crm --target-org crma-learning --test-level RunSpecifiedTests \
  --tests AcademyLeadEventsTest --tests AcademyPulseTest
sf apex run --file scripts/apex/crm-reset.apex --target-org crma-learning      # only after a backup
sf apex run --file scripts/apex/crm-seed-2026.apex --target-org crma-learning
```

## 2026-11-23 — enrichment, scored leads and the account sync

Nothing below has been deployed or called: the site was built and tested against
mocked Salesforce responses only (`pnpm gtm:check`). Everything is one deploy and
a few clicks, done by you.

### What the site now does

1. **Enrichment** (`server/utils/enrich.ts`, `score.ts`) — after a sign-up, a
   "talk to us" request, a checkout or a milestone, in the Worker's `waitUntil`:
   Cloudflare's geo and network for that request (country, region, city,
   timezone, AS organisation — never the IP), the email domain (personal /
   business / education / government / disposable), for a business domain the
   company's own home page (name, description, logo, LinkedIn page; cached 30
   days), product signals from Neon (plan, lessons, streak, active days, quizzes,
   exams + best score, checkouts started, team seat) and a **site score** 0–100 =
   fit (≤ 50) + engagement (≤ 50), Hot ≥ 60 / Warm ≥ 30 / Cold, with every reason.
2. **Lead intake** (Web-to-Lead, unchanged path, still no credentials) — every
   lead now also carries `Site_Score__c`, `Site_Grade__c`, `Score_Reasons__c`,
   `Email_Domain__c`, `Domain_Type__c`, `Network_Org__c`, `Geo_Region__c`,
   `Timezone__c`, `Company_LinkedIn__c`, `Product_Signals__c`, plus standard
   `City` and `Website`, and the company name for business domains. Until the
   fields are deployed and their ids are in `LEAD_FIELDS`, the same facts arrive
   in **Description** (Web-to-Lead ignores unknown ids, so nothing breaks).
   `Lead_Score__c` now uses `Site_Score__c` when it is set (otherwise the old
   formula), so *Hot lead to MQL* and the grade follow the site's score.
3. **Account sync** (`server/utils/sf-sync.ts`, hourly + /admin → Integrations →
   *Sync now*) — upserts by external ID, only rows whose payload changed:

   | Site | Salesforce | External ID |
   | --- | --- | --- |
   | team org (`app.org`) | **Account** (Plan *seats*, seats purchased/used, join code, term end, Customer/Churned, Sales-led, Website) | `Account.Academy_Org_Id__c` = org id |
   | active self-serve learner | **Academy Learner** (new object: plan, Pro, lessons, streak, active days, last active, exams, checkouts, score/grade/reasons, enrichment, first touch, Organisation lookup) | `Academy_Learner__c.Academy_User_Id__c` = Neon Auth user id |
   | seat (`app.org_member`) | **Seat Assignment** (role, status, joined on, Learner lookup); a seat that disappears is set to *freed*, never deleted | `Seat_Assignment__c.Academy_Seat_Key__c` = `orgId:userId` |

   "Active" = signed up or learned in the last 90 days, ever held Pro or a seat,
   or synced before. REST API sObject Collections upsert (`PATCH
   /composite/sobjects/{type}/{externalIdField}`, 200 records a call,
   `allOrNone: false`), backoff on 429/5xx, at most 400 records and 12 API calls
   a run (`SF_SYNC_MAX_RECORDS`, `SF_SYNC_MAX_CALLS`). No Bulk API, no logins:
   OAuth 2.0 **client credentials**. Three refused tokens in a row pause the
   hourly run for 24 hours.

### Deploy the metadata (one deploy)

New: object `Academy_Learner__c` (30 fields, layout, tab, list views *All* and
*Academy - Hot learners*), `Account.Academy_Org_Id__c`,
`Seat_Assignment__c.Academy_Seat_Key__c` + `Learner__c`, ten Lead fields, the
`Lead_Score__c` formula change, the `Academy_CRM_Access` additions and a new
permission set **Academy Site Sync** (for the integration user only). No Apex.

```bash
cd salesforce
sf org login web --alias crma-learning          # you, in the browser
sf project deploy start --source-dir crm --target-org crma-learning --wait 10 \
  --test-level RunSpecifiedTests --tests AcademyLeadEventsTest --tests AcademyPulseTest
node scripts/lead-field-ids.mjs --target-org crma-learning   # paste the printed map into LEAD_FIELDS
```

Then add the *Academy Learners* tab to the Sales app's navigation (App Manager →
Sales → Edit → Navigation Items), and for any team Account you created by hand,
type the site's org id (/admin → Teams) into **Academy org id** — otherwise the
first sync creates a second Account for that org.

### Set up the integration user and the External Client App (clicks, once)

1. **Integration user.** Setup → Users → New User. User License **Salesforce
   Integration**, Profile **Minimum Access - API Only Integrations**, email your
   own, username e.g. `site-sync@crmanalyticsacademy.com`. (No Salesforce
   Integration licence in the org? Use a Salesforce licence with a profile that
   has *API Only User* checked.)
2. On that user: Permission Set License Assignments → **Salesforce API
   Integration**; Permission Set Assignments → **Academy Site Sync**. Nothing else.
3. **External Client App.** Setup → External Client App Manager → New External
   Client App. Name *Academy Site Sync*, contact email yours, Distribution State
   *Local*. Enable OAuth: callback `https://login.salesforce.com/services/oauth2/callback`
   (unused), scopes **Manage user data via APIs (api)** only. Flow Enablement:
   tick **Enable Client Credentials Flow** (accept the warning). Security: leave
   *Require secret for Web Server Flow* on; PKCE not needed. Create.
4. Policies tab → Edit → OAuth Policies: Permitted Users *Admin approved users
   are pre-authorized*, add the **Academy Site Sync** permission set; **Enable
   Client Credentials Flow** → Run As = the integration user; IP Relaxation
   *Enforce IP restrictions* is fine (the user has none). Save.
5. Settings tab → OAuth Settings → **Consumer Key and Secret** (it asks you to
   verify) → copy both.
6. Setup → My Domain → copy the URL (`https://<name>.my.salesforce.com`).
   Client credentials only works against My Domain, not login.salesforce.com.
7. On the site: `pnpm keys` (or `wrangler secret put`) for `SF_INSTANCE_URL`,
   `SF_CLIENT_ID`, `SF_CLIENT_SECRET`. Open /admin → Integrations → **Sync now**
   and read the run line. Errors show per record; nothing is retried more than
   once an hour.

To stop the sync at any time: delete `SF_CLIENT_SECRET` from the Worker, or
deactivate the External Client App. The Web-to-Lead path does not depend on it.

## What the org holds

| Piece | What it is for |
| --- | --- |
| Standard **Sales** app | Its own tabs plus Products, Price Books and Seat Assignments; the **Academy Sales Home** page (lifecycle funnel, hot and self-serve leads, open seat deals, customers, leads by source, seat pipeline) |
| Standard **Service Console** | Plus Seat Assignments, for helping members with their seats |
| GTM fields | `Lifecycle_Stage__c` (Lead → MQL → SQL → Opportunity → Customer → Churned) and `Motion__c` (self-serve / sales-led) on Lead, Account and Contact; `MRR__c`, `ARR__c`, `Customer_Since__c`, `Pro_Until__c`, `Points_Spent__c` on Account |
| **AcademyLeadTrigger** + `AcademyLeadEvents` | Folds the site's events into one record per person (below) |
| Record headers | Compact layouts *Academy* on Lead, Account and Opportunity — grade, score, lifecycle, motion, MRR in the highlights panel |
| **Record pages** (org default, every app) | *Academy Lead / Contact / Account / Opportunity Record Page*: highlights, the Academy widgets, details, activity, related lists |
| **LWC widgets** (`crm/main/default/lwc`) | **Academy Journey** (Lead, Contact, Account): the lifecycle path, motion, score and grade, first source, first page, pages read. **Academy Revenue** (Account): MRR, ARR, points spent, Pro days left, seats used. **Academy Seats** (Account): members, roles, status and the join code. **Academy Deal** (Opportunity): seats, points, list value per seat per month. No Apex — Lightning Data Service only |
| List views | Academy - Hot leads, Self-serve sign-ups, Seat requests (Lead); Open seat deals (Opportunity); Customers (Account) |
| Lead fields | Everything the site sends by Web-to-Lead: `Academy_Interest__c`, `Seats_Requested__c`, `Org_Type__c`, `Traffic_Source__c` (first source), `First_Landing_Page__c`, `Landing_Page__c` (asked from), `Views_Before_Lead__c`, `Academy_Lessons_Done__c`, `Academy_Points__c`, `Academy_Locale__c`, `Academy_User_Id__c` |
| `Lead_Score__c`, `Lead_Grade__c` | Formula, 0–100: interest (seats 40, consulting 30, set-up 20, other 10) + learning done (3 per lesson, max 30) + seats (20 for 20+, 10 for 5+) + 10 if they hold an account. Hot ≥ 60, Warm ≥ 30, Cold |
| Account fields | `Org_Type__c` (company / team / university), `Academy_Plan__c`, `Seats_Purchased__c`, `Seats_Used__c`, `Active_Seats__c` (roll-up), `Join_Code__c`, `Seat_Term_End__c` |
| Contact fields | `Academy_User_Id__c`, `Academy_Points__c`, `Is_Pro__c` |
| Opportunity fields | `Seats__c`, `Paid_In__c` (points / usd), `Points_Amount__c` |
| **Seat Assignment** object | One per member holding a seat (master-detail to Account, lookup to Contact, status, role, joined on) — mirrors `app.org_member` |
| Products | `ACAD-FREE`, `ACAD-PRO` (30 days), `ACAD-SEAT` (per seat per month) |
| Price books | **Standard** = the USD price each plan will have (0 / 12 / 15). **Academy Points** = the price in points today (0 / 1,000 / 1,000). The org's currency symbol shows; the number is points |
| Reports (folder *Academy CRM*) | Leads by source, Leads by interest, Seat pipeline |
| **Academy CRM Access** permission set | The app, the new object and every Academy field |

## The process, step by step

### 0. Self-serve, end to end (automatic)

Every event reaches Salesforce by Web-to-Lead with `Academy_Event__c` and the
person's `Academy_User_Id__c`; `AcademyLeadEvents` (a queued job the trigger
starts) folds it into their one record and deletes the duplicate:

| On the site | In Salesforce |
| --- | --- |
| **Signs up** | a Lead, Lifecycle **Lead**, Motion **Self-serve**, with first source, first page and pages read |
| **Subscribes to Pro** (Stripe) | converted: Account (Customer, Self-serve, Plan Pro, **MRR 15** or 12.50 for yearly), Contact, Closed Won deal *Pro — monthly/yearly* in USD |
| **Buys a team** (Stripe, per seat) | Account (Plan Seats, Org type Team, Seats purchased, **MRR seats × 10**), Closed Won deal *Team — N seats* |
| **Asks to sponsor** (/sponsor) | Lead, interest **Sponsorship**, Lifecycle SQL, Sales-led, score 40+ — send the Stripe invoice from /admin → Revenue & sponsors |
| **Pays a sponsorship** (Stripe invoice) | Customer, Sales-led, Closed Won deal *Sponsorship — 7/30 days* in USD |
| **Buys a session pack** (retired points era) | the lead is **converted**: Account (Lifecycle **Customer**, Self-serve, Plan **Usage**, Sessions bought, Points spent, Customer since), Contact, and a **Closed Won** deal valued in points (`Session pack — 10 sessions`, Amount 100) |
| **Buys again** | another pack deal; Sessions bought and Points spent go up |
| **Asks for seats / help** | its own Lead, Lifecycle **SQL**, Motion **Sales-led** — a sales conversation, steps 1–8 below |

Duplicate rules alert on the same person twice, which is exactly what the job
reconciles, so its writes allow the save. The job runs inside Salesforce: no
login, nothing that can lock a user.

### 1. A visitor becomes a lead (automatic)

1. Someone reads the course. The site records their first source (referrer or
   `utm_source`) and first page — no cookies, no IP.
2. On `/pro` they **request seats** for their company, team or university, or ask
   for **Salesforce set-up help**, **consulting** or **mentoring**.
   Individuals who want Pro **buy it with points** — that never becomes a lead.
3. `POST /api/leads` stores the request in Neon (`app.lead`) and posts it to
   Salesforce by **Web-to-Lead** (no credentials): a Lead with `LeadSource = Web`,
   status *Open - Not Contacted*, and every Academy field filled.
4. The formula fields score and grade it the moment it lands.

### 2. Triage — every morning (5 minutes)

- Leads list view, sorted by **Lead score**. Hot first.
- Read `Traffic_Source__c` and `First_Landing_Page__c`: they tell you what the
  person was reading, which is what the first email should be about.
- Junk or students asking for free help → *Closed - Not Converted* with a reason
  in Description (keeps the reports honest).

### 3. Contact — within one working day

- Status → **Working - Contacted**.
- Log two tasks (the seed data shows the pattern):
  1. *Discovery call* — due in 2 days.
  2. *Send the visualiser and a Pro sample lesson* — due in 5 days.
- First email: reply to what they asked, link the lesson or visualiser they
  landed on, offer a 20-minute call.

### 4. Qualify — on the discovery call

For seats, write the answers on the lead before converting:

| Question | Field |
| --- | --- |
| How many people, and what kind of organisation? | `Seats_Requested__c`, `Org_Type__c` |
| Who will manage the seats (gets the join code)? | the converted Contact |
| When do they want to start, and for how long? | Opportunity *Close Date*, term |
| Points now, or invoiced in money later? | `Paid_In__c` |
| Is CRM Analytics licensed in their org? | Description — if not, it is a set-up lead too |

### 5. Convert

Convert the lead → **Account** (set `Org_Type__c`), **Contact**, **Opportunity**
named `<Org> — <n> seats`. On the opportunity: price book **Academy Points**,
product **Academy Seat**, quantity = seats × months, `Seats__c` = seats.

| Stage | Means |
| --- | --- |
| Prospecting / Qualification | interest confirmed, size not yet |
| Needs Analysis | seats, admin and start date known |
| Proposal/Price Quote | quote sent (points today, USD later) |
| Negotiation/Review | procurement, university approvals |
| **Closed Won** | seats granted on the site |
| Closed Lost | reason in Description |

### 6. Closed Won → seats on the site

1. In `/admin → Leads`, the matching lead has **Create org** — or use
   `/admin → Seats` → *New organisation* (name, kind, seats, months, admin email).
2. Copy the **join code** into `Account.Join_Code__c`; set `Seats_Purchased__c`,
   `Seat_Term_End__c`, `Academy_Plan__c = seats`.
3. Send the admin the join link (`/team?code=XXXXXXXX`). Each person who joins
   takes one seat and is Pro while the organisation is active.
4. Add a **Seat Assignment** per member (status *active*; *freed* when the admin
   frees the seat). `Active_Seats__c` counts them.

### 7. Grow and renew

- Report **Seat pipeline**, grouped by stage — weekly.
- Accounts where `Seat_Term_End__c` is within 60 days — a renewal call.
- Accounts where `Active_Seats__c` is close to `Seats_Purchased__c` — offer more seats.

### 8. Outbound prospecting (when the inbound is quiet)

Targets, in order of fit:

1. **Companies already using CRM Analytics** — `app/data/companies.json` lists
   only companies with a public source. Create a Lead per company, `LeadSource =
   Other`, `Traffic_Source__c = outbound`.
2. **Universities** with a business-analytics or Salesforce elective, and
   **placement cells** of engineering colleges (`Org_Type__c = university`).
3. **Salesforce partners** with an analytics practice (`Org_Type__c = team`).

Same stages, same reports; the source field keeps inbound and outbound apart.

## Deploying it (once, after `sf org login web`)

```bash
cd salesforce
# 1. metadata: fields, object, app, permission set, reports
sf project deploy start --source-dir crm --target-org crma-learning --wait 10

# 2. the Academy section on the existing layouts
sf project retrieve start --target-org crma-learning --target-metadata-dir .crm-layouts-md --unzip \
  --metadata "Layout:Lead-Lead Layout" "Layout:Account-Account Layout" \
             "Layout:Contact-Contact Layout" "Layout:Opportunity-Opportunity Layout"
mkdir -p .crm-layouts && for f in .crm-layouts-md/unpackaged/unpackaged/layouts/*.layout; do
  cp "$f" ".crm-layouts/$(basename "$f" .layout).layout-meta.xml"; done
node scripts/crm-layouts.mjs .crm-layouts
sf project deploy start --source-dir crm/main/default/layouts --target-org crma-learning --wait 10

# 3. products, price books and demo data — one Apex run. Assign the permission
#    set FIRST: anonymous Apex compiles against your own field access.
sf org assign permset --name Academy_CRM_Access --target-org crma-learning
sf apex run --file scripts/apex/crm-seed.apex --target-org crma-learning

# 4. the Web-to-Lead field ids → paste into server/utils/salesforce.ts (LEAD_FIELDS)
node scripts/lead-field-ids.mjs --target-org crma-learning
```

SaaS products with USD prices (Pro monthly/yearly, Team seat, Sponsorship 7/30 days):
`scripts/apex/crm-seed-saas.apex`. Earlier, usage products and demo packs:
`scripts/apex/crm-seed-usage.apex` (safe to re-run).

More demo records (a full funnel, self-serve customers with monthly Pro deals,
seat members, meetings, support cases): `scripts/apex/crm-seed-funnel.apex`.

Then once: `sf apex run --file scripts/apex/crm-gtm-backfill.apex` gives
existing records their lifecycle, motion and MRR.

**Make the Academy home active (two clicks):** Setup → Lightning App Builder →
*Academy Sales Home* → Edit → **Activation** → *App default* → Sales. (The
Metadata API refused the home override for this org, so it is not deployed.)

Remove the demo data with `scripts/apex/crm-seed-remove.apex`. Demo records are
found by their `example.com` website and `@example.com` emails.

**Deployed to `crma-learning` on 2026-10-30**: 41 components, the Academy section
on the four standard layouts, the seed (3 products, 2 price books, 5
organisations, 9 contacts, 6 deals, 5 seats, 13 leads, 10 tasks, one converted
lead) and `LEAD_FIELDS` wired into `server/utils/salesforce.ts`. Later the same
day: moved to the standard Sales and Service apps (the custom *Academy CRM*
app was deleted), GTM fields, the event automation (2 Apex tests passing),
compact layouts, list views, report charts and the home page.

Web-to-Lead must be enabled (*Setup → Web-to-Lead*). Do **not** add validation
rules on Lead: Web-to-Lead drops a lead that fails one, silently.

## From points to money (later)

Nothing in the process changes. Turn on a payment processor on the site, switch
new opportunities to the **Standard** price book and `Paid_In__c = usd`; the
products and stages stay. The points ledger on the site (`app.points_ledger`)
keeps working beside it.
