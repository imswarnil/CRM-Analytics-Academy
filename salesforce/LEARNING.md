# Learn Salesforce on a real project: admin → developer → DevOps

This folder is the CRM a real business (CRM Analytics Academy) runs on. It holds
fields, formulas, layouts, record pages, a permission set, reports, an Apex
trigger and queueable job with tests, Lightning Web Components with Jest tests,
seed scripts and a CI/CD pipeline. Each module below covers one skill and points
at the files that already do it here, with an exercise to build next to them.

Work through it in order. Every exercise goes into **your own** org. Use a free
Developer Edition or a scratch org, never `crma-learning`. The CLI commands are
the same everywhere; only `--target-org` changes.

```
sf org login web --alias my-dev --set-default     # once, by hand, in the browser
```

> Never script a login. A loop of logins or API calls can freeze a user, and
> this project's own org was frozen once. The rules followed here: one deploy,
> one Apex run, one query at a time, and logins only by hand or from a single
> stored token (Module 9).

---

## Part 1 — Administrator

### Module 1 · The data model
**Read:** `crm/main/default/objects/` holds custom fields on Lead, Account,
Contact and Opportunity, plus one custom object, `Seat_Assignment__c`, with a
master-detail to Account and a lookup to Contact.
**Learn:** field types (text, number, picklist, date, checkbox, formula),
master-detail vs lookup (who owns the child, what happens on delete, roll-ups),
and API names (`__c`).
**Exercise:** create a `Course_Enrollment__c` object (master-detail to Contact)
with `Course__c` (picklist), `Progress__c` (percent) and `Completed_On__c`
(date). Build it in Setup first, then pull it into source:
`sf project retrieve start --metadata CustomObject:Course_Enrollment__c`.

### Module 2 · Formulas and roll-ups
**Read:** `objects/Lead/fields/Lead_Score__c.field-meta.xml` (0–100 score from
interest, lessons and seats) and `Lead_Grade__c` (Hot / Warm / Cold from the
score). `Account.Active_Seats__c` is a roll-up summary over
`Seat_Assignment__c`.
**Exercise:** add `Days_Since_Signup__c = TODAY() - Signup_Date__c` on Lead, and
a roll-up `Courses_Completed__c` on Contact (Module 1's object, filter
`Progress__c = 1`).

### Module 3 · Security: who sees what
**Read:** `permissionsets/Academy_CRM_Access.permissionset-meta.xml` grants the
app, the object and every field.
**Learn:** profiles vs permission sets vs permission set groups, org-wide
defaults, role hierarchy and sharing rules, field-level security.
**Exercise:** a read-only `Academy_CRM_Viewer` permission set. Assign it to a
second user and log in as them (Setup → Users → Login) to check what they see.

### Module 4 · The user interface
**Read:** `layouts/` (page layouts), `objects/*/compactLayouts/` (the
highlights panel), `flexipages/` (Lightning record pages and the Sales Home
page) and `applications/` (the standard Sales and Service apps, customised).
**Exercise:** add a "Hot leads" list view and a related list of seat
assignments on the Contact record page in Lightning App Builder, then retrieve
the flexipage and read the XML diff with `git diff`.

### Module 5 · Automation without code
Salesforce's rule is: use clicks before code. This project uses Apex because
the job converts leads and merges duplicates. Most automation should be Flow.
**Exercise (in your org):**
1. A **validation rule** on `Seat_Assignment__c`: Role is required when Status
   is Active.
2. A **record-triggered flow** on Lead (after save): when `Lead_Grade__c`
   becomes Hot, create a Task for the owner, "Call within 1 day".
3. An **approval process** on Opportunity: more than 50 seats needs approval.
Retrieve them all (`sf project retrieve start --metadata Flow ValidationRule`)
and commit them under `crm/`.

### Module 6 · Reports and dashboards
**Read:** `reports/Academy_CRM/` has four reports: leads by source, leads by
interest, the lifecycle funnel and the seat pipeline.
**Exercise:** a dashboard with those four reports as components, plus a
matrix report "Leads by source × grade". This connects to the course: the
same questions get much deeper answers in CRM Analytics (`academy/`, and the
`academy-setup.mjs` loader in `README.md`).

---

## Part 2 — Developer

### Module 7 · Apex: triggers, async jobs and tests
**Read, in this order:**
1. `triggers/AcademyLeadTrigger.trigger` — a *thin* trigger: it collects ids
   and enqueues a job. No logic lives in a trigger.
2. `classes/AcademyLeadEvents.cls` — a `Queueable` job: bulk-safe (one query
   per object, never in a loop), lead conversion, duplicate rules handled with
   `Database.DMLOptions`, `without sharing` used on purpose (the job runs for
   the site, not a person).
3. `classes/AcademyLeadEventsTest.cls` — `@IsTest`, test data built inside the
   test, `Test.startTest()/stopTest()` to run the queueable, assertions on the
   result.
