---
title: "Regional Demand & Coverage"
description: "Where there is demand the Academy is not converting, and whether that is a coverage problem or a fit problem — sessions, leads, revenue and AE headcount by region."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Sales"
difficulty: "Intermediate"
publishedAt: "2026-09-27"
datasets:
  - "web_sessions.csv"
  - "leads.csv"
  - "opportunities.csv"
  - "accounts.csv"
  - "marketing_spend.csv"
kpis:
  - name: "Regional Conversion Gap"
    formula: "(region's share of revenue) − (region's share of sessions)"
    note: "A negative gap means demand arrives and does not convert. This single derived number is what turns four separate charts into one argument."
  - name: "Coverage Ratio"
    formula: "count(SQL leads in region) / count(active AEs in region)"
    note: "The coverage half of the question. A large negative conversion gap with a high coverage ratio is a headcount problem; with a low one it is a fit problem."
  - name: "Revenue per Session"
    formula: "sum(closed-won Amount) / count(sessions), by region"
    note: "Normalised, because the largest region has the most of everything — a raw regional total is a population map."
recipe:
  - step: "Aggregate each source to region-month separately"
    detail: "Five datasets at five grains. Each is collapsed to one row per region per month BEFORE anything is combined, so nothing can fan out."
  - step: "Compute shares against a group-by-all total"
    detail: "Share of sessions and share of revenue both need the company total — the two-level query pattern."
  - step: "Derive the gap as a single formula field"
    detail: "Computed once in the recipe so every chart and the exec roll-up agree by construction."
  - step: "Rank regions in a sorted bar, not a map"
    detail: "Four regions is four categories. A map makes the reader compare shades of blue on shapes of different size; a sorted bar ranks them exactly."
techniques:
  - "Multi-source joins"
  - "Share of total"
  - "Normalisation"
  - "Pre-aggregation"
---

Built step by step in the course: **[Build: Regional and Geographic Demand](/demand-analytics/regional-demand)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
