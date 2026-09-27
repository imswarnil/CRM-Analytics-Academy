---
title: "Campaign Performance"
description: "Which campaigns produce pipeline that closes, per dollar spent — cost per MQL, pipeline ROI and marketing ROI across 46 campaigns."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Marketing"
difficulty: "Intermediate"
publishedAt: "2026-09-27"
datasets:
  - "campaigns.csv"
  - "leads.csv"
  - "opportunities.csv"
  - "marketing_spend.csv"
kpis:
  - name: "Cost per MQL"
    formula: "Spend / count(leads where IsMQL = true)"
    note: "Guard the denominator: a campaign with spend and no MQLs divides by zero and poisons the whole series unless handled."
  - name: "Pipeline ROI"
    formula: "sum(opportunity Amount) / Spend"
    note: "Pipeline, not revenue — available months earlier. It is the leading indicator, and it flatters campaigns whose pipeline never closes."
  - name: "Marketing ROI"
    formula: "sum(closed-won Amount) / Spend"
    note: "The lagging truth. Shown beside pipeline ROI deliberately: the gap between them is a campaign's quality problem."
recipe:
  - step: "Aggregate leads and opportunities to campaign level first"
    detail: "Both are many-per-campaign. Collapse each before joining spend, or every spend figure repeats per lead."
  - step: "Cohort by campaign start, not by close date"
    detail: "A campaign that ran in March owns the pipeline it created, whenever that pipeline closes."
  - step: "Compute both ROI measures from summed parts"
    detail: "Never an average of per-campaign ratios — one tiny campaign with a freak deal would dominate."
  - step: "Table sorted by spend with both ROIs beside it"
    detail: "The decision is a budget split, so the table is the deliverable and the charts are context."
techniques:
  - "Aggregate before join"
  - "Cohorting"
  - "Rate metrics"
  - "Exception tables"
---

Built step by step in the course: **[Build: Campaign Performance](/demand-analytics/campaign-performance)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
