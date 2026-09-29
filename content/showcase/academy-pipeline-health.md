---
title: "Pipeline Health"
description: "What an AE and their manager open every Monday: open pipeline by stage, coverage against quota, and the stuck deals that get worked this week."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Sales"
difficulty: "Intermediate"
publishedAt: "2026-09-27"
datasets:
  - "opportunities.csv"
  - "opportunity_products.csv"
  - "reps.csv"
kpis:
  - name: "Pipeline Coverage"
    formula: "sum(open Amount for the quarter) / quota for the quarter"
    note: "Say which quota. Rep quotas sum above the company target by design, so coverage against rep quota and against company target are different numbers."
  - name: "Days in Current Stage"
    formula: "today − StageEnteredDate"
    note: "Needs a stage-entry date. Against last-modified date this measures editing activity, so a deal somebody touched yesterday looks fresh after four months in one stage."
  - name: "Weighted Pipeline"
    formula: "sum(Amount × Probability)"
    note: "Useful and easily over-trusted: stage probabilities are averages from history, and a single large deal at 80% moves this more than twenty small ones."
recipe:
  - step: "Filter to New Business"
    detail: "608 opportunities include renewals that win 77% of the time. Leave them in and the funnel looks healthy and describes nothing about selling."
  - step: "Aggregate product lines before joining"
    detail: "1,192 lines against 608 deals. Collapse the lines first or revenue nearly triples — the fan-out that defines this dataset."
  - step: "Order the funnel by stage, never by size"
    detail: "The sequence is the argument; the drop between adjacent stages is the finding."
  - step: "Stuck-deal table with an empty state"
    detail: "Ten rows sorted by days in stage, with the owner. Empty is the good outcome, and an empty table with no words reads as broken."
techniques:
  - "Aggregate before join"
  - "Funnels"
  - "Exception tables"
  - "Faceting"
---

Built step by step in the course: **[Build: Opportunity Management](/pipeline-analytics/opportunity-management)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
