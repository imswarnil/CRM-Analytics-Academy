---
title: "ARR Waterfall & Net Retention"
description: "Where the month's ARR came from and where it went — new, expansion, contraction and churn as one bridge, with net and gross retention side by side."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Finance"
difficulty: "Advanced"
publishedAt: "2026-09-27"
datasets:
  - "arr_snapshots.csv"
  - "accounts.csv"
kpis:
  - name: "Net New ARR"
    formula: "NewARR + ExpansionARR − ContractionARR − ChurnedARR, per month"
    note: "The movement columns are recorded in the snapshot rather than derived. If they are all zero the field was not synced, the chart still renders, and every movement collapses into one net number."
  - name: "Net Revenue Retention"
    formula: "(Opening + Expansion − Contraction − Churn) / Opening, cohort present at period start"
    note: "Excludes new business deliberately — including it measures sales rather than retention. Fix the cohort at the start of the window or NRR inflates invisibly."
  - name: "Gross Revenue Retention"
    formula: "(Opening − Contraction − Churn) / Opening"
    note: "Cannot exceed 100% by construction. NRR 112 with GRR 108 is a healthy base; NRR 112 with GRR 94 is a leaking bucket refilled by a few expansions."
recipe:
  - step: "Load arr_snapshots at month × account grain"
    detail: "1,579 rows, the same account eighteen times. Every query must pick a month or group by one — summing across all rows gives eighteen years of revenue."
  - step: "Verify the bridge arithmetic on one month"
    detail: "Opening plus movements must equal closing. If it does not, a filter is excluding rows or an account row is duplicated."
  - step: "Compute NRR and GRR from a fixed cohort"
    detail: "Accounts present at the start of the window, in both numerator and denominator."
  - step: "Split retention by segment"
    detail: "A blended NRR lets one bleeding segment hide behind another's growth for quarters."
techniques:
  - "Snapshots"
  - "Waterfalls"
  - "Cohorting"
  - "Rate metrics"
---

Built step by step in the course: **[Build: The ARR Waterfall and Net Retention](/revops-analytics/arr-waterfall-and-nrr)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
