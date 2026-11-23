# Daily CRM Analytics jobs

`/jobs` reads **`public/jobs.json`**, a static file, so the Worker does no
work. The page also shows these rules ("How these jobs get here") with the
numbers from the last run.

## The rules, in order

1. **Find.** Company boards in `boards.json` (Workday, Greenhouse, Lever,
   Ashby), Arbeitnow, and — when their keys are set — Adzuna, Jooble and
   SerpApi (Google Jobs + a web search of applicant-tracking systems).
2. **Match.** Keep posts whose title or description names CRM Analytics /
   Tableau CRM / Einstein Analytics / SAQL. "Salesforce" alone is not enough.
3. **Only the employer's own link.** Keep a job only when its apply URL is the
   company's own careers site (the host names the company), its
   applicant-tracking system (`ATS_HOSTS` in `fetch.mjs`: Greenhouse, Lever,
   Ashby, Workday, SmartRecruiters, iCIMS, Jobvite, Workable, Taleo,
   SuccessFactors, Oracle, BambooHR, Recruitee, Teamtailor, Personio, JOIN, …)
   or a LinkedIn job page (`linkedin.com/jobs/view/<id>`). A board's result is
   resolved to that link — Google Jobs' apply options (employer/ATS first, then
   LinkedIn), the board page's apply button, or where its redirect lands. No
   such link: the job is dropped. `source` records who owns the link
   ("Workday", "Company site", "LinkedIn"…), `via` where we found it.
   LinkedIn is **never** scraped or searched: a LinkedIn URL is only accepted
   when another source hands it over, and is only asked for its status.
4. **Check every link, every run** (new and kept), politely: one request at a
   time per host, 1.5 s apart (3 s for Workday), four hosts at once, browser
   user agent, redirects followed, 20 s timeout.
   - **expired**: 404/410; the ATS API says closed (Greenhouse, Lever, Ashby,
     Workday — including Workday's 403 "S22" for an unposted job, confirmed by
     a board search for its requisition id); a job URL redirected to a generic
     careers/search page; JSON-LD `validThrough` in the past; or the visible
     page text says "no longer accepting applications", "position has been
     filled"…
   - **unknown**: 403/429/999/5xx, timeouts, LinkedIn's sign-in wall. Never
     expired from those — LinkedIn answers robots with 999.
   - **live**: everything else.

   Each job carries `status`, `checkedAt`, `verifiedAt` (last seen live),
   `expiredAt`, `unknownRuns`, `reason`. Expired jobs stay **7 days** as "No
   longer active" (greyed, no apply button), then go; a job already closed the
   first time we see it is never added. Unknown **3 runs in a row** shows
   "Couldn't verify". Unknown never flips a job's state. Jobs also go 30 days
   after they were posted.

**Not used:** Remotive, Himalayas and Jobicy. Their API terms require every
apply button to send people through their own page (Himalayas' pages also sit
behind a bot challenge), which rule 3 cannot meet. Indeed and LinkedIn have no
public job API and forbid scraping.

## Running it

`.github/workflows/jobs.yml` runs every day at 03:30 UTC (09:00 IST), and by
hand from the Actions tab (tick *check_only* to only re-check links). Every run
rewrites the file (statuses and check times change), commits it and starts
the deploy.

```bash
node scripts/jobs/fetch.mjs                 # fetch, keep, check, write
node scripts/jobs/fetch.mjs --check         # only re-check the feed's links
node scripts/jobs/fetch.mjs --dry           # everything, printed, nothing written
VERBOSE=1 node scripts/jobs/fetch.mjs       # print every check
node scripts/jobs/fetch.mjs --status <url> [company]   # owner + check for one URL
node scripts/jobs/fetch.mjs --page <url>    # what one job page's JobPosting yields
```

## Sources and keys

| Source | Key | Notes |
|---|---|---|
| Company boards in `boards.json` | none | Workday, Greenhouse, Lever, Ashby; add a partner's board there |
| Arbeitnow | none | its `/apply` link redirects to the employer's posting |
| Adzuna | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | resolved through its redirect |
| Jooble | `JOOBLE_KEY` | resolved through its redirect |
| Google Jobs + the open web | `SERPAPI_KEY` | apply options pick the employer, then LinkedIn; a weekly web search of ATS sites reads each page's `JobPosting`. `SERPAPI_DAILY` (Actions variable, default 6) sets searches a day |

Keys go in GitHub → Settings → Secrets and variables → Actions. A source
without its key is skipped.

## Shape

```json
{ "updated": "ISO", "week": "2026-W48",
  "meta": { "generatedAt": "ISO", "checkedAt": "ISO",
    "counts": { "total": 0, "live": 0, "expired": 0, "unknown": 0, "unverified": 0 },
    "sources": [{ "name": "Workday", "n": 0 }], "found": [{ "name": "Company board", "n": 0 }],
    "dropped": { "notOwner": 0, "closedOnArrival": 0, "expiredGone": 0, "old": 0 },
    "rules": { "keepDays": 30, "expiredDays": 7, "unverifiedRuns": 3 } },
  "jobs": [
  { "id": "hash of the url", "title": "", "company": "", "location": "", "remote": true,
    "country": "US", "level": "junior|mid|senior|lead", "posted": "2026-11-18",
    "url": "the employer's posting", "source": "Workday", "via": "Company board",
    "skills": ["SAQL"], "status": "live|expired|unknown", "checkedAt": "ISO",
    "verifiedAt": "ISO", "expiredAt": "ISO", "unknownRuns": 0, "reason": "404" } ] }
```
