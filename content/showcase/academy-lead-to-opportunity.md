---
title: "Lead → Opportunity Handoff"
description: "The screen marketing and sales open together: of the leads marketing qualifies, which sales accepts, how long the handoff takes, and why the rest are rejected."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Sales"
difficulty: "Intermediate"
publishedAt: "2026-09-27"
datasets:
  - "leads.csv"
  - "opportunities.csv"
  - "reps.csv"
kpis:
  - name: "MQL → SQL Acceptance Rate"
    formula: "count(IsSQL) / count(IsMQL), by source and month"
    note: "Cohort by MQL date. This is the number that decides whether the MQL definition changes or the acceptance behaviour does."
  - name: "Time in Handoff"
    formula: "SQLDate − MQLDate, median"
    note: "A long handoff is a queue, not a quality problem — and the two have completely different fixes."
  - name: "Rejection Rate by Source"
    formula: "count(IsMQL and not IsSQL) / count(IsMQL)"
    note: "Sorted descending, with volumes beside it. A source with 90% rejection on nine leads is noise; on nine hundred it is a budget decision."
recipe:
  - step: "Cohort leads by MQL date"
    detail: "Not by SQL date, and not by opportunity created date. This is the single most consequential choice on the dashboard."
  - step: "Join opportunities on ConvertedOpportunityId"
    detail: "A lookup — one opportunity per converted lead — so the lead grain survives."
  - step: "Compute acceptance and handoff time in the recipe"
    detail: "Shared definitions, because marketing and sales will each quote these numbers in the same meeting."
  - step: "Put both teams' views on one screen"
    detail: "Acceptance by source for marketing, rejection reasons for sales. One screen, one set of definitions, which is the point."
techniques:
  - "Cohorting"
  - "Lookups"
  - "Metric contracts"
  - "Rate metrics"
---

Built step by step in the course: **[Build: The Lead → Opportunity Handoff](/pipeline-analytics/lead-to-opportunity)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
