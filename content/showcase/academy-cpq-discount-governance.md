---
title: "CPQ & Discount Governance"
description: "Where margin is given away and what the approval process costs in cycle time — discount creep across quote versions, realised discount, and approval days by band."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Finance"
difficulty: "Advanced"
publishedAt: "2026-09-27"
datasets:
  - "quotes.csv"
  - "opportunities.csv"
  - "opportunity_products.csv"
  - "products.csv"
kpis:
  - name: "Realised Discount"
    formula: "(ListTotal − NetTotal) / ListTotal, final version only"
    note: "Final version only. Including every version averages in the opening offer and understates what was actually given away."
  - name: "Discount Creep"
    formula: "avg(DiscountPct) by version number"
    note: "The shape across versions 1, 2, 3 is the finding: how much a deal moves between the first quote and the signature."
  - name: "Approval Cost in Days"
    formula: "avg(ApprovalDays) by discount band"
    note: "Banded, because the decision is which threshold to move — and the answer is visible only when days are plotted against band."
recipe:
  - step: "Filter to the final quote version per opportunity"
    detail: "A max-version-per-deal aggregation before anything else. Skipping this is the single biggest error available on this dashboard."
  - step: "Band discounts in the recipe"
    detail: "0-10, 10-20, 20-30, 30%+. Fixed bands with the boundary rule written down, because somebody will land on exactly 30."
  - step: "Compute realised discount from summed parts"
    detail: "Sum list, sum net, then divide. Averaging per-quote discount rates weights a $5,000 quote like a $2M one."
  - step: "Chart approval days against band, with volumes"
    detail: "The deal-desk conversation is about removing a step, and that needs both the cost and the count of deals affected."
techniques:
  - "Version filtering"
  - "Banding"
  - "Weighted rates"
  - "Aggregate before join"
---

Built step by step in the course: **[Build: CPQ, Discounting and Deal Desk](/pipeline-analytics/cpq-and-discounting)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
