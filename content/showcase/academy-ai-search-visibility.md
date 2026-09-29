---
title: "AI Search Visibility (GEO)"
description: "When buyers ask an assistant about the category, is the Academy in the answer — share of voice, recommendation rate and citation rate across 5,400 prompt runs."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Marketing"
difficulty: "Intermediate"
publishedAt: "2026-09-27"
datasets:
  - "llm_visibility.csv"
kpis:
  - name: "Share of Voice"
    formula: "count(BrandMentioned = true) / count(all runs)"
    note: "The denominator is every run of every prompt, not only the runs that mentioned somebody. Filtering to mentions first turns a 12% share into a flattering 40%."
  - name: "Recommendation Rate"
    formula: "count(IsRecommended = true) / count(BrandMentioned = true)"
    note: "Being named is not being recommended. Splitting these two is the point of the dashboard — a high mention rate with a low recommendation rate is a specific, fixable problem."
  - name: "Citation Rate"
    formula: "count(CitedUrl is not empty) / count(BrandMentioned = true)"
    note: "Which of your pages the assistant is willing to cite. This is the metric content work actually moves."
recipe:
  - step: "Load llm_visibility at prompt-run grain"
    detail: "One row per prompt per model per run. Say the grain out loud before joining anything — every rate here has a different denominator and mixing them is the main hazard."
  - step: "Bucket prompts into clusters in the recipe"
    detail: "Comparison prompts, how-to prompts, vendor-selection prompts. Bucket once in a transform node so every chart means the same thing by 'cluster'."
  - step: "Compute the three rates from aggregated parts"
    detail: "sum over sum, never an average of per-run rates — a prompt run 40 times must not weigh the same as one run twice."
  - step: "Chart trend by cluster, with run counts beside the rates"
    detail: "A cluster with nine runs showing 60% recommendation is noise. Rates without volumes are how a bad reading survives review."
techniques:
  - "Bucketing"
  - "Rate metrics"
  - "Trend analysis"
  - "Recipes"
---

Built step by step in the course: **[Build: AI Search Visibility](/demand-analytics/ai-search-visibility)**. Every number below has a
written definition, and the dataset README states the true totals so you can check your own
build against something independently true.
