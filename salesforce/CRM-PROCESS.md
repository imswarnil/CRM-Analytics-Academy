# Academy CRM — how the Academy prospects and sells, in Salesforce

The learning org (`crma-learning`) doubles as the Academy's own CRM. Everything
in this file lives in `salesforce/crm/` (metadata) and `salesforce/scripts/`
(seed data, layout patch, field ids). It is **not** part of `academy/`, so
`academy-setup.mjs` never deploys it into a learner's org.

> The org was frozen once. Everything below is one deploy, one Apex run and one
> read query — no loops over the API, no scripted logins. If the CLI says the
> session expired, run `sf org login web --alias crma-learning` yourself.

## What the org holds

| Piece | What it is for |
| --- | --- |
| **Academy CRM** app | Home, Leads, Accounts, Contacts, Opportunities, Products, Price Books, Seat Assignments, Tasks, Reports, Dashboards |
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
sf project retrieve start --target-org crma-learning --output-dir .crm-layouts \
  --metadata "Layout:Lead-Lead Layout" "Layout:Account-Account Layout" \
             "Layout:Contact-Contact Layout" "Layout:Opportunity-Opportunity Layout"
node scripts/crm-layouts.mjs .crm-layouts
sf project deploy start --source-dir crm/main/default/layouts --target-org crma-learning --wait 10

# 3. products, price books and demo data — one Apex run (also assigns the permission set)
sf apex run --file scripts/apex/crm-seed.apex --target-org crma-learning

# 4. the Web-to-Lead field ids → paste into server/utils/salesforce.ts (LEAD_FIELDS)
node scripts/lead-field-ids.mjs --target-org crma-learning
```

Remove the demo data with `scripts/apex/crm-seed-remove.apex`.

Web-to-Lead must be enabled (*Setup → Web-to-Lead*). Do **not** add validation
rules on Lead: Web-to-Lead drops a lead that fails one, silently.

## From points to money (later)

Nothing in the process changes. Turn on a payment processor on the site, switch
new opportunities to the **Standard** price book and `Paid_In__c = usd`; the
products and stages stay. The points ledger on the site (`app.points_ledger`)
keeps working beside it.
