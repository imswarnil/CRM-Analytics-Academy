---
title: "Lead Overview"
description: "The screen an SDR team opens at 9am: which leads need working today, how fast the first touch is, and how many leads nobody has touched at all."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Sales"
difficulty: "Beginner"
publishedAt: "2026-09-27"
datasets:
  - "leads.csv"
  - "campaigns.csv"
  - "reps.csv"
kpis:
  - name: "Speed to First Touch"
    formula: "median(FirstTouchAt − CreatedAt) in minutes, over leads with a touch"
    note: "Excluding untouched leads flatters this badly — an untouched lead has infinite speed to lead, not zero. It ships beside the untouched count, always."
  - name: "Untouched Lead Age"
    formula: "today − CreatedDate, where TouchCount = 0"
    note: "The number the median hides. This is the widget the manager actually acts on."
  - name: "MQL Rate"
    formula: "count(IsMQL) / count(all leads), by source"
    note: "Cohort by lead created date. Cohorting on qualification date makes this month look broken and last year look excellent, with both numbers individually correct."
recipe:
  - step: "Load leads at lead grain and confirm 2,800 rows"
    detail: "The control number. If the count is wrong, stop and fix the load before building anything on it."
  - step: "Join reps and campaigns as lookups"
    detail: "Both are reference tables — joined to, never aggregated. One row per lead survives the join."
  - step: "Compute touch metrics in the recipe"
    detail: "Speed to touch and untouched flags as formula fields, so the definition is shared rather than re-derived per widget."
  - step: "Exception table of untouched leads, sorted by age"
    detail: "Ten rows, an empty state for the good days, and the owner beside each row so it is a work list rather than a report."
techniques:
  - "Lookups"
  - "Cohorting"
  - "Exception tables"
  - "Median vs mean"
---

Built step by step in the course: **[Build: The Lead Overview](/pipeline-analytics/lead-overview)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
