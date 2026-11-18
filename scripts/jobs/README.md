# Weekly CRM Analytics jobs

`/jobs` and the home-page teaser read **`public/jobs.json`** — a static file, so
the Worker does no work. A scheduled job (to be wired with Firecrawl) rewrites it
once a day.

## Shape

```json
{
  "updated": "2026-11-18T06:00:00Z",
  "week": "2026-W47",
  "jobs": [
    {
      "id": "stable-hash-of-url",
      "title": "CRM Analytics Developer",
      "company": "Acme",
      "location": "Remote · US",
      "remote": true,
      "country": "US",
      "level": "mid",
      "posted": "2026-11-18",
      "url": "https://…",
      "source": "linkedin.com",
      "skills": ["SAQL", "Recipes", "Einstein Discovery"]
    }
  ]
}
```

## The rhythm (to decide)

- Every day: add that day's new postings (newest first), keep the week's.
- Sunday: the page shows the whole week as a digest.
- Monday: start a new week; last week's file is archived as `public/jobs/<week>.json`.

## Running it (later)

A GitHub Action on a daily cron runs `node scripts/jobs/fetch.mjs` with
`FIRECRAWL_API_KEY` as a repository secret, commits `public/jobs.json`, and the
normal deploy publishes it. Only postings that mention CRM Analytics, Tableau CRM
or Einstein Analytics are kept; each must link to its original posting.
