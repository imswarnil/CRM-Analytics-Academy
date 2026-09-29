---
title: "Inbound vs Outbound"
description: "The motion argument settled with data: per dollar and per rep hour, which motion produces revenue — and in which segment."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Sales"
difficulty: "Advanced"
publishedAt: "2026-09-27"
datasets:
  - "leads.csv"
  - "opportunities.csv"
  - "campaigns.csv"
  - "marketing_spend.csv"
kpis:
  - name: "Revenue per Dollar by Motion"
    formula: "sum(closed-won Amount) / sum(motion-attributed spend)"
    note: "Outbound's cost is headcount, not campaign spend, so the denominators are built differently for each motion — and that difference is the honest part of the comparison."
  - name: "Win Rate by Motion and Segment"
    formula: "count(won) / count(closed), split by motion and segment"
    note: "Blended win rate is the number that keeps this argument alive for years. The split usually shows each motion winning in a different segment."
  - name: "Cycle Length by Motion"
    formula: "median(CloseDate − CreatedDate) for won deals"
    note: "Median rather than mean: one enterprise deal running 400 days drags an average into meaninglessness."
recipe:
  - step: "Classify motion once, in the recipe"
    detail: "One rule for what counts as outbound, applied everywhere. This is the definition both sides will argue about, so it is written down first."
  - step: "Build the two cost denominators explicitly"
    detail: "Campaign spend for inbound; loaded rep cost for outbound. Neither is the other's denominator and pretending otherwise is the usual flaw in this comparison."
  - step: "Split every metric by segment"
    detail: "The whole finding is usually that the answer differs by segment. A single blended number ends no arguments."
  - step: "Present as a compare table, not duelling charts"
    detail: "Two columns, five rows, same definitions. The table is what makes it a decision rather than a debate."
techniques:
  - "Metric contracts"
  - "Segmentation"
  - "Compare tables"
  - "Median vs mean"
---

Built step by step in the course: **[Build: Inbound vs Outbound, Settled with Data](/pipeline-analytics/inbound-vs-outbound)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
