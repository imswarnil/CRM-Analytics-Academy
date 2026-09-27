---
title: "Organic Search Health"
description: "Whether organic clicks are falling because rank slipped or because the answer is now given above the links — rank bands, AI overview exposure and effective CTR across 2,449 keyword-weeks."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Marketing"
difficulty: "Intermediate"
publishedAt: "2026-09-27"
datasets:
  - "seo_keywords.csv"
  - "web_sessions.csv"
kpis:
  - name: "Effective CTR"
    formula: "sum(Clicks) / sum(Impressions)"
    note: "Aggregate both parts then divide. Averaging per-keyword CTR weights a keyword with 12 impressions the same as one with 40,000."
  - name: "AI Overview Exposure"
    formula: "count(InAIOverview = true) / count(all keyword-weeks)"
    note: "The share of your keyword surface where an AI answer sits above the links. This is the number that explains a click decline no rank report can."
  - name: "Clicks per Rank Point"
    formula: "sum(Clicks) / count(keywords) within a position band"
    note: "Banded rather than per-position, because position 4.2 and 4.8 are the same business situation and separate rows in the data."
recipe:
  - step: "Band the positions in the recipe"
    detail: "1-3, 4-10, 11-20, 21+. Fixed bands rather than quartiles, so period comparison stays meaningful."
  - step: "Join sessions on landing page and week"
    detail: "No shared key exists — the join is on page and date, which is the standard difficulty of demand analytics."
  - step: "Split the trend by AI-overview presence"
    detail: "Two lines: keywords with an AI answer above them, and keywords without. The divergence is the whole finding."
  - step: "Add a keyword table sorted by lost clicks"
    detail: "Ten rows, with rank change and overview flag beside them, so the content lead leaves with a work list rather than a feeling."
techniques:
  - "Banding"
  - "Date joins"
  - "Rate metrics"
  - "Cohorting"
---

Built step by step in the course: **[Build: Organic Search When Answers Sit Above the Links](/demand-analytics/seo-in-the-ai-era)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
