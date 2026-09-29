---
title: "Seat Utilisation & Commit Risk"
description: "Churn that arrives with no cancellation event: utilisation against commitment, the accounts fading below the threshold, and the ARR attached to them."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Service"
difficulty: "Advanced"
publishedAt: "2026-09-27"
datasets:
  - "usage_monthly.csv"
  - "accounts.csv"
  - "arr_snapshots.csv"
kpis:
  - name: "Utilisation"
    formula: "sum(UsedUnits) / sum(CommittedUnits) at the chosen grain"
    note: "Never an average of UtilizationPct — it weights an account with one committed seat the same as one with 3,500. And never roll up across offerings with different units: seats, seat-days, vouchers and hours do not add."
  - name: "Teams with Idle Seats"
    formula: "count(distinct accounts) where trailing utilisation < 55% AND falling"
    note: "The trend condition matters. A steady 50% account bought too much once and is not leaving; one that fell from 90% to 56% is."
  - name: "ARR at Risk"
    formula: "sum(ARR) over the flagged accounts"
    note: "Sum ARR from the account or the latest snapshot, not from monthly usage rows — joining usage to accounts fans out across products."
recipe:
  - step: "Load usage at month × account × offering grain"
    detail: "Three dimensions in the grain. Aggregating across any of them without saying which produces a meaningless rather than a wrong number."
  - step: "Verify the precomputed utilisation on one row"
    detail: "Used over committed. Trusting a precomputed rate without checking it once is how you inherit someone else's definition."
  - step: "Flag risk on level AND trend"
    detail: "Both conditions in the recipe, so every consumer of the dataset means the same thing by 'at risk'."
  - step: "Build the call list sorted by ARR at risk"
    detail: "Not by how bad the percentage is. The join to ARR exists to make that ordering possible."
techniques:
  - "Weighted rates"
  - "Trend flags"
  - "Aggregate before join"
  - "Exception tables"
---

Built step by step in the course: **[Build: Consumption and Commit Risk](/revops-analytics/consumption-and-commit-risk)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
