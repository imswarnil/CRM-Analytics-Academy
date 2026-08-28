---
title: "Sales Pipeline Health"
description: "A single-screen read on pipeline coverage, slippage and win rate — the four numbers a sales leader actually asks about in a forecast call."
image: "/showcase/placeholder.svg"
author: "CRM Analytics Academy"
authorUrl: "https://github.com/imswarnil/CRM-Analytics-Academy"
domain: "Sales"
difficulty: "Intermediate"
publishedAt: "2026-08-28"
datasets:
  - "Opportunity"
  - "User"
  - "Account"
kpis:
  - name: "Pipeline Coverage"
    formula: "sum(Amount) [open] / sum(Quota) [current quarter]"
    note: "Coverage under 3x this late in the quarter is the signal to go build pipeline, not to re-forecast."
  - name: "Win Rate"
    formula: "count() [IsWon] / count() [IsClosed]"
    note: "Closed-only denominator. Including open deals makes the rate drift down all quarter for no real reason."
  - name: "Slipped Amount"
    formula: "sum(Amount) where CloseDate moved out of the quarter at least once"
    note: "Needs a dataflow field that snapshots the original CloseDate — CRM Analytics can't see history on its own."
  - name: "Average Deal Age"
    formula: "avg(daysBetween(CreatedDate, toDate(now())))"
    note: "Filtered to open deals only, otherwise closed-won deals drag the average down and it looks healthy."
recipe:
  - step: "Build the dataset at opportunity grain"
    detail: "One row per opportunity, with Account and Owner brought on as lookups. Never join to line items here — it multiplies rows and every sum doubles."
  - step: "Snapshot CloseDate for slippage"
    detail: "Slippage is a history question and the Opportunity object only stores the current value. Append a dated snapshot each night so you can compare."
  - step: "Lay out four KPIs across the top"
    detail: "Coverage, win rate, slipped amount, deal age. Number widgets with conditional formatting — red below target, not merely coloured."
  - step: "Facet everything to one date toggle"
    detail: "A single quarter selector driving every widget. Two independent date filters on one dashboard is how numbers stop reconciling."
techniques:
  - "Dataflow"
  - "Lookups"
  - "Conditional Formatting"
  - "Faceting"
  - "Compare Table"
  - "Date Toggle"
---

# Sales Pipeline Health

::note
This is a **worked example**, not a community submission — it exists so you can see the
shape a showcase entry takes before writing your own. Replace the placeholder image with a
real screenshot when you submit yours.
::

## What it measures

A forecast call almost always comes down to four questions: *do we have enough pipeline,
are we winning what we work, what moved out, and how long is this taking?* This dashboard
answers those four and deliberately nothing else. Every widget that didn't answer one of
them got cut.

## Why the grain matters here

The dataset is one row per **opportunity**. That sounds obvious until someone asks to see
products, at which point the temptation is to join `OpportunityLineItem` into the same
dataset. Do that and one opportunity becomes five rows, and every `sum(Amount)` on the
dashboard is silently wrong.

If you need product detail, build a **second** dataset at line-item grain and link to it
from this dashboard. Two datasets with honest grains beat one dataset that quietly
double-counts.

## The part that is not obvious

Slippage is the only KPI here that CRM Analytics cannot compute from live data. `CloseDate`
holds today's value — the fact that a deal was originally committed to last quarter is not
stored anywhere you can query. You need a nightly snapshot appended to a history dataset,
then a comparison between the earliest snapshot and the current row.

Budget real time for that one. It is usually the whole reason a "quick pipeline dashboard"
takes a week.
