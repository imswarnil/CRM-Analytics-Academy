---
title: "Forecast & Commit"
description: "Three forecasts on one screen — category, weighted and historical — with forecast accuracy tracked as a metric in its own right."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Sales"
difficulty: "Advanced"
publishedAt: "2026-09-27"
datasets:
  - "opportunities.csv"
  - "reps.csv"
  - "arr_snapshots.csv"
kpis:
  - name: "Category Forecast"
    formula: "sum(Amount) where ForecastCategory in (Commit, Best Case)"
    note: "What the reps say. Reflects judgement, including optimism, and it is the number the meeting actually discusses."
  - name: "Weighted Forecast"
    formula: "sum(Amount × stage probability)"
    note: "What history says, applied mechanically. Diverges from the category forecast in a way that is itself the finding."
  - name: "Forecast Accuracy"
    formula: "actual / forecast, by period, tracked over time"
    note: "The metric nobody keeps. A team whose commit consistently lands above actual has a forecasting problem, which is a governance finding rather than a sales one."
recipe:
  - step: "Snapshot the forecast at period start"
    detail: "Accuracy is unanswerable without a record of what was forecast at the time — the object only knows today."
  - step: "Compute all three forecasts in one recipe"
    detail: "Shared definitions, so the three numbers differ because of method rather than because of implementation."
  - step: "Chart forecast, commit and actual as three lines"
    detail: "The gap between them is the message; a single forecast line hides the disagreement that matters."
  - step: "Track accuracy as its own trend"
    detail: "One chart, over quarters. This is what turns a forecast dashboard into a forecasting practice."
techniques:
  - "Snapshots"
  - "Weighted metrics"
  - "Period comparison"
  - "Metric contracts"
---

Built step by step in the course: **[Build: Forecast and Commit](/revops-analytics/forecast-and-commit)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
