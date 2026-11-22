# Daily CRM Analytics jobs

`/jobs` and the home-page teaser read **`public/jobs.json`**, a static file, so
the Worker does no work.

## How it runs

`.github/workflows/jobs.yml` runs every day at 03:30 UTC (09:00 IST), and by hand
from the Actions tab:

1. `node scripts/jobs/fetch.mjs` asks each source, keeps postings that name
   CRM Analytics / Tableau CRM / Einstein Analytics / SAQL, merges them into
   the feed (30 days kept, duplicates dropped) and rewrites `public/jobs.json`.
2. If the file changed, it commits it and starts the deploy.

Locally: `node scripts/jobs/fetch.mjs --dry` prints what it would keep.

## Sources

Only public APIs and public job-board JSON. LinkedIn and Indeed have no public
job API and their terms forbid scraping.

| Source | Key | Notes |
|---|---|---|
| Himalayas, Remotive, Jobicy, Arbeitnow | none | remote and EU roles |
| Company boards in `boards.json` | none | Workday, Greenhouse, Lever, Ashby; add a partner's board there |
| Adzuna | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | 12 countries incl. US, UK, India; free at developer.adzuna.com |
| Jooble | `JOOBLE_KEY` | worldwide; free key at jooble.org/api/about |

Keys go in GitHub → Settings → Secrets and variables → Actions. A source
without its key is skipped.

## Shape

```json
{ "updated": "ISO time", "week": "2026-W47", "jobs": [
  { "id": "hash of the url", "title": "", "company": "", "location": "", "remote": true,
    "country": "US", "level": "junior|mid|senior|lead", "posted": "2026-11-18",
    "url": "original posting", "source": "himalayas.app", "skills": ["SAQL"] } ] }
```
