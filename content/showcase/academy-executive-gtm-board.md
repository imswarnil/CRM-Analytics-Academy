---
title: "The Executive GTM Board"
description: "Nine numbers, one screen, no scrolling — the hardest build in the course and the smallest, assembled from thirteen dashboards and roughly 120 widgets."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Finance"
difficulty: "Advanced"
publishedAt: "2026-09-27"
datasets:
  - "arr_snapshots.csv"
  - "usage_monthly.csv"
  - "opportunities.csv"
  - "marketing_spend.csv"
  - "accounts.csv"
kpis:
  - name: "Net New ARR vs plan"
    formula: "NewARR + Expansion − Contraction − Churn, against the monthly plan"
    note: "Every tile carries a comparison and a direction. A number without one cannot be acted on, whatever its size."
  - name: "Net Revenue Retention"
    formula: "(Opening + Expansion − Contraction − Churn) / Opening"
    note: "The most predictive number on the board for a business selling into teams — expansion arrives without a new-business deal. 139.5% at the Academy, with gross retention beside it."
  - name: "CAC Payback"
    formula: "CAC / (new ARR per customer × gross margin), in months"
    note: "Down is good. Goodness is a property of the metric, not the direction, and a default palette turns an improving quarter into a wall of red."
recipe:
  - step: "Start by listing what is left off"
    detail: "Roughly 120 widgets exist across thirteen dashboards; nine things survive. The refusals are the deliverable, and defending them is the senior skill."
  - step: "Apply one test per tile"
    detail: "Would a 20% move change a decision this quarter? Four numbers pass at the Academy; the rest are downstream of one of them or too slow to act on."
  - step: "Let every chart explain a tile above it"
    detail: "The waterfall explains net new ARR; pipeline against plan explains coverage. A chart that explains nothing belongs on the dashboard it came from."
  - step: "Add definitions and a refresh timestamp"
    detail: "One text widget answering the only two questions anyone asks: why is this different from my number, and is this live."
techniques:
  - "Executive design"
  - "Subtraction"
  - "Snapshots"
  - "KPI design"
---

Built step by step in the course: **[Build: The Executive GTM Board](/revops-analytics/the-executive-gtm-board)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
