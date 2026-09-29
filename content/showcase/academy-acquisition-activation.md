---
title: "Acquisition & Activation"
description: "Which channels bring visitors who actually start learning — from GA4-style session data through to a first lesson started, across 2.1 million sessions."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Marketing"
difficulty: "Beginner"
publishedAt: "2026-09-27"
datasets:
  - "web_sessions.csv"
  - "leads.csv"
kpis:
  - name: "Activation Rate"
    formula: "sum(CourseStarts) / sum(Sessions)"
    note: "Activation, not conversion. A channel can produce excellent sign-up volume and terrible activation, and only the second predicts revenue."
  - name: "Sessions to Lead"
    formula: "count(distinct leads) / count(sessions), by channel"
    note: "Cohort by session date, not by lead date. Cohorting on the outcome makes this month look catastrophic and last year look excellent."
  - name: "Channel Mix"
    formula: "share of sessions by channel, as a 100% stacked column by month"
    note: "Mix deliberately hides absolute size, so it ships beside a total-sessions tile or the reader concludes nothing grew."
recipe:
  - step: "Load sessions and classify channel in the recipe"
    detail: "One bucketing rule for channel, applied once, so 'Paid Social' means the same thing on every screen."
  - step: "Flag the activation event per session"
    detail: "A boolean computed in a formula node rather than in each widget's query."
  - step: "Aggregate to channel-month before charting"
    detail: "The dashboard is opened daily by several people; pre-aggregating is the difference between two seconds and twelve."
  - step: "Build the funnel on a log scale"
    detail: "Sessions to activation spans orders of magnitude; on a linear axis the last three stages are stubs."
techniques:
  - "Bucketing"
  - "Funnels"
  - "Pre-aggregation"
  - "Cohorting"
---

Built step by step in the course: **[Build: Acquisition — GA4 Channels Through to First Lesson Started](/demand-analytics/acquisition-and-ga4)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
