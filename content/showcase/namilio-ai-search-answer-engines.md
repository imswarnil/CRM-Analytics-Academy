---
title: "AI Search & Answer Engines"
description: "Whether assistants name you when somebody asks for a recommendation — share of voice, recommendation rate and citation rate across 5,400 prompt runs, split by prompt intent."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Marketing"
difficulty: "Advanced"
publishedAt: "2026-09-28"
datasets:
  - "llm_visibility.csv"
  - "seo_keywords.csv"
  - "web_sessions.csv"
kpis:
  - name: "Share of Voice"
    formula: "count(BrandMentioned = true) / count(all prompt runs)"
    note: "The denominator is every run, not only the runs that mentioned somebody. Filtering to mentions first turns a 12% share into a flattering 40% and nobody notices."
  - name: "Recommendation Rate"
    formula: "count(IsRecommended = true) / count(BrandMentioned = true)"
    note: "Being named is not being recommended. A high mention rate with a low recommendation rate is a specific, fixable content problem rather than a visibility one."
  - name: "Answer-Side Click Loss"
    formula: "clicks on keywords with an AI overview vs. matched keywords without"
    note: "The number that explains a traffic decline no rank report can: you held position and the answer was given above the links."
recipe:
  - step: "Keep prompt-run grain and bucket by intent"
    detail: "One row per prompt per model per run. Bucket prompts into comparison, how-to and vendor-selection clusters in the recipe so every rate means the same thing on every chart."
  - step: "Compute every rate from summed parts"
    detail: "sum over sum, never an average of per-run rates — a prompt run forty times must not weigh the same as one run twice."
  - step: "Join the SEO side on keyword and week"
    detail: "No shared key exists between assistant visibility and organic search, so the join is on keyword and date. That is the difficulty, and it is worth doing: the two stories only make sense together."
  - step: "Put run counts beside every rate"
    detail: "A cluster with nine runs showing 60% recommendation is noise, and it will be quoted as evidence. Rates without volumes are how a bad reading survives review."
techniques:
  - "Bucketing"
  - "Rate metrics"
  - "Date joins"
  - "Volume beside rate"
---

Extends **[Build: AI Search Visibility](/demand-analytics/ai-search-visibility)** with the answer-engine side of organic search from **[Build: Organic Search When Answers Sit Above the Links](/demand-analytics/seo-in-the-ai-era)**. The two together answer the question a marketing lead actually has: if assistants are becoming the front door, are we in the room.
