---
title: Admin — practice questions
domain: admin
quiz:
  - id: collaboration-index-1
    q: What is shared in CRM Analytics — dashboards or apps?
    options:
      - Individual dashboards, one at a time
      - Apps, which carry the sharing and hold the datasets, lenses and dashboards inside them
      - Datasets only
      - Nothing is shared; access is by profile
    answer: 1
    topic: collaboration
  - id: collaboration-index-2
    q: "The most common reason a good dashboard fails is:"
    options:
      - Slow queries
      - Nobody opens it, because it was never put where the work happens and nobody owns it
      - Wrong chart types
      - Too few widgets
    answer: 1
    topic: collaboration
  - id: collaboration-apps-and-sharing-1
    q: "Sharing an app with Viewer access lets someone:"
    options:
      - Edit its dashboards
      - See its contents, subject to row-level security on the underlying datasets
      - See all data regardless of predicates
      - Manage its sharing
    answer: 1
    topic: collaboration
  - id: collaboration-apps-and-sharing-2
    q: Why is 'one app per dashboard' a bad pattern?
    options:
      - It is slower
      - Sharing is managed per app, so dozens of apps means dozens of sharing lists to keep consistent
      - Apps have a hard limit
      - Dashboards cannot be moved
    answer: 1
    topic: collaboration
  - id: collaboration-apps-and-sharing-3
    q: "A user has an app shared with them but sees an empty dashboard. Most likely:"
    options:
      - Sharing failed
      - Row-level security — the predicate or inheritance filters their rows away
      - They need Editor access
      - The dashboard is broken
    answer: 1
    topic: collaboration
  - id: collaboration-subscriptions-and-notifications-1
    q: "The main advantage of a subscription over a dashboard is:"
    options:
      - It is more accurate
      - It reaches people who will never open the tool, in a place they already look
      - It bypasses row-level security
      - It refreshes faster
    answer: 1
    topic: collaboration
  - id: collaboration-subscriptions-and-notifications-2
    q: "A threshold notification that fires most days has become:"
    options:
      - Highly informative
      - Noise — people build a filter rule for it and stop reading, including on the day it matters
      - A performance problem
      - A security risk
    answer: 1
    topic: collaboration
  - id: collaboration-annotations-1
    q: "The main value of annotating a widget is:"
    options:
      - Decorating the dashboard
      - The explanation lives beside the number, so the next person to ask the same question finds the answer already there
      - It improves accuracy
      - It replaces documentation
    answer: 1
    topic: collaboration
  - id: collaboration-annotations-2
    q: A spike in one month is explained by a one-off migration. Where should that explanation live?
    options:
      - In a chat thread
      - As an annotation on the widget, where anyone who sees the spike will see it
      - In an email to the team
      - Nowhere; the data speaks for itself
    answer: 1
    topic: collaboration
  - id: collaboration-embedding-1
    q: Why embed a dashboard on a Salesforce record page?
    options:
      - It loads faster there
      - It removes the decision to go and look — the analytics are beside the record the person is already working on
      - It bypasses row-level security
      - Standalone dashboards cannot be shared
    answer: 1
    topic: collaboration
  - id: collaboration-embedding-2
    q: "An embedded dashboard should usually be:"
    options:
      - The same as the standalone one
      - Smaller and filtered to the record's context — two or three widgets, not twelve
      - Larger, since there is more space
      - Static, with no filters
    answer: 1
    topic: collaboration
  - id: collaboration-self-service-and-views-1
    q: What most determines whether self-service works?
    options:
      - The number of dashboards published
      - Dataset field metadata — business labels, sensible defaults, and hidden plumbing
      - How many users have Editor access
      - Chart variety
    answer: 1
    topic: collaboration
  - id: collaboration-self-service-and-views-2
    q: "A saved view is:"
    options:
      - A copy of the dashboard
      - A remembered state of it — filters and selections — so someone returns to their slice without re-clicking
      - A scheduled email
      - A security setting
    answer: 1
    topic: collaboration
  - id: collaboration-downloading-and-governance-1
    q: Someone exports a widget to a spreadsheet every week. What is the real risk?
    options:
      - Storage cost
      - The spreadsheet becomes a competing source of truth that ages and diverges, and it will be quoted against the dashboard
      - Slower queries
      - Nothing
    answer: 1
    topic: collaboration
  - id: collaboration-downloading-and-governance-2
    q: "The most common reason a dashboard stops being trusted is:"
    options:
      - A visual redesign
      - Nobody owns it — the schedule drifts, a field changes meaning, and the definitions go unmaintained
      - Too few widgets
      - Browser incompatibility
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-1
    q: "The unit of sharing in CRM Analytics is:"
    options:
      - The dashboard
      - The app
      - The dataset
      - The lens
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-2
    q: "Giving someone Viewer access to an app:"
    options:
      - Bypasses row-level security
      - Lets them see its contents, still subject to row-level security
      - Lets them edit dashboards
      - Lets them change sharing
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-3
    q: "One app per dashboard is a poor pattern because:"
    options:
      - Apps are limited
      - Sharing is managed per app, so many apps means many lists that drift apart
      - Dashboards load slower
      - Datasets cannot be shared
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-4
    q: "A threshold alert that fires most days has become:"
    options:
      - Very useful
      - Noise that people filter away, including when it matters
      - A security issue
      - A performance problem
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-5
    q: "An embedded dashboard on a record page should be:"
    options:
      - The full standalone dashboard
      - Two or three widgets, scoped to that record
      - Static with no filters
      - Larger than the standalone version
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-6
    q: "Self-service succeeds or fails mostly on:"
    options:
      - The number of dashboards
      - Dataset field metadata — labels, defaults, hidden plumbing, documented grain
      - How many editors there are
      - Chart variety
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-7
    q: "The real risk of routine exporting is:"
    options:
      - Storage
      - The spreadsheet becoming a competing truth that ages, diverges and gets quoted back
      - Query load
      - Licence usage
    answer: 1
    topic: collaboration
  - id: collaboration-graded-quiz-8
    q: "The highest-leverage governance habit is:"
    options:
      - An approval process for new dashboards
      - Deleting or archiving what nobody opens
      - Monthly design reviews
      - A naming convention
    answer: 1
    topic: collaboration
  - id: apis-and-automation-index-1
    q: "The strongest reason to reach for the API is:"
    options:
      - It is faster than the UI for one-off work
      - Work that is repetitive, scheduled, or has to happen identically many times
      - It bypasses row-level security
      - It unlocks extra chart types
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-index-2
    q: "API access to CRM Analytics data is subject to:"
    options:
      - Nothing — APIs bypass the security model
      - The same permissions and row-level security as the UI, evaluated for the authenticated user
      - A separate permission set only
      - Org-wide defaults only
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-the-rest-api-1
    q: "The right identity for a scheduled integration is:"
    options:
      - A developer's personal account
      - A dedicated integration user with narrow permissions and credentials in a secret store
      - The org's System Administrator
      - An anonymous token
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-the-rest-api-2
    q: "API version numbers in the URL matter because:"
    options:
      - They are cosmetic
      - Pinning a version keeps a script working when the platform updates, and lets you upgrade deliberately
      - They control rate limits
      - They determine security
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-running-saql-from-code-1
    q: "A script returns a different number from the dashboard showing 'the same' metric. The first thing to check is:"
    options:
      - The API version
      - Whether both are running as the same user, since row-level security applies to both
      - The network
      - The chart type
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-running-saql-from-code-2
    q: "A query with a relative date range ('last 90 days') run from a script is:"
    options:
      - Deterministic
      - Non-deterministic — it returns different rows tomorrow, which is right for a dashboard and a trap for reconciliation
      - Invalid
      - Cached
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-loading-data-1
    q: "The external data upload pattern is:"
    options:
      - One request containing the whole file
      - Declare a job with metadata, upload the data in parts, then signal completion
      - Upload then declare
      - Write rows one at a time
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-loading-data-2
    q: "The metadata sent with the job decides:"
    options:
      - The dashboard layout
      - Field names and types — including whether a date is a date and an ID is a dimension
      - Who can see the data
      - The refresh schedule
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-loading-data-3
    q: "An upload job that is never signalled complete results in:"
    options:
      - An automatic load after a timeout
      - Parts sitting in an incomplete job and no dataset appearing, with no obvious error
      - A partial dataset
      - An immediate failure
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-python-end-to-end-1
    q: Where should the integration user's credentials live in a Python job?
    options:
      - At the top of the script
      - In environment variables sourced from a secret store
      - In a config file in the repository
      - In a notebook cell
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-python-end-to-end-2
    q: "After a load completes, the job should:"
    options:
      - Exit immediately
      - Verify the dataset's row count against what was sent
      - Delete the source file
      - Refresh every dashboard
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-python-end-to-end-3
    q: Why chunk the upload rather than sending one payload?
    options:
      - It is required by the part-based upload flow, and it keeps individual requests within size limits
      - It is faster to write
      - It improves compression
      - It avoids authentication
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-automation-and-deployment-1
    q: "A scheduled job fails at 02:00. The most important design decision is:"
    options:
      - How fast it retries
      - Whether anybody sees the failure — a job failing into an unread log is a job that is not running
      - Which language it is written in
      - How it is formatted
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-automation-and-deployment-2
    q: "Exporting dashboard metadata on a schedule gives you:"
    options:
      - Faster dashboards
      - A change history — diffable records of what moved and when
      - Better security
      - More API allowance
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-1
    q: "API requests to CRM Analytics are subject to:"
    options:
      - No security checks
      - The authenticated user's permissions and row-level security
      - Org-wide defaults only
      - A separate analytics-only policy
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-2
    q: "The external data upload sequence is:"
    options:
      - Upload, then declare
      - Declare, upload in parts, signal completion
      - One request with the whole file
      - Row by row
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-3
    q: "An upload job never signalled complete results in:"
    options:
      - An automatic load after a timeout
      - No dataset, no error — the parts just sit there
      - A partial dataset
      - An immediate failure
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-4
    q: "The metadata sent with a load decides:"
    options:
      - Sharing
      - Field names and types
      - The schedule
      - Chart formatting
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-5
    q: "Incremental upsert's main risk is:"
    options:
      - It is slower
      - Silent drift when a change is missed — nothing errors, the data is just slightly wrong
      - It cannot handle deletes
      - It requires more API calls
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-6
    q: "A script's number differs from the dashboard's. Check first:"
    options:
      - The API version
      - Whether both run as the same user
      - The chart type
      - The browser
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-7
    q: "A reconciliation job should use:"
    options:
      - Relative date ranges, to stay current
      - Pinned absolute dates on both sides
      - No date filter
      - The dashboard's current selection
    answer: 1
    topic: apis-and-automation
  - id: apis-and-automation-graded-quiz-8
    q: "Exporting dashboard metadata on a schedule primarily gives you:"
    options:
      - Performance
      - A diffable change history
      - Extra API allowance
      - Automatic deployment
    answer: 1
    topic: apis-and-automation
---

Practice questions for the Admin domain of the CRM Analytics and Einstein Discovery Consultant exam.
