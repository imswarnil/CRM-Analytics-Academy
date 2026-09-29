---
title: "Spend Efficiency, CAC & Payback"
description: "What it costs to acquire a customer and how long until the money comes back — blended, paid and segment CAC against gross margin, with payback in months."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Finance"
difficulty: "Advanced"
publishedAt: "2026-09-27"
datasets:
  - "marketing_spend.csv"
  - "leads.csv"
  - "opportunities.csv"
  - "accounts.csv"
  - "arr_snapshots.csv"
kpis:
  - name: "Blended CAC"
    formula: "total acquisition spend / count(new customers)"
    note: "Blended includes every channel, organic included. It is the honest company number and it hides which channel is expensive."
  - name: "Paid CAC"
    formula: "sum(Spend where IsPaid) / count(new customers from paid channels)"
    note: "The one a marketing team can act on. Reporting only blended is how an expensive channel stays funded."
  - name: "CAC Payback"
    formula: "CAC / (new ARR per customer × gross margin), in months"
    note: "Down is good — set the direction of goodness per metric or a default palette paints an improving quarter red."
recipe:
  - step: "Attribute spend to a cohort month"
    detail: "Spend in March buys customers who close in May. Decide the lag deliberately and write it into the definition; it is a choice, not a fact."
  - step: "Count new customers from the ARR snapshot"
    detail: "A new customer is a first MovementType of New in arr_snapshots — not a closed-won opportunity, which double-counts expansions."
  - step: "Compute payback from aggregated parts"
    detail: "Sum spend, sum new ARR, then divide. Averaging per-customer payback lets one tiny customer dominate the figure."
  - step: "Chart the trend with the target line"
    detail: "A CAC number without the payback target beside it cannot be judged, and the board asks about the target first."
techniques:
  - "Cohorting"
  - "Snapshots"
  - "Rate metrics"
  - "Direction of goodness"
---

Built step by step in the course: **[Build: Spend Efficiency, CAC and Payback](/demand-analytics/spend-efficiency)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