**Learn:** governor limits, bulkification, sync vs async (future, queueable,
batch, schedulable), test isolation, the 75% coverage rule (aim for real
assertions, not just coverage).
**Exercise:** a `Schedulable` + `Batchable` class that marks Pro customers
whose `Pro_Until__c` has passed as `Churned`, with a test that inserts 200
accounts (bulk test).
```
sf apex run test --class-names AcademyLeadEventsTest --result-format human --code-coverage
```

### Module 8 · Lightning Web Components
**Read:** `lwc/academyJourney` and `lwc/academyDeal` read the record through
Lightning Data Service (`getRecord`, `getFieldValue`) with no Apex, and render
SLDS. Each `*.js-meta.xml` decides where a component may be placed.
**Tests:** `lwc/*/__tests__/*.test.js` mount the component, `emit` a record
through the `getRecord` test adapter and assert on the DOM.
```
npm install            # once, in salesforce/
npm test               # LWC Jest
npx eslint "crm/**/lwc/**/*.js"
```
**Exercise:** write tests for `academyRevenue` and `academySeats` the same way.
Then build `academyEnrollments`, which calls an `@AuraEnabled(cacheable=true)`
Apex method to list Module 1's enrollments, with an Apex test and a Jest test
that mocks the Apex import.

### Module 9 · Integration
**Read:** `../server/utils/salesforce.ts` posts every lead with Web-to-Lead.
There are no credentials and no API user, so nothing can lock a user. It is the
safest way in. `scripts/lead-field-ids.mjs` prints the field ids it maps.
**Learn:** Web-to-Lead vs REST API vs Platform Events vs Change Data Capture,
connected apps, named credentials (for Salesforce calling out).
**Exercise:** a named credential plus an Apex callout that posts a Slack
message when a seat deal closes (use a test webhook).

---

## Part 3 — DevOps: source control, CI/CD, releases

### Module 10 · Source-driven development
The org is not the source of truth; **git is**. Every change is metadata in
this folder, reviewed in a pull request, deployed by command.
```
sf project retrieve start --metadata Layout:Lead-Lead\ Layout   # org → git
sf project deploy start  --source-dir crm --dry-run             # what would change
sf project deploy validate --source-dir crm \
  --test-level RunSpecifiedTests --tests AcademyLeadEventsTest  # check-only, with tests
sf project deploy quick --job-id <id>                           # release the validated job
```
`sfdx-project.json` declares three package directories: `force-app`
(scratch), `academy` (shipped to learners' orgs) and `crm` (this business's
CRM only).

### Module 11 · The pipeline
**Read:** `../.github/workflows/salesforce.yml`.
- **checks**: every push and PR touching `salesforce/` runs the LWC lint and
  the Jest tests. It never logs in.
- **org**: started by hand (Actions → Salesforce CI/CD → Run workflow) with
  `validate` (check-only deploy and Apex tests) or `deploy` (validate, then
  quick-deploy that exact job). It runs in the `salesforce-org` GitHub
  environment, so you can require your own approval before it runs.

**Connect it (once, by hand):**
```
sf org display --target-org my-dev --verbose     # copy "Sfdx Auth Url" (force://…)
gh secret set SF_AUTH_URL --env salesforce-org   # paste it; never commit it
```
Use your own Developer Edition or a sandbox. That URL is a refresh token: it
logs in without a password, so treat it like one.

**Exercise:** add a `RunLocalTests` validation on pull requests to a sandbox,
add PMD Apex static analysis (`sf code-analyzer run`), and make a failing test
block the merge (branch protection → required status check).

### Module 12 · Scratch orgs and packaging
**Read:** `config/project-scratch-def.json`.
**Exercise:** enable Dev Hub in your Developer Edition, then:
```
sf org create scratch --definition-file config/project-scratch-def.json --alias scratch --duration-days 7
sf project deploy start --source-dir crm --target-org scratch
sf apex run --file scripts/apex/crm-seed.apex --target-org scratch
```
Then turn `crm` into an unlocked package (`sf package create`,
`sf package version create`) and install it into another org. That is how
real teams ship the same CRM to many orgs.

---

## Certifications this maps to

| Certification | Modules |
| --- | --- |
| Salesforce Administrator | 1–6 |
| Platform App Builder | 1, 2, 4, 5, 8 (declarative side) |
| Platform Developer I | 7, 8, 9 |
| Platform Developer II | 7 (async, bulk), 8, 9, 12 |
| Development Lifecycle and Deployment Architect | 10–12 |
| CRM Analytics and Einstein Discovery Consultant | the course itself (`../content/`) |

## Where the real business process is
`CRM-PROCESS.md` describes how the Academy actually sells with this CRM:
triage, contact, qualify, propose, close. Read it as the requirements document
the metadata above was built from.
